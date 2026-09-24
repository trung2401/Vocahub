import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { toVocabularyResponse, type VocabularyResponseDto } from '../lib/domain-response';
import { DecksService } from '../decks/decks.service';
import { VocabularyEntryEntity } from '../vocabulary/entities/vocabulary-entry.entity';
import { RecordReviewDto } from './dto/record-review.dto';
import { scheduleReview } from './scheduling';
import { ReviewLogsService } from '../review-logs/review-logs.service';
import { ReviewLogEntity } from '../review-logs/entities/review-log.entity';

@Injectable()
export class StudyService {
  constructor(@InjectRepository(VocabularyEntryEntity) private readonly entries: Repository<VocabularyEntryEntity>, private readonly decks: DecksService, private readonly reviewLogs: ReviewLogsService, private readonly dataSource: DataSource) {}

  async recordReview(id: string, dto: RecordReviewDto, userId: string): Promise<VocabularyResponseDto> {
    const saved = await this.dataSource.transaction(async (manager) => {
      const entries = manager.getRepository(VocabularyEntryEntity);
      const entry = await entries.findOne({ where: { id }, relations: ['deck'], lock: { mode: 'pessimistic_write' } });
      if (!entry || entry.deck?.userId !== userId) throw new NotFoundException({ code: 'not_found', message: 'Từ vựng không tồn tại.' });
      const result = scheduleReview(entry, dto.rating);
      entry.status = result.status;
      entry.nextReviewAt = result.nextReviewAt;
      entry.lastReviewedAt = new Date();
      entry.correctCount = result.correctCount;
      entry.incorrectCount = result.incorrectCount;
      entry.lastRating = result.lastRating;
      const updated = await entries.save(entry);
      await this.reviewLogs.create({ vocabularyEntryId: updated.id, deckId: updated.deckId, userId, rating: dto.rating, mode: dto.mode ?? 'flashcard' }, manager.getRepository(ReviewLogEntity));
      return updated;
    });
    return toVocabularyResponse(saved);
  }

  async getDue(deckId: string, userId: string, now?: string): Promise<VocabularyResponseDto[]> {
    await this.decks.requireEntity(deckId, userId);
    const at = now ? new Date(now) : new Date();
    if (Number.isNaN(at.getTime())) throw new NotFoundException({ code: 'request_invalid', message: 'Thời điểm ôn tập không hợp lệ.' });
    const rows = await this.entries.createQueryBuilder('entry').where('entry.deck_id = :deckId', { deckId }).andWhere('entry.next_review_at <= :now', { now: at }).orderBy('entry.next_review_at', 'ASC').getMany();
    return rows.map(toVocabularyResponse);
  }
}
