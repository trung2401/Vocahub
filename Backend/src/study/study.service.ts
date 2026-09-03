import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toVocabularyResponse, type VocabularyResponseDto } from '../lib/domain-response';
import { DecksService } from '../decks/decks.service';
import { VocabularyEntryEntity } from '../vocabulary/entities/vocabulary-entry.entity';
import { RecordReviewDto } from './dto/record-review.dto';
import { scheduleReview } from './scheduling';
import { ReviewLogsService } from '../review-logs/review-logs.service';

@Injectable()
export class StudyService {
  constructor(@InjectRepository(VocabularyEntryEntity) private readonly entries: Repository<VocabularyEntryEntity>, private readonly decks: DecksService, private readonly reviewLogs: ReviewLogsService) {}

  async recordReview(id: string, dto: RecordReviewDto, userId: string): Promise<VocabularyResponseDto> {
    const entry = await this.entries.findOne({ where: { id }, relations: ['deck'] });
    if (!entry || entry.deck?.userId !== userId) throw new NotFoundException({ code: 'not_found', message: 'Từ vựng không tồn tại.' });
    const result = scheduleReview(entry, dto.rating);
    entry.status = result.status;
    entry.nextReviewAt = result.nextReviewAt;
    entry.lastReviewedAt = new Date();
    entry.correctCount = result.correctCount;
    entry.incorrectCount = result.incorrectCount;
    const saved = await this.entries.save(entry);
    await this.reviewLogs.create({ vocabularyEntryId: saved.id, deckId: saved.deckId, userId, rating: dto.rating, mode: dto.mode ?? 'flashcard' });
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
