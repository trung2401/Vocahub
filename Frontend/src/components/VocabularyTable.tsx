'use client';

import { BookOpen, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { VocabularyEntry } from '@/domain/types';
import { copy } from '@/data/mockData';

export interface VocabularyTableProps {
  entries: VocabularyEntry[];
  onEdit: (entry: VocabularyEntry) => void;
  onDelete: (entry: VocabularyEntry) => void;
}

export function VocabularyTable({ entries, onEdit, onDelete }: Readonly<VocabularyTableProps>) {
  const [menuId, setMenuId] = useState<string | null>(null);
  if (!entries.length) return <div className="empty-state table-empty-state"><div className="empty-icon"><BookOpen size={19} /></div><h2>{copy.deck.emptyTitle}</h2><p>{copy.deck.emptyDescription}</p></div>;
  return <div className="table-wrap vocabulary-table-wrap"><table className="data-table vocabulary-table"><caption className="sr-only">Danh sách từ vựng trong deck</caption><thead><tr><th scope="col">#</th><th scope="col">{copy.deck.term}</th><th scope="col">{copy.deck.meaning}</th><th scope="col">Trạng thái</th><th scope="col">Thao tác</th></tr></thead><tbody>{entries.map((entry, index) => <tr key={entry.id}><td data-label="#"><span className="table-cell-label">#</span><span className="table-cell-value">{index + 1}</span></td><td className="term" data-label={copy.deck.term}><span className="table-cell-label">{copy.deck.term}</span><span className="table-cell-value">{entry.term}</span></td><td data-label={copy.deck.meaning}><span className="table-cell-label">{copy.deck.meaning}</span><span className="table-cell-value">{entry.meaning}</span></td><td data-label="Trạng thái"><span className="table-cell-label">Trạng thái</span><span className="table-cell-value"><span className={`status-badge ${entry.status}`}><span className="status-dot" />{copy.statuses[entry.status]}</span></span></td><td data-label="Thao tác"><span className="table-cell-label">Thao tác</span><span className="table-cell-value"><div className="row-menu"><button className="icon-button" type="button" aria-label={`Mở thao tác ${entry.term}`} aria-expanded={menuId === entry.id} onClick={() => setMenuId(menuId === entry.id ? null : entry.id)}><MoreVertical size={15} /></button>{menuId === entry.id && <div className="menu-popover" role="menu"><button type="button" role="menuitem" onClick={() => { onEdit(entry); setMenuId(null); }}><Pencil size={12} /> {copy.deck.edit}</button><button type="button" role="menuitem" onClick={() => { onDelete(entry); setMenuId(null); }}><Trash2 size={12} /> {copy.deck.delete}</button></div>}</div></span></td></tr>)}</tbody></table></div>;
}
