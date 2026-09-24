'use client';

import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, LoaderCircle, Pencil, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { VocabularyDrawer } from '@/components/VocabularyDrawer';
import { VocabularyTable } from '@/components/VocabularyTable';
import { useApp } from '@/lib/app-context';
import { copy } from '@/data/mockData';
import type { VocabularyEntry } from '@/domain/types';
import { InlineError } from '@/components/InlineError';

export interface DeckDetailPageProps { params: { deckId: string }; }

const PAGE_SIZE = 50;

export default function DeckDetailPage({ params }: Readonly<DeckDetailPageProps>) {
  const { decks, summariesByDeck, listEntryPage, createEntry, updateEntry, deleteEntry, renameDeck, deleteDeck } = useApp();
  const deck = decks.find((item) => item.id === params.deckId);
  const deckLoaded = Boolean(deck);
  const summary = summariesByDeck[params.deckId];
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');
  const [page, setPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [drawerEntry, setDrawerEntry] = useState<VocabularyEntry | null | undefined>(undefined);
  const [confirm, setConfirm] = useState<VocabularyEntry | 'deck' | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameBusy, setRenameBusy] = useState(false);
  const [renameError, setRenameError] = useState('');

  useEffect(() => {
    let active = true;
    if (!deckLoaded) return () => { active = false; };
    setEntriesLoading(true);
    setEntriesError('');
    void listEntryPage(params.deckId, {
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      search: query.trim() || undefined,
      status: status === 'all' ? undefined : status
    }).then((result) => {
      if (!active) return;
      setEntries(result.items);
      setTotalEntries(result.total);
    }).catch((caught: unknown) => {
      if (active) setEntriesError(caught instanceof Error ? caught.message : copy.errors.storage);
    }).finally(() => {
      if (active) setEntriesLoading(false);
    });
    return () => { active = false; };
  }, [deckLoaded, listEntryPage, page, params.deckId, query, reloadKey, status]);

  useEffect(() => {
    if (!renameDialogOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !renameBusy) {
        setRenameDialogOpen(false);
        setRenameError('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [renameDialogOpen, renameBusy]);

  const pageCount = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  // The table is paginated, so the first page cannot determine whether the deck
  // has enough data for quiz. The quiz screen loads the complete session data.
  const quizAvailable = (summary?.totalEntries ?? totalEntries) >= 4;

  if (!deck) {
    return <AppShell><div className="content"><div className="empty-state"><h2>{copy.deck.emptyTitle}</h2><p>{copy.deck.emptyDescription}</p><Link className="button button-primary" href="/">{copy.dashboard.title}</Link></div></div></AppShell>;
  }

  const submitEntry = async (values: { term: string; meaning: string; pronunciation?: string; example?: string; partOfSpeech?: string }) => {
    if (drawerEntry) await updateEntry(drawerEntry.id, values);
    else await createEntry({ ...values, deckId: deck.id });
    setDrawerEntry(undefined);
    setPage(0);
    setReloadKey((value) => value + 1);
  };

  const handleRename = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = renameValue.trim();
    if (!next) {
      setRenameError(copy.deck.requiredError);
      return;
    }
    setRenameBusy(true);
    setRenameError('');
    try {
      await renameDeck(deck.id, next);
      setRenameDialogOpen(false);
    } catch (caught) {
      setRenameError(caught instanceof Error ? caught.message : copy.errors.storage);
    } finally {
      setRenameBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="content deck-detail-content">
        <p className="breadcrumb">{copy.deck.breadcrumb} / <strong>{deck.name}</strong></p>
        <section className="deck-hero">
          <div className="deck-hero-copy">
            <p className="eyebrow">Bộ từ vựng</p>
            <h1>{deck.name}</h1>
            <div className="deck-hero-meta">
              <span className="metric-pill"><BookOpen size={12} /> {summary?.totalEntries ?? totalEntries} {copy.deck.words}</span>
              <span className="metric-pill due"><Sparkles size={12} /> {summary?.dueEntries ?? 0} {copy.deck.dueToday}</span>
            </div>
          </div>
          <div className="deck-hero-actions">
            <Link className="button button-primary" href={`/decks/${deck.id}/study/flashcards`}><Sparkles size={13} />{copy.deck.flashcards}</Link>
            {quizAvailable ? <Link className="button button-secondary" href={`/decks/${deck.id}/study/quiz`}><BookOpen size={13} />{copy.deck.quiz}</Link> : <button className="button button-secondary" type="button" disabled title={copy.errors.insufficientChoices}><BookOpen size={13} />{copy.deck.quiz}</button>}
            <button className="icon-button" type="button" aria-label={copy.deck.rename} title={copy.deck.rename} onClick={() => { setRenameValue(deck.name); setRenameError(''); setRenameDialogOpen(true); }}><Pencil size={16} /></button>
            <button className="icon-button danger-hover" type="button" aria-label={copy.deck.delete} title={copy.deck.delete} onClick={() => setConfirm('deck')}><Trash2 size={15} /></button>
          </div>
        </section>

        <div className="list-toolbar">
          <div className="list-toolbar-heading"><p className="eyebrow">Từ trong deck</p><strong>{totalEntries} kết quả</strong></div>
          <div className="toolbar-controls">
            <div className="search-wrap"><Search size={13} /><input className="search-input" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder={copy.deck.searchPlaceholder} aria-label={copy.deck.searchPlaceholder} /></div>
            <select className="select-control" aria-label={copy.deck.filter} value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(0); }}><option value="all">{copy.deck.filterAll}</option><option value="new">{copy.statuses.new}</option><option value="learning">{copy.statuses.learning}</option><option value="mastered">{copy.statuses.mastered}</option></select>
            <button className="button button-secondary" type="button" onClick={() => setDrawerEntry(null)}><Plus size={13} />{copy.deck.addWord}</button>
          </div>
        </div>

        {entriesError && <InlineError message={entriesError} />}
        {entriesLoading ? <div className="table-empty" role="status"><LoaderCircle size={18} className="spin" /> Đang tải danh sách từ...</div> : <VocabularyTable entries={entries} onEdit={(entry) => setDrawerEntry(entry)} onDelete={(entry) => setConfirm(entry)} />}
        {pageCount > 1 && <nav className="pagination" aria-label="Phân trang từ vựng"><button className="button button-secondary" type="button" disabled={page === 0 || entriesLoading} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={14} /> Trang trước</button><span>Trang {page + 1} / {pageCount}</span><button className="button button-secondary" type="button" disabled={page >= pageCount - 1 || entriesLoading} onClick={() => setPage((value) => value + 1)}>Trang sau <ChevronRight size={14} /></button></nav>}

        {renameDialogOpen && <div className="modal-backdrop dialog-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !renameBusy) setRenameDialogOpen(false); }}><section className="confirm-dialog rename-dialog" role="dialog" aria-modal="true" aria-labelledby="rename-deck-title" aria-describedby="rename-deck-description"><div className="dialog-heading"><span className="dialog-icon"><Pencil size={17} /></span><button className="icon-button" type="button" aria-label={copy.deck.close} onClick={() => setRenameDialogOpen(false)} disabled={renameBusy}><X size={16} /></button></div><h2 id="rename-deck-title">{copy.deck.rename}</h2><p id="rename-deck-description">Đặt tên ngắn gọn để dễ nhận ra deck trong thư viện học tập.</p><form onSubmit={(event) => void handleRename(event)}><div className="field"><label htmlFor="rename-deck-name">{copy.dashboard.createDeckName}</label><input id="rename-deck-name" value={renameValue} onChange={(event) => { setRenameValue(event.target.value); setRenameError(''); }} autoFocus disabled={renameBusy} /></div>{renameError && <InlineError message={renameError} />}<div className="confirm-actions"><button className="button button-secondary" type="button" onClick={() => setRenameDialogOpen(false)} disabled={renameBusy}>{copy.import.cancel}</button><button className="button button-primary" type="submit" disabled={!renameValue.trim() || renameBusy}>{renameBusy ? <><LoaderCircle size={13} className="spin" />Đang lưu...</> : <><Pencil size={13} />{copy.deck.save}</>}</button></div></form></section></div>}
        {drawerEntry !== undefined && <VocabularyDrawer entry={drawerEntry ?? undefined} onClose={() => setDrawerEntry(undefined)} onSave={submitEntry} />}
        {confirm && <ConfirmDialog onCancel={() => setConfirm(null)} onConfirm={async () => { if (confirm === 'deck') { await deleteDeck(deck.id); window.location.href = '/'; } else { await deleteEntry(confirm.id); setConfirm(null); setPage(0); setReloadKey((value) => value + 1); } }} title={confirm === 'deck' ? copy.deck.deleteConfirmTitle : `${copy.deck.delete} ${confirm.term}?`} description={confirm === 'deck' ? copy.deck.deleteConfirmDescription : 'Từ này sẽ bị xóa vĩnh viễn khỏi deck.'} />}
      </div>
    </AppShell>
  );
}
