import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BulkImportDto } from './bulk-import.dto';
import { CreateVocabularyDto } from '../../vocabulary/dto/create-vocabulary.dto';

describe('BulkImportDto', () => {
  it('rejects whitespace-only names and vocabulary fields after trimming', async () => {
    const importErrors = await validate(plainToInstance(BulkImportDto, { name: '  ', entries: [{ term: 'valid', meaning: 'meaning' }] }));
    const vocabularyErrors = await validate(plainToInstance(CreateVocabularyDto, { term: '   ', meaning: '\t' }));
    expect(importErrors[0]?.constraints).toHaveProperty('isNotEmpty');
    expect(vocabularyErrors.find((error) => error.property === 'term')?.constraints).toHaveProperty('isNotEmpty');
    expect(vocabularyErrors.find((error) => error.property === 'meaning')?.constraints).toHaveProperty('isNotEmpty');
  });
});
