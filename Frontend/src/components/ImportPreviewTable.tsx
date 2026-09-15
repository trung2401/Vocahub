'use client';

import { Check, CircleAlert, Square, Trash2 } from 'lucide-react';
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
  return <section className="preview-section"><div className="preview-header"><div><p className="eyebrow">Bước 2 / 3</p><h2>{copy.import.previewTitle} <span>({rows.length})</span></h2></div><div className="preview-counts"><span className="preview-count valid"><Check size={12} />{valid} {copy.import.validRows}</span><span className="preview-count invalid"><CircleAlert size={12} />{invalid} {copy.import.invalidRows}</span></div></div>{rows.length === 0 ? <div className="table-empty"><CircleAlert size={18} /><p>Chưa có dòng dữ liệu để xem trước.</p></div> : <div className="table-wrap"><table className="data-table"><caption className="sr-only">Bảng xem trước dữ liệu import</caption><thead><tr><th scope="col">#</th><th scope="col">{copy.deck.term}</th><th scope="col">{copy.deck.meaning}</th><th scope="col">{copy.deck.pronunciation}</th><th scope="col">Trạng thái</th><th scope="col" aria-label="Thao tác" /></tr></thead><tbody>{rows.map((row) => <tr className={`${row.issues.length ? 'invalid-row ' : ''}${row.included ? '' : 'excluded-row'}`} key={row.rowNumber}><td data-label="#"><span className="table-cell-label">#</span><span className="table-cell-value">{row.rowNumber}</span></td><td className="term" data-label={copy.deck.term}><span className="table-cell-label">{copy.deck.term}</span><span className="table-cell-value">{row.values.term || '—'}</span></td><td data-label={copy.deck.meaning}><span className="table-cell-label">{copy.deck.meaning}</span><span className="table-cell-value">{row.values.meaning || '—'}{row.issues.map((issue) => <span className="row-issue" key={`${issue.field}-${issue.code}`}>{issue.message}</span>)}</span></td><td data-label={copy.deck.pronunciation}><span className="table-cell-label">{copy.deck.pronunciation}</span><span className="table-cell-value">{row.values.pronunciation || '—'}</span></td><td data-label="Trạng thái"><span className="table-cell-label">Trạng thái</span><span className="table-cell-value"><span className={`status-label ${row.issues.length ? 'error' : 'ok'}`}>{row.issues.length ? 'Cần kiểm tra' : 'Hợp lệ'}</span></span></td><td><span className="table-cell-label">Thao tác</span><span className="table-cell-value"><div className="table-actions"><button className="icon-button" type="button" aria-label={`${row.included ? copy.import.deselectRow : copy.import.selectRow} ${row.rowNumber}`} title={row.included ? copy.import.deselectRow : copy.import.selectRow} aria-pressed={row.included} onClick={() => onToggle(row.rowNumber)}>{row.included ? <Check size={13} /> : <Square size={13} />}</button><button className="icon-button danger-hover" type="button" aria-label={`${copy.import.removeRow} ${row.rowNumber}`} title={copy.import.removeRow} onClick={() => onDelete(row.rowNumber)}><Trash2 size={13} /></button></div></span></td></tr>)}</tbody></table></div>}</section>;
}
