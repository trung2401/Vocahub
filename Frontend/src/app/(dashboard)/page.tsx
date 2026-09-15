'use client';

import Link from 'next/link';
import { BookOpen, FileUp, LoaderCircle, Plus, RotateCcw, Target, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { DeckCard } from '@/components/DeckCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { InlineError } from '@/components/InlineError';
import { useApp } from '@/lib/app-context';
import { copy } from '@/data/mockData';

export interface DashboardPageProps {}

export default function DashboardPage(_props: Readonly<DashboardPageProps>) {
  const { decks, entriesByDeck, createDeck, deleteDeck } = useApp();
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [toast, setToast] = useState(false);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const allEntries = Object.values(entriesByDeck).flat();
  const due = allEntries.filter((entry) => entry.nextReviewAt <= new Date().toISOString()).length;

  const openCreateDialog = () => {
    setDeckName('');
    setCreateError('');
    setCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    setDeckName('');
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = deckName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError('');
    try {
      await createDeck(name);
      closeCreateDialog();
      setToast(true);
      window.setTimeout(() => setToast(false), 2200);
    } catch (caught) {
      setCreateError(caught instanceof Error ? caught.message : copy.errors.storage);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!createDialogOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !creating) closeCreateDialog(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [createDialogOpen, creating]);

  return <AppShell><div className="content dashboard-content">
    <div className="page-heading dashboard-heading"><div><p className="eyebrow">{copy.dashboard.greeting}</p><h1>{copy.dashboard.title}</h1><p className="page-lede">Theo dõi nhịp học và tiếp tục từ nơi bạn đã dừng lại.</p></div></div>
    {decks.length === 0 ? <div className="empty-state dashboard-empty"><span className="empty-icon"><FileUp size={28} /></span><p className="eyebrow">Bắt đầu phiên học đầu tiên</p><h2>{copy.dashboard.emptyTitle}</h2><p>{copy.dashboard.emptyDescription}</p><div className="button-row"><Link className="button button-primary" href="/import"><FileUp size={14} />{copy.dashboard.import}</Link><button className="button button-secondary" type="button" onClick={openCreateDialog}><Plus size={14} />{copy.dashboard.createDeck}</button></div><Link className="muted-link" href="/import">{copy.dashboard.supportedFormat}</Link></div> : <><div className="stats-grid dashboard-stats"><div className="stat-card"><span className="stat-icon warning"><Target size={17} /></span><div><span className="stat-label">{copy.dashboard.reviewToday}</span><div className="stat-value">{due}</div><span className="stat-support">thẻ đang chờ bạn</span></div></div><div className="stat-card"><span className="stat-icon accent"><BookOpen size={17} /></span><div><span className="stat-label">{copy.dashboard.totalWords}</span><div className="stat-value">{allEntries.length}</div><span className="stat-support">trong các deck</span></div></div></div><div className="section-heading"><div><p className="eyebrow">Thư viện học tập</p><h2>{copy.dashboard.decksTitle}</h2></div><button className="icon-button" type="button" aria-label="Làm mới" onClick={() => window.location.reload()}><RotateCcw size={14} /></button></div><div className="deck-grid">{decks.map((deck) => <DeckCard key={deck.id} deck={deck} entries={entriesByDeck[deck.id] ?? []} onDelete={(target) => setDeleting({ id: target.id, name: target.name })} />)}<button className="create-deck-card" type="button" onClick={openCreateDialog}><Plus size={19} /><strong>{copy.dashboard.createDeckShort}</strong><span>{copy.dashboard.createHint}</span></button></div></>}
    {createDialogOpen && <div className="modal-backdrop dialog-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !creating) closeCreateDialog(); }}><section className="confirm-dialog create-dialog" role="dialog" aria-modal="true" aria-labelledby="create-deck-title" aria-describedby="create-deck-description"><div className="dialog-heading"><span className="dialog-icon"><Plus size={18} /></span><button className="icon-button" type="button" aria-label={copy.deck.close} onClick={closeCreateDialog} disabled={creating}><X size={16} /></button></div><h2 id="create-deck-title">{copy.dashboard.createDeckTitle}</h2><p id="create-deck-description">Tạo một không gian riêng cho bộ từ bạn muốn theo dõi.</p><form onSubmit={handleCreate}><div className="field"><label htmlFor="create-deck-name">{copy.dashboard.createDeckName}</label><input id="create-deck-name" value={deckName} onChange={(event) => setDeckName(event.target.value)} placeholder={copy.dashboard.createDeckPlaceholder} autoFocus disabled={creating} /></div>{createError && <InlineError message={createError} />}<div className="confirm-actions"><button className="button button-secondary" type="button" onClick={closeCreateDialog} disabled={creating}>{copy.import.cancel}</button><button className="button button-primary" type="submit" disabled={!deckName.trim() || creating}>{creating ? <><LoaderCircle size={13} className="spin" />Đang tạo...</> : <><Plus size={13} />{copy.dashboard.createDeckShort}</>}</button></div></form></section></div>}
    {deleting && <ConfirmDialog onCancel={() => setDeleting(null)} onConfirm={async () => { await deleteDeck(deleting.id); setDeleting(null); }} title={copy.deck.deleteConfirmTitle} description={`${copy.deck.deleteConfirmDescription} (${deleting.name})`} />}
    {toast && <div className="toast" role="status">Đã tạo deck mới</div>}
  </div></AppShell>;
}
