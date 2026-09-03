import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { UsersService } from '../../users/users.service';
import type { UserEntity } from '../../users/entities/user.entity';

interface JwtPayload { sub: string; email: string; }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly users: UsersService) {
    super({ jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => request.cookies?.access_token ?? null]), ignoreExpiration: false, secretOrKey: config.get<string>('JWT_ACCESS_SECRET') });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const user = await this.users.findById(payload.sub);
    if (!user) throw new Error('user_not_found');
    return user;
  }
}
