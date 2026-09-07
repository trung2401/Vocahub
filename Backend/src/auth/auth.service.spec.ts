import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  it('uses configured access and refresh TTL values when issuing tokens', async () => {
    const jwt = { signAsync: jest.fn().mockResolvedValueOnce('access').mockResolvedValueOnce('refresh') } as unknown as JwtService;
    const config = { get: jest.fn((key: string, fallback?: string) => ({ JWT_ACCESS_SECRET: 'a'.repeat(32), JWT_REFRESH_SECRET: 'r'.repeat(32), JWT_ACCESS_TTL: '45m', JWT_REFRESH_TTL: '21d' }[key] ?? fallback)) } as unknown as ConfigService;
    const service = new AuthService({} as UsersService, jwt, config);

    await expect(service.issueTokens('user-1', 'user@example.test')).resolves.toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    expect(jwt.signAsync).toHaveBeenNthCalledWith(1, { sub: 'user-1', email: 'user@example.test' }, expect.objectContaining({ secret: 'a'.repeat(32), expiresIn: '45m' }));
    expect(jwt.signAsync).toHaveBeenNthCalledWith(2, { sub: 'user-1', email: 'user@example.test' }, expect.objectContaining({ secret: 'r'.repeat(32), expiresIn: '21d' }));
  });
});
