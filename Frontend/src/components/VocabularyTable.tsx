'use client';

import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
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
  if (!entries.length) return <div className="empty-state"><h2>{copy.deck.emptyTitle}</h2><p>{copy.deck.emptyDescription}</p></div>;
  return <div className="table-wrap"><table className="data-table vocabulary-table"><thead><tr><th>#</th><th>{copy.deck.term}</th><th>{copy.deck.meaning}</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{entries.map((entry, index) => <tr key={entry.id}><td data-label="#">{index + 1}</td><td className="term" data-label={copy.deck.term}>{entry.term}</td><td data-label={copy.deck.meaning}>{entry.meaning}</td><td data-label="Trạng thái"><span className={`status-badge ${entry.status}`}>{copy.statuses[entry.status]}</span></td><td data-label="Thao tác"><div className="row-menu"><button className="icon-button" type="button" aria-label={`Mở thao tác ${entry.term}`} onClick={() => setMenuId(menuId === entry.id ? null : entry.id)}><MoreVertical size={15} /></button>{menuId === entry.id && <div className="menu-popover"><button type="button" onClick={() => { onEdit(entry); setMenuId(null); }}><Pencil size={12} /> {copy.deck.edit}</button><button type="button" onClick={() => { onDelete(entry); setMenuId(null); }}><Trash2 size={12} /> {copy.deck.delete}</button></div>}</div></td></tr>)}</tbody></table></div>;
}
