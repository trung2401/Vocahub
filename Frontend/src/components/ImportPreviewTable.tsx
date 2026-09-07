'use client';

import { Check, Square, Trash2 } from 'lucide-react';
import type { ImportRow } from '@/domain/types';
import { copy } from '@/data/mockData';

export interface ImportPreviewTableProps {
  rows: ImportRow[];
  onToggle: (rowNumber: number) => void;
  onDelete: (rowNumber: number) => void;
}

export function ImportPreviewTable({ rows, onToggle, onDelete }: Readonly<ImportPreviewTableProps>) {
  const valid = rows.filter((row) => row.issues.length === 0).length;
  const invalid = rows.length - valid;
  return <section><div className="preview-header"><h2>{copy.import.previewTitle} ({rows.length})</h2><span className="preview-counts"><strong>{valid} {copy.import.validRows}</strong> · <span className="invalid">{invalid} {copy.import.invalidRows}</span></span></div><div className="table-wrap"><table className="data-table"><thead><tr><th>#</th><th>{copy.deck.term}</th><th>{copy.deck.meaning}</th><th>{copy.deck.pronunciation}</th><th>Trạng thái</th><th /></tr></thead><tbody>{rows.map((row) => <tr className={`${row.issues.length ? 'invalid-row ' : ''}${row.included ? '' : 'excluded-row'}`} key={row.rowNumber}><td data-label="#">{row.rowNumber}</td><td className="term" data-label={copy.deck.term}>{row.values.term || '—'}</td><td data-label={copy.deck.meaning}>{row.values.meaning || '—'}{row.issues.map((issue) => <span className="row-issue" key={`${issue.field}-${issue.code}`}>{issue.message}</span>)}</td><td data-label={copy.deck.pronunciation}>{row.values.pronunciation || '—'}</td><td data-label="Trạng thái"><span className={`status-label ${row.issues.length ? 'error' : 'ok'}`}>{row.issues.length ? 'Cần kiểm tra' : 'Hợp lệ'}</span></td><td><div className="table-actions"><button className="icon-button" type="button" aria-label={`${row.included ? copy.import.deselectRow : copy.import.selectRow} ${row.rowNumber}`} aria-pressed={row.included} onClick={() => onToggle(row.rowNumber)}>{row.included ? <Check size={13} /> : <Square size={13} />}</button><button className="icon-button" type="button" aria-label={`${copy.import.removeRow} ${row.rowNumber}`} onClick={() => onDelete(row.rowNumber)}><Trash2 size={13} /></button></div></td></tr>)}</tbody></table></div></section>;
}
