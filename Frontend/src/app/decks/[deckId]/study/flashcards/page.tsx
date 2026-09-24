'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, CircleAlert, Clock3, Keyboard, LoaderCircle, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { InlineError } from '@/components/InlineError';
import { StudyCard } from '@/components/StudyCard';
import { SummaryPanel } from '@/components/SummaryPanel';
import { useApp } from '@/lib/app-context';
import { copy } from '@/data/mockData';
import { selectFlashcardEntries } from '@/data/local/study';
import type { VocabularyEntry } from '@/domain/types';

export interface FlashcardPageProps { params: { deckId: string }; }
type Rating = 'again' | 'hard' | 'good';

export default function FlashcardPage({ params }: Readonly<FlashcardPageProps>) {
  const { decks, listEntries, recordReview } = useApp();
  const deck = decks.find((item) => item.id === params.deckId);
  const deckLoaded = Boolean(deck);
  const [allEntries, setAllEntries] = useState<VocabularyEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entryLoadError, setEntryLoadError] = useState('');
  const entries = useMemo(() => selectFlashcardEntries(allEntries), [allEntries]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [pendingRating, setPendingRating] = useState<Rating | null>(null);
  const [failedRating, setFailedRating] = useState<Rating | null>(null);
  const [reviewError, setReviewError] = useState('');
  const current = entries[index];
  const progress = entries.length ? Math.round(((index + 1) / entries.length) * 100) : 0;

  useEffect(() => {
    let active = true;
    if (!deckLoaded) return () => { active = false; };
    setEntriesLoading(true);
    setEntryLoadError('');
    void listEntries(params.deckId).then((nextEntries) => {
      if (active) setAllEntries(nextEntries);
    }).catch((caught: unknown) => {
      if (active) setEntryLoadError(caught instanceof Error ? caught.message : copy.errors.storage);
    }).finally(() => {
      if (active) setEntriesLoading(false);
    });
    return () => { active = false; };
  }, [deckLoaded, listEntries, params.deckId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        if (!savingReview) setFlipped((value) => !value);
      }
      if (event.key === 'Escape') window.location.href = `/decks/${params.deckId}`;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [params.deckId, savingReview]);

  if (!deck) {
    return <div className="study-page"><div className="study-empty"><h1>{copy.deck.emptyTitle}</h1><Link className="button button-secondary" href="/"><ArrowLeft size={14} />{copy.study.viewDeck}</Link></div></div>;
  }
  if (entriesLoading) return <div className="study-page"><div className="study-empty" role="status"><LoaderCircle size={20} className="spin" /><p>Đang tải phiên học...</p></div></div>;
  if (entryLoadError) return <div className="study-page"><div className="study-empty"><InlineError message={entryLoadError} /><Link className="button button-secondary" href={`/decks/${deck.id}`}><ArrowLeft size={14} />{copy.study.viewDeck}</Link></div></div>;
  if (!current) return <div className="study-page"><div className="study-empty"><h1>{copy.deck.emptyTitle}</h1><Link className="button button-secondary" href={`/decks/${deck.id}`}><ArrowLeft size={14} />{copy.study.viewDeck}</Link></div></div>;

  const rate = async (rating: Rating) => {
    if (savingReview) return;
    setSavingReview(true);
    setPendingRating(rating);
    setFailedRating(null);
    setReviewError('');
    try {
      await recordReview({ entryId: current.id, rating });
      await new Promise((resolve) => window.setTimeout(resolve, 160));
      if (rating === 'good') setScore((value) => value + 1);
      if (index === entries.length - 1) setDone(true);
      else {
        setIndex((value) => value + 1);
        setFlipped(false);
      }
    } catch (caught) {
      setFailedRating(rating);
      setReviewError(caught instanceof Error && caught.message ? caught.message : copy.errors.review);
    } finally {
      setSavingReview(false);
      setPendingRating(null);
    }
  };

  if (done) {
    return <div className="study-page"><StudyTopbar deckName={deck.name} current={entries.length} total={entries.length} onExit={`/decks/${deck.id}`} /><SummaryPanel kind="flashcard" score={score} total={entries.length} onRetry={() => { setIndex(0); setScore(0); setDone(false); setFlipped(false); }} onViewDeck={() => { window.location.href = `/decks/${deck.id}`; }} /></div>;
  }

  return (
    <div className="study-page">
      <StudyTopbar deckName={deck.name} current={index + 1} total={entries.length} onExit={`/decks/${deck.id}`} />
      <main className="study-content flashcard-content">
        <div className="study-session-heading">
          <span className="study-mode-pill"><Sparkles size={14} />{copy.deck.flashcards}</span>
          <p><strong>{entries.length - index - 1}</strong> thẻ còn lại trong phiên học</p>
        </div>
        <StudyCard entry={current} flipped={flipped} onFlip={() => { if (!savingReview) setFlipped((value) => !value); }} />
        {flipped ? (
          <section className="rating-section" aria-label="Đánh giá thẻ">
            <div className="rating-heading"><span>{copy.study.rateHint}</span><span className="keyboard-hint"><Keyboard size={13} /> Space để lật</span></div>
            <div className="rating-row">
              <button className={`rating-button again ${pendingRating === 'again' ? 'is-selected' : ''}`} type="button" disabled={savingReview} onClick={() => void rate('again')}>
                {savingReview && pendingRating === 'again' ? <LoaderCircle size={17} className="spin" /> : <CircleAlert size={17} />}<span><strong>{copy.study.again}</strong><small>Ôn lại sau 10 phút</small></span>
              </button>
              <button className={`rating-button hard ${pendingRating === 'hard' ? 'is-selected' : ''}`} type="button" disabled={savingReview} onClick={() => void rate('hard')}>
                {savingReview && pendingRating === 'hard' ? <LoaderCircle size={17} className="spin" /> : <Clock3 size={17} />}<span><strong>{copy.study.hard}</strong><small>Ôn lại sau 1 ngày</small></span>
              </button>
              <button className={`rating-button good ${pendingRating === 'good' ? 'is-selected' : ''}`} type="button" disabled={savingReview} onClick={() => void rate('good')}>
                {savingReview && pendingRating === 'good' ? <LoaderCircle size={17} className="spin" /> : <CheckCircle2 size={17} />}<span><strong>{copy.study.good}</strong><small>Ôn lại sau 3 ngày</small></span>
              </button>
            </div>
            {savingReview && <p className="review-saving" role="status"><LoaderCircle size={13} className="spin" /> Đang lưu kết quả...</p>}
            {reviewError && <div className="review-error"><InlineError message={reviewError} />{failedRating && <button className="button button-secondary review-retry" type="button" onClick={() => void rate(failedRating)} disabled={savingReview}><RotateCcw size={13} />{copy.errors.retryReview}</button>}</div>}
          </section>
        ) : <p className="study-gesture-hint"><Keyboard size={14} /> {copy.study.flipHint} hoặc nhấn <kbd>Space</kbd></p>}
        <div className="study-progress-caption"><span>Tiến độ phiên học</span><strong>{progress}%</strong></div>
      </main>
    </div>
  );
}

function StudyTopbar({ deckName, current, total, onExit }: Readonly<{ deckName: string; current: number; total: number; onExit: string }>) {
  const progress = total ? Math.round((current / total) * 100) : 0;
  return (
    <header className="study-topbar">
      <div className="study-topbar-left">
        <Link className="study-exit" href={onExit} aria-label={copy.study.exit}><ArrowLeft size={17} /></Link>
        <div className="study-context"><span className="study-kicker">{copy.brand} / {copy.deck.flashcards}</span><strong className="study-title">{deckName}</strong></div>
      </div>
      <div className="study-progress" aria-label={`Tiến độ ${current} trên ${total}`}>
        <div className="progress-line"><span style={{ width: `${progress}%` }} /></div>
        <div className="study-progress-meta"><span>{current} / {total}</span><small>{Math.max(total - current, 0)} còn lại</small></div>
      </div>
      <span className="study-brand-mark">VH</span>
    </header>
  );
}
