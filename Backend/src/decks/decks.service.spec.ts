import { Repository } from 'typeorm';
import { DeckEntity } from './entities/deck.entity';
import { DecksService } from './decks.service';

describe('DecksService', () => {
  it('returns numeric per-deck summaries from one aggregate query', async () => {
    const queryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ deckId: 'deck-1', totalEntries: '12', dueEntries: '4', masteredEntries: '3', learningEntries: '8' }])
    };
    const repository = { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as unknown as Repository<DeckEntity>;
    const service = new DecksService(repository);

    await expect(service.listSummaries('user-1')).resolves.toEqual([{
      deckId: 'deck-1', totalEntries: 12, dueEntries: 4, masteredEntries: 3, learningEntries: 8
    }]);
    expect(queryBuilder.where).toHaveBeenCalledWith('deck.user_id = :userId', { userId: 'user-1' });
    expect(queryBuilder.getRawMany).toHaveBeenCalledTimes(1);
  });
});
