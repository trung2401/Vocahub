import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshSessionEntity } from './entities/refresh-session.entity';

@Module({ imports: [UsersModule, TypeOrmModule.forFeature([RefreshSessionEntity]), PassportModule, JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.get<string>('JWT_ACCESS_SECRET') }) })], controllers: [AuthController], providers: [AuthService, JwtStrategy], exports: [AuthService] })
export class AuthModule {}
