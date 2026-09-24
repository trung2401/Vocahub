import type { UserEntity } from '../users/entities/user.entity';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';

describe('VocabularyController', () => {
  it('passes optional pagination query parameters to the list service', async () => {
    const service = { listByDeck: jest.fn().mockResolvedValue([]) } as unknown as VocabularyService;
    const controller = new VocabularyController(service);

    await controller.list('deck-1', { id: 'user-1' } as UserEntity, '2', '4');

    expect(service.listByDeck).toHaveBeenCalledWith('deck-1', 'user-1', { limit: 2, offset: 4 });
  });

  it('passes the authenticated user to the bulk service', async () => {
    const service = { bulkCreate: jest.fn().mockResolvedValue([]) } as unknown as VocabularyService;
    const controller = new VocabularyController(service);
    const user = { id: 'user-1' } as UserEntity;

    await controller.bulk('deck-1', { entries: [{ term: 'alpha', meaning: 'a' }] }, user);

    expect(service.bulkCreate).toHaveBeenCalledWith('deck-1', [{ term: 'alpha', meaning: 'a' }], 'user-1');
  });

  it('passes filters and pagination to the page service', async () => {
    const service = { listPage: jest.fn().mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 }) } as unknown as VocabularyService;
    const controller = new VocabularyController(service);

    await controller.page('deck-1', { id: 'user-1' } as UserEntity, '25', '50', 'alpha', 'learning');

    expect(service.listPage).toHaveBeenCalledWith('deck-1', 'user-1', { limit: 25, offset: 50, search: 'alpha', status: 'learning' });
  });
});
