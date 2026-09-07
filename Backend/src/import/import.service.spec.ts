import { BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DeckEntity } from '../decks/entities/deck.entity';
import { VocabularyEntryEntity } from '../vocabulary/entities/vocabulary-entry.entity';
import { ImportBatchEntity } from './entities/import-batch.entity';
import { ImportService } from './import.service';

describe('ImportService', () => {
  const makeService = (existing: VocabularyEntryEntity[] = []) => {
    const deck = { id: 'deck-1', name: 'Imported', source: 'import', createdAt: new Date(), updatedAt: new Date(), userId: 'user-1' } as DeckEntity;
    const deckRepository = { create: jest.fn((value) => value), save: jest.fn().mockResolvedValue(deck) } as unknown as Repository<DeckEntity>;
    const entryRepository = { find: jest.fn().mockResolvedValue(existing), create: jest.fn((value) => value), save: jest.fn(async (value) => value) } as unknown as Repository<VocabularyEntryEntity>;
    const batchRepository = { create: jest.fn((value) => value), save: jest.fn().mockResolvedValue(undefined) } as unknown as Repository<ImportBatchEntity>;
    const manager = { getRepository: jest.fn((entity: unknown) => entity === DeckEntity ? deckRepository : entity === VocabularyEntryEntity ? entryRepository : batchRepository) };
    const dataSource = { transaction: jest.fn(async (callback: (value: typeof manager) => Promise<unknown>) => callback(manager)) } as unknown as DataSource;
    return { service: new ImportService(dataSource), deckRepository, entryRepository, batchRepository };
  };

  it('trims values, rejects blank rows, removes duplicates and records actual counts', async () => {
    const { service, entryRepository, batchRepository } = makeService();
    const result = await service.createDeckWithEntries({ name: ' Imported ', fileName: 'words.csv', entries: [
      { term: ' alpha ', meaning: ' first ' },
      { term: 'alpha', meaning: 'first' },
      { term: '   ', meaning: 'missing term' },
      { term: 'beta', meaning: ' second ' }
    ] }, 'user-1');

    expect(entryRepository.save).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ term: 'alpha', meaning: 'first' }),
      expect.objectContaining({ term: 'beta', meaning: 'second' })
    ]));
    expect(result.counts).toEqual({ total: 4, created: 2, validRows: 2, invalidRows: 2 });
    expect(batchRepository.create).toHaveBeenCalledWith(expect.objectContaining({ totalRows: 4, validRows: 2, invalidRows: 2 }));
  });

  it('rolls back by failing when every input row is invalid', async () => {
    const { service, entryRepository } = makeService();
    await expect(service.createDeckWithEntries({ name: 'Imported', entries: [{ term: ' ', meaning: '\t' }] }, 'user-1')).rejects.toBeInstanceOf(BadRequestException);
    expect(entryRepository.save).not.toHaveBeenCalled();
  });
});
