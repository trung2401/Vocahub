import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeckEntity } from '../decks/entities/deck.entity';
import { VocabularyEntryEntity } from '../vocabulary/entities/vocabulary-entry.entity';
import { ImportBatchEntity } from './entities/import-batch.entity';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';

@Module({ imports: [TypeOrmModule.forFeature([DeckEntity, VocabularyEntryEntity, ImportBatchEntity])], controllers: [ImportController], providers: [ImportService] })
export class ImportModule {}
