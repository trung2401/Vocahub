import type { ParsedTable, VocabularyFileParser } from '@/data/ports/repositories';
import { importPreviewRows } from '@/data/mockData';

export class MockVocabularyFileParser implements VocabularyFileParser {
  async parse(file: File): Promise<ParsedTable> {
    if (!/\.(csv|xlsx?|xls)$/i.test(file.name)) throw new Error('unsupported_type');
    if (file.size > 10 * 1024 * 1024) throw new Error('too_large');
    if (/\.csv$/i.test(file.name)) {
      const lines = (await file.text()).split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (!lines.length) return { headers: [], rows: [] };
      const parseLine = (line: string) => line.split(',').map((value) => value.trim().replace(/^"|"$/g, ''));
      const headers = parseLine(lines[0]);
      return { headers, rows: lines.slice(1).map((line) => Object.fromEntries(parseLine(line).map((value, index) => [headers[index] ?? `column${index + 1}`, value]))) };
    }
    return {
      headers: ['term', 'meaning', 'pronunciation'],
      rows: importPreviewRows.map((row) => row.values)
    };
  }
}
