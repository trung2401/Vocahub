import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  it('uses configured JWT TTLs for cookie maxAge', async () => {
    const cookie = jest.fn();
    const response = { cookie } as unknown as Response;
    const service = {
      login: jest.fn().mockResolvedValue({
        user: { id: 'user-1' },
        tokens: { accessToken: 'access', refreshToken: 'refresh' }
      })
    } as unknown as AuthService;
    const config = {
      get: jest.fn((key: string, fallback?: string) => ({ JWT_ACCESS_TTL: '45m', JWT_REFRESH_TTL: '21d' }[key] ?? fallback))
    } as unknown as ConfigService;
    const controller = new AuthController(service, config);

    await controller.login({} as never, response);

    expect(cookie).toHaveBeenNthCalledWith(1, 'access_token', 'access', expect.objectContaining({ maxAge: 45 * 60 * 1000 }));
    expect(cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'refresh', expect.objectContaining({ maxAge: 21 * 24 * 60 * 60 * 1000 }));
  });
});
