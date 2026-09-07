'use client';

import Link from 'next/link';
import { BookOpen, MoreVertical, Plus, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { VocabularyDrawer } from '@/components/VocabularyDrawer';
import { VocabularyTable } from '@/components/VocabularyTable';
import { useApp } from '@/lib/app-context';
import { copy } from '@/data/mockData';
import type { VocabularyEntry } from '@/domain/types';
import { hasEnoughQuizData } from '@/data/local/quiz';

export interface DeckDetailPageProps { params: { deckId: string }; }

export default function DeckDetailPage({ params }: Readonly<DeckDetailPageProps>) {
  const { decks, entriesByDeck, createEntry, updateEntry, deleteEntry, renameDeck, deleteDeck } = useApp();
  const deck = decks.find((item) => item.id === params.deckId);
  const entries = useMemo(() => entriesByDeck[params.deckId] ?? [], [entriesByDeck, params.deckId]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [drawerEntry, setDrawerEntry] = useState<VocabularyEntry | null | undefined>(undefined);
  const [confirm, setConfirm] = useState<VocabularyEntry | 'deck' | null>(null);
  const due = entries.filter((entry) => entry.nextReviewAt <= new Date().toISOString()).length;
  const quizAvailable = hasEnoughQuizData(entries);
  const visibleEntries = useMemo(() => entries.filter((entry) => (status === 'all' || entry.status === status) && `${entry.term} ${entry.meaning}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12), [entries, query, status]);
  if (!deck) return <AppShell><div className="content"><div className="empty-state"><h2>{copy.deck.emptyTitle}</h2><p>{copy.deck.emptyDescription}</p><Link className="button button-primary" href="/">{copy.dashboard.title}</Link></div></div></AppShell>;
  const submitEntry = async (values: { term: string; meaning: string; pronunciation?: string; example?: string; partOfSpeech?: string }) => { if (drawerEntry) await updateEntry(drawerEntry.id, values); else await createEntry({ ...values, deckId: deck.id }); setDrawerEntry(undefined); };
  const handleRename = async () => { const next = window.prompt(copy.deck.rename, deck.name); if (next?.trim()) await renameDeck(deck.id, next.trim()); };
  return <AppShell><div className="content"><p className="breadcrumb">{copy.deck.breadcrumb} / {deck.name}</p><section className="deck-hero"><div><h1>{deck.name}</h1><div className="deck-hero-meta"><span className="metric-pill"><BookOpen size={12} /> {entries.length} {copy.deck.words}</span><span className="metric-pill due"><Sparkles size={12} /> {due} {copy.deck.dueToday}</span></div></div><div className="deck-hero-actions"><Link className="button button-primary" href={`/decks/${deck.id}/study/flashcards`}><Sparkles size={13} />{copy.deck.flashcards}</Link>{quizAvailable ? <Link className="button button-secondary" href={`/decks/${deck.id}/study/quiz`}><BookOpen size={13} />{copy.deck.quiz}</Link> : <button className="button button-secondary" type="button" disabled title={copy.errors.insufficientChoices}><BookOpen size={13} />{copy.deck.quiz}</button>}<button className="icon-button" type="button" aria-label="Thao tác deck" onClick={handleRename}><MoreVertical size={16} /></button></div></section><div className="list-toolbar"><div className="search-wrap"><Search size={13} /><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.deck.searchPlaceholder} aria-label={copy.deck.searchPlaceholder} /></div><select className="select-control" aria-label={copy.deck.filter} value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">{copy.deck.filterAll}</option><option value="new">{copy.statuses.new}</option><option value="learning">{copy.statuses.learning}</option><option value="mastered">{copy.statuses.mastered}</option></select><button className="button button-secondary" type="button" onClick={() => setDrawerEntry(null)}><Plus size={13} />{copy.deck.addWord}</button><button className="icon-button" type="button" aria-label={copy.deck.delete} onClick={() => setConfirm('deck')}><MoreVertical size={15} /></button></div><VocabularyTable entries={visibleEntries} onEdit={(entry) => setDrawerEntry(entry)} onDelete={(entry) => setConfirm(entry)} />{drawerEntry !== undefined && <VocabularyDrawer entry={drawerEntry ?? undefined} onClose={() => setDrawerEntry(undefined)} onSave={submitEntry} />}{confirm && <ConfirmDialog onCancel={() => setConfirm(null)} onConfirm={async () => { if (confirm === 'deck') { await deleteDeck(deck.id); window.location.href = '/'; } else { await deleteEntry(confirm.id); setConfirm(null); } }} title={confirm === 'deck' ? copy.deck.deleteConfirmTitle : `${copy.deck.delete} ${confirm.term}?`} description={confirm === 'deck' ? copy.deck.deleteConfirmDescription : 'Từ này sẽ bị xóa vĩnh viễn khỏi deck.'} />}</div></AppShell>;
}
