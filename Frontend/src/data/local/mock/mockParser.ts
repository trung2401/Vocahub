import type { ParsedTable, VocabularyFileParser } from '@/data/ports/repositories';
import type { ImportIssue, ImportRow } from '@/domain/types';

type XlsxModule = typeof import('xlsx');
type XlsxWorksheet = import('xlsx').WorkSheet;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ROWS = 5000;

const cellToString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value).replace(/^\uFEFF/, '').trim();
};

const parseWorksheet = (worksheet: XlsxWorksheet, xlsx: XlsxModule): ParsedTable => {
  const matrix = xlsx.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: '', blankrows: false, raw: true });
  if (!matrix.length) throw new Error('empty_file');

  const headers = (matrix[0] ?? []).map(cellToString);
  if (!headers.length || headers.some((header) => !header)) throw new Error('invalid_file');
  const normalizedHeaders = headers.map((header) => header.toLocaleLowerCase());
  if (new Set(normalizedHeaders).size !== normalizedHeaders.length) throw new Error('invalid_file');

  const rows = matrix.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, cellToString(row[index])])))
    .filter((row) => Object.values(row).some((value) => value.length > 0));
  if (!rows.length) throw new Error('empty_file');
  if (rows.length > MAX_ROWS) throw new Error('too_many_rows');
  return { headers, rows };
};

export class MockVocabularyFileParser implements VocabularyFileParser {
  async parse(file: File): Promise<ParsedTable> {
    if (!/\.(csv|xlsx?|xls)$/i.test(file.name)) throw new Error('unsupported_type');
    if (file.size > MAX_FILE_SIZE) throw new Error('too_large');
    if (file.size === 0) throw new Error('empty_file');
    try {
      const xlsx = await import('xlsx');
      const workbook = /\.csv$/i.test(file.name)
        ? xlsx.read(await file.text(), { type: 'string', cellDates: true })
        : xlsx.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) throw new Error('empty_file');
      return parseWorksheet(workbook.Sheets[firstSheet], xlsx);
    } catch (error) {
      if (error instanceof Error && ['empty_file', 'invalid_file', 'too_many_rows'].includes(error.message)) throw error;
      throw new Error('invalid_file');
    }
  }
}

export const importFieldLimits = {
  term: 200,
  meaning: 1000,
  pronunciation: 100,
  example: 2000,
  partOfSpeech: 100
} as const;

const fieldLabels: Record<keyof typeof importFieldLimits, string> = {
  term: 'Từ vựng', meaning: 'Nghĩa', pronunciation: 'Phiên âm', example: 'Ví dụ', partOfSpeech: 'Loại từ'
};

export const autoMapColumns = (headers: string[]): Record<keyof typeof importFieldLimits, string> => {
  const find = (names: string[]) => headers.find((header) => names.includes(header.trim().toLocaleLowerCase())) ?? '';
  return {
    term: find(['term', 'word', 'từ', 'từ vựng']),
    meaning: find(['meaning', 'definition', 'nghĩa']),
    pronunciation: find(['pronunciation', 'phonetic', 'phiên âm']),
    example: find(['example', 'ví dụ']),
    partOfSpeech: find(['partofspeech', 'part of speech', 'loại từ'])
  };
};

export const buildImportRows = (
  sourceRows: ParsedTable['rows'],
  mapping: Partial<Record<keyof typeof importFieldLimits, string>>,
  includedByRow: Record<number, boolean> = {},
  excludedRows: ReadonlySet<number> = new Set()
): ImportRow[] => {
  const mappedRows = sourceRows.map((source, index) => {
    const rowNumber = index + 2;
    const values = (Object.keys(importFieldLimits) as Array<keyof typeof importFieldLimits>).reduce((result, field) => {
      const sourceColumn = mapping[field];
      result[field] = sourceColumn ? String(source[sourceColumn] ?? '').trim() : '';
      return result;
    }, {} as Record<keyof typeof importFieldLimits, string>);
    const issues: ImportIssue[] = [];
    if (!values.term) issues.push({ field: 'term', code: 'required', message: 'Thiếu từ vựng' });
    if (!values.meaning) issues.push({ field: 'meaning', code: 'required', message: 'Thiếu nghĩa' });
    (Object.keys(importFieldLimits) as Array<keyof typeof importFieldLimits>).forEach((field) => {
      if (values[field].length > importFieldLimits[field]) issues.push({ field, code: 'too_long', message: `${fieldLabels[field]} quá dài` });
    });
    return { rowNumber, values, issues, included: includedByRow[rowNumber] ?? true };
  }).filter((row) => !excludedRows.has(row.rowNumber));
  const seen = new Map<string, number>();
  mappedRows.forEach((row) => {
    if (!row.values.term || !row.values.meaning) return;
    const key = `${row.values.term.toLocaleLowerCase()}\u0000${row.values.meaning.toLocaleLowerCase()}`;
    const firstRow = seen.get(key);
    if (firstRow) row.issues.push({ field: 'term', code: 'duplicate', message: `Trùng dữ liệu với dòng ${firstRow}` });
    else seen.set(key, row.rowNumber);
  });
  return mappedRows;
};
