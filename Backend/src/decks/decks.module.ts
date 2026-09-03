import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeckEntity } from './entities/deck.entity';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import { UsersModule } from '../users/users.module';

@Module({ imports: [TypeOrmModule.forFeature([DeckEntity]), UsersModule], controllers: [DecksController], providers: [DecksService], exports: [DecksService, TypeOrmModule] })
export class DecksModule {}
