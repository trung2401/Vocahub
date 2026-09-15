import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshSessionEntity } from './entities/refresh-session.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { createHash } from 'node:crypto';

describe('AuthService', () => {
  it('uses configured access and refresh TTL values when issuing tokens', async () => {
    const jwt = { signAsync: jest.fn().mockResolvedValueOnce('access').mockResolvedValueOnce('refresh') } as unknown as JwtService;
    const config = { get: jest.fn((key: string, fallback?: string) => ({ JWT_ACCESS_SECRET: 'a'.repeat(32), JWT_REFRESH_SECRET: 'r'.repeat(32), JWT_ACCESS_TTL: '45m', JWT_REFRESH_TTL: '21d' }[key] ?? fallback)) } as unknown as ConfigService;
    const service = new AuthService({} as UsersService, jwt, config);

    await expect(service.issueTokens('user-1', 'user@example.test')).resolves.toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    expect(jwt.signAsync).toHaveBeenNthCalledWith(1, { sub: 'user-1', email: 'user@example.test' }, expect.objectContaining({ secret: 'a'.repeat(32), expiresIn: '45m' }));
    expect(jwt.signAsync).toHaveBeenNthCalledWith(2, { sub: 'user-1', email: 'user@example.test' }, expect.objectContaining({ secret: 'r'.repeat(32), expiresIn: '21d' }));
  });

  it('rotates a refresh session and persists only the new token hash', async () => {
    const oldToken = 'refresh-old';
    const newToken = 'refresh-new';
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const jwt = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1', email: 'user@example.test', exp: Math.floor(expiresAt.getTime() / 1000) }),
      signAsync: jest.fn().mockResolvedValueOnce('access-new').mockResolvedValueOnce(newToken),
      decode: jest.fn().mockReturnValue({ exp: Math.floor(expiresAt.getTime() / 1000) })
    } as unknown as JwtService;
    const config = { get: jest.fn((key: string, fallback?: string) => ({ JWT_REFRESH_SECRET: 'r'.repeat(32), JWT_REFRESH_TTL: '7d' }[key] ?? fallback)) } as unknown as ConfigService;
    const users = {
      findById: jest.fn().mockResolvedValue({ id: 'user-1', email: 'user@example.test', createdAt: new Date() }),
      toPublicUser: jest.fn().mockReturnValue({ id: 'user-1', email: 'user@example.test', createdAt: new Date().toISOString() })
    } as unknown as UsersService;
    const sessions = {
      findOne: jest.fn().mockResolvedValue({ id: 'session-1', userId: 'user-1', tokenHash: createHash('sha256').update(oldToken).digest('hex'), expiresAt, revokedAt: null })
    };
    const managerRepository = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      create: jest.fn((value: unknown) => value),
      save: jest.fn().mockResolvedValue(undefined)
    };
    const manager = { getRepository: jest.fn().mockReturnValue(managerRepository) };
    const dataSource = { transaction: jest.fn(async (callback: (value: typeof manager) => Promise<unknown>) => callback(manager)) } as unknown as DataSource;
    const service = new AuthService(users, jwt, config, sessions as unknown as Repository<RefreshSessionEntity>, dataSource);

    await expect(service.refresh(oldToken)).resolves.toEqual(expect.objectContaining({ tokens: { accessToken: 'access-new', refreshToken: newToken } }));
    expect(managerRepository.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'session-1', userId: 'user-1' }), expect.objectContaining({ revokedAt: expect.any(Date) }));
    expect(managerRepository.save).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1', tokenHash: createHash('sha256').update(newToken).digest('hex'), revokedAt: null }));
  });

  it('revokes every session when a revoked refresh token is reused', async () => {
    const jwt = { verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1', email: 'user@example.test', exp: Math.floor(Date.now() / 1000) + 3600 }) } as unknown as JwtService;
    const config = { get: jest.fn((key: string, fallback?: string) => ({ JWT_REFRESH_SECRET: 'r'.repeat(32) }[key] ?? fallback)) } as unknown as ConfigService;
    const sessions = {
      findOne: jest.fn().mockResolvedValue({ id: 'session-1', userId: 'user-1', expiresAt: new Date(Date.now() + 3600000), revokedAt: new Date() }),
      update: jest.fn().mockResolvedValue({ affected: 2 })
    };
    const service = new AuthService({} as UsersService, jwt, config, sessions as unknown as Repository<RefreshSessionEntity>, {} as DataSource);

    await expect(service.refresh('replayed-token')).rejects.toMatchObject({ response: expect.objectContaining({ code: 'invalid_token' }) });
    expect(sessions.update).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }), expect.objectContaining({ revokedAt: expect.any(Date) }));
  });

  it('revokes all sessions after changing the password', async () => {
    const users = {
      findById: jest.fn().mockResolvedValue({ id: 'user-1', passwordHash: bcrypt.hashSync('old-password', 4) }),
      updatePassword: jest.fn().mockResolvedValue(undefined)
    } as unknown as UsersService;
    const sessions = { update: jest.fn().mockResolvedValue({ affected: 1 }) };
    const service = new AuthService(users, {} as JwtService, {} as ConfigService, sessions as unknown as Repository<RefreshSessionEntity>, {} as DataSource);

    await expect(service.changePassword('user-1', { currentPassword: 'old-password', newPassword: 'new-password' } as ChangePasswordDto)).resolves.toBeUndefined();
    expect(users.updatePassword).toHaveBeenCalledWith('user-1', expect.any(String));
    expect(sessions.update).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }), expect.objectContaining({ revokedAt: expect.any(Date) }));
  });
});
