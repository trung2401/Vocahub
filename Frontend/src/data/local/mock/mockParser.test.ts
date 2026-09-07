import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { MockVocabularyFileParser, buildImportRows } from './mockParser';

describe('MockVocabularyFileParser', () => {
  it('parses quoted CSV cells without falling back to sample data', async () => {
    const file = new File(['term,meaning\n"hello, world","xin chào"\n'], 'words.csv', { type: 'text/csv' });
    await expect(new MockVocabularyFileParser().parse(file)).resolves.toEqual({
      headers: ['term', 'meaning'],
      rows: [{ term: 'hello, world', meaning: 'xin chào' }]
    });
  });

  it('parses the first worksheet in an XLSX file', async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['word', 'definition'], ['bonjour', 'xin chào']]), 'Words');
    const bytes = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const file = new File([bytes], 'words.xlsx');
    await expect(new MockVocabularyFileParser().parse(file)).resolves.toEqual({
      headers: ['word', 'definition'],
      rows: [{ word: 'bonjour', definition: 'xin chào' }]
    });
  });

  it('rejects empty files', async () => {
    const file = new File(['term,meaning\n'], 'empty.csv');
    await expect(new MockVocabularyFileParser().parse(file)).rejects.toThrow('empty_file');
  });
});

describe('buildImportRows', () => {
  it('recomputes mapped values and validation issues when mapping changes', () => {
    const source = [{ first: 'alpha', second: 'nghĩa A' }, { first: 'alpha', second: 'nghĩa A' }];
    const firstMapping = buildImportRows(source, { term: 'first', meaning: 'second' });
    expect(firstMapping[1].issues.some((issue) => issue.code === 'duplicate')).toBe(true);
    const secondMapping = buildImportRows(source, { term: 'second', meaning: 'first' });
    expect(secondMapping[0].values).toMatchObject({ term: 'nghĩa A', meaning: 'alpha' });
    expect(secondMapping[0].issues).toEqual([]);
  });
});
