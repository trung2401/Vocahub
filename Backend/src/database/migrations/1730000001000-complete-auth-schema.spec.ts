import type { QueryRunner } from 'typeorm';
import { CompleteAuthSchema1730000001000 } from './1730000001000-complete-auth-schema';

const queryRunnerWith = (orphanCount: number, legacyUserRows: Array<{ id: string }>) => {
  const deckTable = { findColumnByName: () => undefined };
  return {
    hasTable: jest.fn(async (name: string) => name === 'users' || name === 'decks' || name === 'review_logs' || name === 'import_batches'),
    getTable: jest.fn(async () => deckTable),
    addColumn: jest.fn(),
    changeColumn: jest.fn(),
    query: jest.fn(async (sql: string) => sql.startsWith('SELECT COUNT') ? [{ count: orphanCount }] : sql.startsWith('SELECT id') ? legacyUserRows : [])
  } as unknown as QueryRunner;
};

describe('CompleteAuthSchema1730000001000', () => {
  it('backfills orphan decks and makes user_id mandatory', async () => {
    const previous = process.env.LEGACY_USER_ID;
    process.env.LEGACY_USER_ID = 'legacy-user';
    const queryRunner = queryRunnerWith(2, [{ id: 'legacy-user' }]);

    await new CompleteAuthSchema1730000001000().up(queryRunner);

    expect(queryRunner.query).toHaveBeenCalledWith('UPDATE decks SET user_id = ? WHERE user_id IS NULL', ['legacy-user']);
    expect(queryRunner.changeColumn).toHaveBeenCalledWith('decks', 'user_id', expect.objectContaining({ isNullable: false }));
    if (previous === undefined) delete process.env.LEGACY_USER_ID; else process.env.LEGACY_USER_ID = previous;
  });

  it('fails before backfill when orphan decks have no configured owner', async () => {
    const previous = process.env.LEGACY_USER_ID;
    process.env.LEGACY_USER_ID = '';
    const queryRunner = queryRunnerWith(1, []);

    await expect(new CompleteAuthSchema1730000001000().up(queryRunner)).rejects.toThrow('legacy_decks_require_user');
    expect(queryRunner.query).not.toHaveBeenCalledWith('UPDATE decks SET user_id = ? WHERE user_id IS NULL', expect.anything());
    if (previous === undefined) delete process.env.LEGACY_USER_ID; else process.env.LEGACY_USER_ID = previous;
  });

  it('fails before backfill when the configured owner does not exist', async () => {
    const previous = process.env.LEGACY_USER_ID;
    process.env.LEGACY_USER_ID = 'missing-user';
    const queryRunner = queryRunnerWith(1, []);

    await expect(new CompleteAuthSchema1730000001000().up(queryRunner)).rejects.toThrow('legacy_user_not_found');
    expect(queryRunner.query).not.toHaveBeenCalledWith('UPDATE decks SET user_id = ? WHERE user_id IS NULL', expect.anything());
    if (previous === undefined) delete process.env.LEGACY_USER_ID; else process.env.LEGACY_USER_ID = previous;
  });
});
