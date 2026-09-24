import type { UserEntity } from '../users/entities/user.entity';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';

describe('StudyController', () => {
  it('passes query time and authenticated user to due service', async () => {
    const service = { getDue: jest.fn().mockResolvedValue([]) } as unknown as StudyService;
    const controller = new StudyController(service);

    await controller.getDue('deck-1', { id: 'user-1' } as UserEntity, '2026-01-01T00:00:00.000Z');

    expect(service.getDue).toHaveBeenCalledWith('deck-1', 'user-1', '2026-01-01T00:00:00.000Z');
  });
});
