import type { UserEntity } from '../users/entities/user.entity';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';

describe('ImportController', () => {
  it('passes the authenticated user to the transactional import service', async () => {
    const service = { createDeckWithEntries: jest.fn().mockResolvedValue({}) } as unknown as ImportService;
    const controller = new ImportController(service);
    const dto = { name: 'Imported', entries: [{ term: 'alpha', meaning: 'a' }] };

    await controller.createDeck(dto, { id: 'user-1' } as UserEntity);

    expect(service.createDeckWithEntries).toHaveBeenCalledWith(dto, 'user-1');
  });
});
