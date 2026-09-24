import type { QueryRunner, Table } from 'typeorm';
import { RefreshSessionReplacement1730000003000 } from './1730000003000-refresh-session-replacement';

describe('RefreshSessionReplacement1730000003000', () => {
  it('adds the replacement marker only to an existing legacy table', async () => {
    const table = { findColumnByName: jest.fn().mockReturnValue(undefined) } as unknown as Table;
    const queryRunner = {
      hasTable: jest.fn().mockResolvedValue(true),
      getTable: jest.fn().mockResolvedValue(table),
      addColumn: jest.fn()
    } as unknown as QueryRunner;

    await new RefreshSessionReplacement1730000003000().up(queryRunner);

    expect(queryRunner.addColumn).toHaveBeenCalledWith('refresh_sessions', expect.objectContaining({ name: 'replaced_by', isNullable: true }));
  });

  it('is a no-op when the marker already exists', async () => {
    const table = { findColumnByName: jest.fn().mockReturnValue({ name: 'replaced_by' }) } as unknown as Table;
    const queryRunner = {
      hasTable: jest.fn().mockResolvedValue(true),
      getTable: jest.fn().mockResolvedValue(table),
      addColumn: jest.fn()
    } as unknown as QueryRunner;

    await new RefreshSessionReplacement1730000003000().up(queryRunner);

    expect(queryRunner.addColumn).not.toHaveBeenCalled();
  });
});
