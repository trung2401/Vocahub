import type { ParsedTable } from '@/data/ports/repositories';

type XlsxModule = typeof import('xlsx');
type XlsxWorksheet = import('xlsx').WorkSheet;

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

  const rows = matrix.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, cellToString(row[index])]))).filter((row) => Object.values(row).some((value) => value.length > 0));
  if (!rows.length) throw new Error('empty_file');
  if (rows.length > 5000) throw new Error('too_many_rows');
  return { headers, rows };
};

export type ParserWorkerSource = string | ArrayBuffer;

export const parseFileContents = async (fileName: string, source: ParserWorkerSource): Promise<ParsedTable> => {
  const xlsx = await import('xlsx');
  const workbook = /\.csv$/i.test(fileName)
    ? xlsx.read(source as string, { type: 'string', cellDates: true })
    : xlsx.read(source, { type: 'array', cellDates: true });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) throw new Error('empty_file');
  return parseWorksheet(workbook.Sheets[firstSheet], xlsx);
};
