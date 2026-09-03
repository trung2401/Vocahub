import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecksModule } from './decks/decks.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { StudyModule } from './study/study.module';
import { ImportModule } from './import/import.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReviewLogsModule } from './review-logs/review-logs.module';
import { typeOrmOptions } from './config/typeorm.config';
import { validateEnvironment } from './config/env.validation';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    TypeOrmModule.forRoot(typeOrmOptions),
    DecksModule,
    VocabularyModule,
    StudyModule,
    ImportModule,
    UsersModule,
    AuthModule,
    ReviewLogsModule
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }]
})
export class AppModule {}
