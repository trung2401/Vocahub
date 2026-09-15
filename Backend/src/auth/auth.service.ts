import { Injectable, InternalServerErrorException, Optional, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import type { PublicUserDto } from '../users/dto/public-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshSessionEntity } from './entities/refresh-session.entity';
import { createId } from '../lib/id';

export interface AuthTokens { accessToken: string; refreshToken: string; }

interface RefreshJwtPayload { sub: string; email: string; exp?: number; }

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Optional() @InjectRepository(RefreshSessionEntity) private readonly sessions?: Repository<RefreshSessionEntity>,
    @Optional() private readonly dataSource?: DataSource
  ) {}

  async register(dto: RegisterDto): Promise<{ user: PublicUserDto; tokens: AuthTokens }> {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create(dto.email, passwordHash);
    return { user: this.users.toPublicUser(user), tokens: await this.issueTokensAndPersistSession(user.id, user.email) };
  }

  async login(dto: LoginDto): Promise<{ user: PublicUserDto; tokens: AuthTokens }> {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException({ code: 'invalid_credentials', message: 'Email hoặc mật khẩu không đúng.' });
    return { user: this.users.toPublicUser(user), tokens: await this.issueTokensAndPersistSession(user.id, user.email) };
  }

  async refresh(refreshToken: string): Promise<{ user: PublicUserDto; tokens: AuthTokens }> {
    try {
      const payload = await this.jwt.verifyAsync<RefreshJwtPayload>(refreshToken, { secret: this.config.get<string>('JWT_REFRESH_SECRET') });
      if (typeof payload.sub !== 'string' || !payload.sub || typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) throw this.invalidToken();
      const sessions = this.requireSessionsRepository();
      const session = await sessions.findOne({ where: { tokenHash: this.hashRefreshToken(refreshToken) } });
      if (!session || session.userId !== payload.sub) throw this.invalidToken();
      if (session.revokedAt) {
        await this.revokeAllSessions(session.userId);
        throw this.invalidToken();
      }
      const sessionExpiresAt = new Date(session.expiresAt).getTime();
      if (!Number.isFinite(sessionExpiresAt) || sessionExpiresAt <= Date.now()) throw this.invalidToken();
      const user = await this.users.findById(payload.sub);
      if (!user) throw this.invalidToken();

      const tokens = await this.issueTokens(user.id, user.email);
      const expiresAt = this.refreshTokenExpiresAt(tokens.refreshToken);
      let rotated = false;
      const dataSource = this.requireDataSource();
      await dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(RefreshSessionEntity);
        const result = await repository.update(
          { id: session.id, userId: session.userId, revokedAt: IsNull() },
          { revokedAt: new Date() }
        );
        if (result.affected !== 1) return;
        await repository.save(repository.create({
          id: createId(),
          userId: user.id,
          tokenHash: this.hashRefreshToken(tokens.refreshToken),
          expiresAt,
          revokedAt: null
        }));
        rotated = true;
      });

      if (!rotated) {
        await this.revokeAllSessions(session.userId);
        throw this.invalidToken();
      }
      return { user: this.users.toPublicUser(user), tokens };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw this.invalidToken();
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const sessions = this.requireSessionsRepository();
    const session = await sessions.findOne({ where: { tokenHash: this.hashRefreshToken(refreshToken) } });
    if (session) await this.revokeAllSessions(session.userId);
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.requireSessionsRepository().update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException({ code: 'invalid_credentials', message: 'Mật khẩu hiện tại không đúng.' });
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.users.updatePassword(userId, passwordHash);
    await this.revokeAllSessions(userId);
  }

  async issueTokens(id: string, email: string): Promise<AuthTokens> {
    const payload = { sub: id, email };
    return {
      accessToken: await this.jwt.signAsync(payload, { secret: this.config.get<string>('JWT_ACCESS_SECRET'), expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m') }),
      // A unique JWT id prevents two logins in the same second from sharing a session hash.
      refreshToken: await this.jwt.signAsync(payload, { secret: this.config.get<string>('JWT_REFRESH_SECRET'), expiresIn: this.config.get<string>('JWT_REFRESH_TTL', '7d'), jwtid: createId() })
    };
  }

  private async issueTokensAndPersistSession(id: string, email: string): Promise<AuthTokens> {
    const tokens = await this.issueTokens(id, email);
    const sessions = this.requireSessionsRepository();
    await sessions.save(sessions.create({
      id: createId(),
      userId: id,
      tokenHash: this.hashRefreshToken(tokens.refreshToken),
      expiresAt: this.refreshTokenExpiresAt(tokens.refreshToken),
      revokedAt: null
    }));
    return tokens;
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  private refreshTokenExpiresAt(refreshToken: string): Date {
    const decoded = this.jwt.decode(refreshToken);
    const exp = decoded && typeof decoded === 'object' ? (decoded as { exp?: unknown }).exp : undefined;
    if (typeof exp !== 'number' || !Number.isFinite(exp)) throw this.invalidToken();
    const expiresAt = new Date(exp * 1000);
    if (Number.isNaN(expiresAt.getTime())) throw this.invalidToken();
    return expiresAt;
  }

  private requireSessionsRepository(): Repository<RefreshSessionEntity> {
    if (!this.sessions) throw new InternalServerErrorException('Refresh session repository is not configured.');
    return this.sessions;
  }

  private requireDataSource(): DataSource {
    if (!this.dataSource) throw new InternalServerErrorException('Data source is not configured.');
    return this.dataSource;
  }

  private invalidToken(): UnauthorizedException {
    return new UnauthorizedException({ code: 'invalid_token', message: 'Phiên đăng nhập không hợp lệ.' });
  }
}
