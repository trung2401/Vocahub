'use client';

import Link from 'next/link';
import { BookOpen, Flame, FileUp, Plus, RotateCcw, Target } from 'lucide-react';
import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { DeckCard } from '@/components/DeckCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApp } from '@/lib/app-context';
import { copy } from '@/data/mockData';

export interface DashboardPageProps {}

export default function DashboardPage(_props: Readonly<DashboardPageProps>) {
  const { decks, entriesByDeck, createDeck, deleteDeck } = useApp();
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  const [toast, setToast] = useState(false);
  const allEntries = Object.values(entriesByDeck).flat();
  const due = allEntries.filter((entry) => entry.nextReviewAt <= new Date().toISOString()).length;

  const handleCreate = async () => {
    const name = window.prompt(copy.dashboard.createDeck);
    if (name?.trim()) { await createDeck(name.trim()); setToast(true); window.setTimeout(() => setToast(false), 2200); }
  };

  return <AppShell><div className="content">
    <div className="page-heading"><div><p className="eyebrow">{copy.dashboard.greeting}</p><h1>{copy.dashboard.title}</h1></div><div className="button-row"><button className="button button-secondary" type="button" onClick={handleCreate}><Plus size={14} />{copy.dashboard.createDeck}</button><Link className="button button-primary" href="/import"><FileUp size={14} />{copy.dashboard.import}</Link></div></div>
    {decks.length === 0 ? <div className="empty-state"><span className="empty-icon"><FileUp size={28} /></span><h2>{copy.dashboard.emptyTitle}</h2><p>{copy.dashboard.emptyDescription}</p><div className="button-row"><Link className="button button-primary" href="/import"><FileUp size={14} />{copy.dashboard.import}</Link><button className="button button-secondary" type="button" onClick={handleCreate}><Plus size={14} />{copy.dashboard.createDeck}</button></div><Link className="muted-link" href="/import">ⓘ {copy.dashboard.supportedFormat}</Link></div> : <><div className="stats-grid"><div className="stat-card"><span className="stat-icon warning"><Target size={17} /></span><div><span className="stat-label">{copy.dashboard.reviewToday}</span><div className="stat-value">{due}</div></div></div><div className="stat-card"><span className="stat-icon accent"><BookOpen size={17} /></span><div><span className="stat-label">{copy.dashboard.totalWords}</span><div className="stat-value">{allEntries.length}</div></div></div><div className="stat-card"><span className="stat-icon success"><Flame size={17} /></span><div><span className="stat-label">{copy.dashboard.streak}</span><div className="stat-value">7 <span className="stat-meta">ngày</span></div></div></div></div><div className="section-heading"><h2>{copy.dashboard.decksTitle}</h2><button className="icon-button" type="button" aria-label="Làm mới" onClick={() => window.location.reload()}><RotateCcw size={14} /></button></div><div className="deck-grid">{decks.map((deck) => <DeckCard key={deck.id} deck={deck} entries={entriesByDeck[deck.id] ?? []} onDelete={(target) => setDeleting({ id: target.id, name: target.name })} />)}<button className="create-deck-card" type="button" onClick={handleCreate}><Plus size={19} /><strong>{copy.dashboard.createDeckShort}</strong><span>{copy.dashboard.createHint}</span></button></div></>}
    {deleting && <ConfirmDialog onCancel={() => setDeleting(null)} onConfirm={async () => { await deleteDeck(deleting.id); setDeleting(null); }} title={copy.deck.deleteConfirmTitle} description={`${copy.deck.deleteConfirmDescription} (${deleting.name})`} />}
    {toast && <div className="toast" role="status">Đã tạo deck mới</div>}
  </div></AppShell>;
}
