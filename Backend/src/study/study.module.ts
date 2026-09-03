import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecksModule } from '../decks/decks.module';
import { VocabularyEntryEntity } from '../vocabulary/entities/vocabulary-entry.entity';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';
import { ReviewLogsModule } from '../review-logs/review-logs.module';

@Module({ imports: [TypeOrmModule.forFeature([VocabularyEntryEntity]), DecksModule, ReviewLogsModule], controllers: [StudyController], providers: [StudyService], exports: [StudyService] })
export class StudyModule {}
