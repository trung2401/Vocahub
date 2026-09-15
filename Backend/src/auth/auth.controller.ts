import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { UserEntity } from '../users/entities/user.entity';

const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' };

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.service.register(dto);
    this.setCookies(response, result.tokens);
    return result.user;
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.service.login(dto);
    this.setCookies(response, result.tokens);
    return result.user;
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException({ code: 'invalid_token', message: 'Phiên đăng nhập đã hết hạn.' });
    const result = await this.service.refresh(refreshToken);
    this.setCookies(response, result.tokens);
    return result.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: UserEntity) { return { id: user.id, email: user.email, createdAt: user.createdAt.toISOString() }; }

  @UseGuards(JwtAuthGuard)
  @Post('password')
  async changePassword(@CurrentUser() user: UserEntity, @Body() dto: ChangePasswordDto, @Res({ passthrough: true }) response: Response) {
    await this.service.changePassword(user.id, dto);
    response.clearCookie('access_token', cookieOptions);
    response.clearCookie('refresh_token', cookieOptions);
    return { ok: true };
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    try {
      const refreshToken = request.cookies?.refresh_token;
      if (refreshToken) await this.service.revokeRefreshToken(refreshToken);
      return { ok: true };
    } finally {
      response.clearCookie('access_token', cookieOptions);
      response.clearCookie('refresh_token', cookieOptions);
    }
  }

  private setCookies(response: Response, tokens: { accessToken: string; refreshToken: string }) {
    response.cookie('access_token', tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    response.cookie('refresh_token', tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  }
}
