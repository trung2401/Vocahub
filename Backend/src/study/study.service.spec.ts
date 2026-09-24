import { DataSource, Repository } from 'typeorm';
import { ReviewLogEntity } from '../review-logs/entities/review-log.entity';
import { ReviewLogsService } from '../review-logs/review-logs.service';
import { DecksService } from '../decks/decks.service';
import { VocabularyEntryEntity } from '../vocabulary/entities/vocabulary-entry.entity';
import { StudyService } from './study.service';

describe('StudyService', () => {
  it('runs entry update and review log in one transaction', async () => {
    const entry: VocabularyEntryEntity = {
      id: 'entry-1', deckId: 'deck-1', term: 'alpha', meaning: 'a', status: 'new',
      nextReviewAt: new Date(), lastReviewedAt: null, correctCount: 0, incorrectCount: 0, lastRating: null,
      deck: { userId: 'user-1' } as VocabularyEntryEntity['deck']
    } as VocabularyEntryEntity;
    const saved = { ...entry };
    const entryRepository = { findOne: jest.fn().mockResolvedValue(entry), save: jest.fn().mockResolvedValue(saved) } as unknown as Repository<VocabularyEntryEntity>;
    const logRepository = {} as Repository<ReviewLogEntity>;
    const manager = { getRepository: jest.fn((entity: unknown) => entity === VocabularyEntryEntity ? entryRepository : logRepository) };
    const dataSource = { transaction: jest.fn(async (callback: (value: typeof manager) => Promise<unknown>) => callback(manager)) } as unknown as DataSource;
    const reviewLogs = { create: jest.fn().mockRejectedValue(new Error('log_failed')) } as unknown as ReviewLogsService;
    const decks = {} as DecksService;
    const service = new StudyService(entryRepository, decks, reviewLogs, dataSource);

    await expect(service.recordReview('entry-1', { rating: 'good', mode: 'flashcard' }, 'user-1')).rejects.toThrow('log_failed');
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(entryRepository.findOne).toHaveBeenCalledWith({ where: { id: 'entry-1' }, relations: ['deck'], lock: { mode: 'pessimistic_write' } });
    expect(entryRepository.save).toHaveBeenCalled();
    expect(reviewLogs.create).toHaveBeenCalled();
  });

  it('validates deck ownership and orders due entries by next review time', async () => {
    const rows = [
      { id: 'late', nextReviewAt: new Date('2026-01-02T00:00:00.000Z') },
      { id: 'early', nextReviewAt: new Date('2026-01-01T00:00:00.000Z') }
    ] as VocabularyEntryEntity[];
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(rows)
    };
    const entries = { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as unknown as Repository<VocabularyEntryEntity>;
    const decks = { requireEntity: jest.fn().mockResolvedValue({ id: 'deck-1', userId: 'user-1' }) } as unknown as DecksService;
    const service = new StudyService(entries, decks, {} as ReviewLogsService, {} as DataSource);

    const result = await service.getDue('deck-1', 'user-1', '2026-01-01T12:00:00.000Z');

    expect(decks.requireEntity).toHaveBeenCalledWith('deck-1', 'user-1');
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('entry.next_review_at <= :now', { now: new Date('2026-01-01T12:00:00.000Z') });
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('entry.next_review_at', 'ASC');
    expect(result.map((entry) => entry.id)).toEqual(['late', 'early']);
  });
});
