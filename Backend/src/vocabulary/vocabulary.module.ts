import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecksModule } from '../decks/decks.module';
import { VocabularyEntryEntity } from './entities/vocabulary-entry.entity';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';

@Module({ imports: [TypeOrmModule.forFeature([VocabularyEntryEntity]), DecksModule], controllers: [VocabularyController], providers: [VocabularyService], exports: [VocabularyService, TypeOrmModule] })
export class VocabularyModule {}
