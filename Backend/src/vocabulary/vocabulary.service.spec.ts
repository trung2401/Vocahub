import { DataSource, Repository } from 'typeorm';
import { DecksService } from '../decks/decks.service';
import { VocabularyEntryEntity } from './entities/vocabulary-entry.entity';
import { VocabularyService } from './vocabulary.service';

const savedEntry = (id: string, term: string, meaning: string): VocabularyEntryEntity => ({
  id, deckId: 'deck-1', term, meaning, pronunciation: null, example: null, partOfSpeech: null,
  status: 'new', lastReviewedAt: null, nextReviewAt: new Date('2026-01-01T00:00:00.000Z'),
  correctCount: 0, incorrectCount: 0, lastRating: null, createdAt: new Date('2026-01-01T00:00:00.000Z'), updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deck: {} as VocabularyEntryEntity['deck']
});

describe('VocabularyService', () => {
  it('supports bounded pagination without changing the response shape', async () => {
    const entries = { find: jest.fn().mockResolvedValue([]) } as unknown as Repository<VocabularyEntryEntity>;
    const decks = { requireEntity: jest.fn().mockResolvedValue({ id: 'deck-1', userId: 'user-1' }) } as unknown as DecksService;
    const service = new VocabularyService(entries, decks);

    await service.listByDeck('deck-1', 'user-1', { limit: 2, offset: 4 });

    expect(entries.find).toHaveBeenCalledWith({ where: { deckId: 'deck-1' }, order: { createdAt: 'ASC' }, skip: 4, take: 2 });
  });

  it('returns a filtered vocabulary page with total count', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[savedEntry('entry-1', 'alpha', 'first')], 8])
    };
    const entries = { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as unknown as Repository<VocabularyEntryEntity>;
    const decks = { requireEntity: jest.fn().mockResolvedValue({ id: 'deck-1', userId: 'user-1' }) } as unknown as DecksService;
    const service = new VocabularyService(entries, decks);

    await expect(service.listPage('deck-1', 'user-1', { limit: 2, offset: 4, search: 'alpha', status: 'learning' })).resolves.toMatchObject({
      total: 8, limit: 2, offset: 4, items: [{ id: 'entry-1', term: 'alpha' }]
    });
    expect(queryBuilder.where).toHaveBeenCalledWith('entry.deck_id = :deckId', { deckId: 'deck-1' });
    expect(queryBuilder.getManyAndCount).toHaveBeenCalledTimes(1);
  });

  it('checks ownership once and saves a bulk request in one transaction', async () => {
    const existing = [savedEntry('existing', 'Hello', 'Xin chào')];
    const created: VocabularyEntryEntity[] = [];
    const repository = {
      find: jest.fn().mockResolvedValue(existing),
      create: jest.fn((value) => value),
      save: jest.fn(async (rows: VocabularyEntryEntity[]) => { created.push(...rows); return rows; })
    } as unknown as Repository<VocabularyEntryEntity>;
    const manager = { getRepository: jest.fn().mockReturnValue(repository) };
    const dataSource = { transaction: jest.fn(async (callback: (value: typeof manager) => Promise<unknown>) => callback(manager)) } as unknown as DataSource;
    const decks = { requireEntity: jest.fn().mockResolvedValue({ id: 'deck-1', userId: 'user-1' }) } as unknown as DecksService;
    const service = new VocabularyService(repository, decks, dataSource);

    const result = await service.bulkCreate('deck-1', [
      { term: ' hello ', meaning: ' XIN CHÀO ' },
      { term: 'New', meaning: 'Meaning' },
      { term: 'new', meaning: 'meaning' }
    ], 'user-1');

    expect(decks.requireEntity).toHaveBeenCalledTimes(1);
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(repository.find).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(created).toHaveLength(3);
    expect(created.map(({ term, meaning }) => [term, meaning])).toEqual([
      ['hello', 'XIN CHÀO'], ['New', 'Meaning'], ['new', 'meaning']
    ]);
    expect(result).toHaveLength(3);
  });

  it('does not write when the transaction save fails', async () => {
    const repository = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((value) => value),
      save: jest.fn().mockRejectedValue(new Error('database unavailable'))
    } as unknown as Repository<VocabularyEntryEntity>;
    const manager = { getRepository: jest.fn().mockReturnValue(repository) };
    const dataSource = { transaction: jest.fn(async (callback: (value: typeof manager) => Promise<unknown>) => callback(manager)) } as unknown as DataSource;
    const decks = { requireEntity: jest.fn().mockResolvedValue({ id: 'deck-1', userId: 'user-1' }) } as unknown as DecksService;
    const service = new VocabularyService(repository, decks, dataSource);

    await expect(service.bulkCreate('deck-1', [{ term: 'alpha', meaning: 'a' }], 'user-1')).rejects.toThrow('database unavailable');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('hides entries owned by another user', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue({ id: 'entry-1', deck: { userId: 'user-2' } }) } as unknown as Repository<VocabularyEntryEntity>;
    const service = new VocabularyService(repository, {} as DecksService);

    await expect(service.requireEntity('entry-1', 'user-1')).rejects.toMatchObject({ response: { code: 'not_found' } });
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'entry-1' }, relations: ['deck'] });
  });
});
