import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import type { PublicUserDto } from '../users/dto/public-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthTokens { accessToken: string; refreshToken: string; }

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService, private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async register(dto: RegisterDto): Promise<{ user: PublicUserDto; tokens: AuthTokens }> {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create(dto.email, passwordHash);
    return { user: this.users.toPublicUser(user), tokens: await this.issueTokens(user.id, user.email) };
  }

  async login(dto: LoginDto): Promise<{ user: PublicUserDto; tokens: AuthTokens }> {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException({ code: 'invalid_credentials', message: 'Email hoặc mật khẩu không đúng.' });
    return { user: this.users.toPublicUser(user), tokens: await this.issueTokens(user.id, user.email) };
  }

  async refresh(refreshToken: string): Promise<{ user: PublicUserDto; tokens: AuthTokens }> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string }>(refreshToken, { secret: this.config.get<string>('JWT_REFRESH_SECRET') });
      const user = await this.users.findById(payload.sub);
      if (!user) throw new UnauthorizedException({ code: 'invalid_token', message: 'Phiên đăng nhập không hợp lệ.' });
      return { user: this.users.toPublicUser(user), tokens: await this.issueTokens(user.id, user.email) };
    } catch {
      throw new UnauthorizedException({ code: 'invalid_token', message: 'Phiên đăng nhập không hợp lệ.' });
    }
  }

  async issueTokens(id: string, email: string): Promise<AuthTokens> {
    const payload = { sub: id, email };
    return {
      accessToken: await this.jwt.signAsync(payload, { secret: this.config.get<string>('JWT_ACCESS_SECRET'), expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m') }),
      refreshToken: await this.jwt.signAsync(payload, { secret: this.config.get<string>('JWT_REFRESH_SECRET'), expiresIn: this.config.get<string>('JWT_REFRESH_TTL', '7d') })
    };
  }
}
