import type { QueryRunner } from 'typeorm';
import { RefreshSessions1730000002000 } from './1730000002000-refresh-sessions';

describe('RefreshSessions1730000002000', () => {
  it('creates the refresh session table once', async () => {
    const queryRunner = {
      hasTable: jest.fn().mockResolvedValue(false),
      query: jest.fn().mockResolvedValue([])
    } as unknown as QueryRunner;

    await new RefreshSessions1730000002000().up(queryRunner);

    expect(queryRunner.query).toHaveBeenCalledTimes(1);
    expect(queryRunner.query).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE refresh_sessions'));
    expect(queryRunner.query).toHaveBeenCalledWith(expect.stringContaining('token_hash char(64) NOT NULL'));
    expect(queryRunner.query).toHaveBeenCalledWith(expect.stringContaining('ON DELETE CASCADE'));
  });

  it('is idempotent when the table already exists', async () => {
    const queryRunner = {
      hasTable: jest.fn().mockResolvedValue(true),
      query: jest.fn()
    } as unknown as QueryRunner;

    await new RefreshSessions1730000002000().up(queryRunner);

    expect(queryRunner.query).not.toHaveBeenCalled();
  });
});
