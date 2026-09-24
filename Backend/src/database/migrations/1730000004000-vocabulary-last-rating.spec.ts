import type { QueryRunner, Table } from 'typeorm';
import { VocabularyLastRating1730000004000 } from './1730000004000-vocabulary-last-rating';

describe('VocabularyLastRating1730000004000', () => {
  it('adds last_rating to an existing vocabulary table', async () => {
    const table = { findColumnByName: jest.fn().mockReturnValue(undefined) } as unknown as Table;
    const queryRunner = {
      hasTable: jest.fn().mockResolvedValue(true),
      getTable: jest.fn().mockResolvedValue(table),
      addColumn: jest.fn()
    } as unknown as QueryRunner;

    await new VocabularyLastRating1730000004000().up(queryRunner);

    expect(queryRunner.addColumn).toHaveBeenCalledWith('vocabulary_entries', expect.objectContaining({
      name: 'last_rating',
      type: 'enum',
      enum: ['again', 'hard', 'good'],
      isNullable: true
    }));
  });

  it('does not add the column twice', async () => {
    const table = { findColumnByName: jest.fn().mockReturnValue({ name: 'last_rating' }) } as unknown as Table;
    const queryRunner = {
      hasTable: jest.fn().mockResolvedValue(true),
      getTable: jest.fn().mockResolvedValue(table),
      addColumn: jest.fn()
    } as unknown as QueryRunner;

    await new VocabularyLastRating1730000004000().up(queryRunner);

    expect(queryRunner.addColumn).not.toHaveBeenCalled();
  });
});
