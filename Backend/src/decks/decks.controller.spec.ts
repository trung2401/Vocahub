import type { UserEntity } from '../users/entities/user.entity';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';

describe('DecksController', () => {
  it('passes the authenticated user to the list service', async () => {
    const service = { list: jest.fn().mockResolvedValue([]) } as unknown as DecksService;
    const controller = new DecksController(service);

    await controller.list({ id: 'user-1' } as UserEntity);

    expect(service.list).toHaveBeenCalledWith('user-1');
  });

  it('passes the authenticated user to the summary service', async () => {
    const service = { listSummaries: jest.fn().mockResolvedValue([]) } as unknown as DecksService;
    const controller = new DecksController(service);

    await controller.summaries({ id: 'user-1' } as UserEntity);

    expect(service.listSummaries).toHaveBeenCalledWith('user-1');
  });
});
