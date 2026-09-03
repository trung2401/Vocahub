'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { StudyCard } from '@/components/StudyCard';
import { SummaryPanel } from '@/components/SummaryPanel';
import { useApp } from '@/lib/app-context';
import { copy } from '@/data/mockData';
import type { VocabularyEntry } from '@/domain/types';

export interface FlashcardPageProps { params: { deckId: string }; }

export default function FlashcardPage({ params }: Readonly<FlashcardPageProps>) {
  const { decks, entriesByDeck, recordReview } = useApp();
  const deck = decks.find((item) => item.id === params.deckId);
  const entries = useMemo(() => (entriesByDeck[params.deckId] ?? []).slice(0, 8), [entriesByDeck, params.deckId]);
  const [index, setIndex] = useState(0); const [flipped, setFlipped] = useState(false); const [score, setScore] = useState(0); const [done, setDone] = useState(false);
  const current = entries[index];
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === ' ') { event.preventDefault(); setFlipped((value) => !value); } if (event.key === 'Escape') window.location.href = `/decks/${params.deckId}`; }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [params.deckId]);
  if (!deck || !current) return <div className="study-page"><div className="study-topbar"><Link href="/"><ArrowLeft size={16} /></Link><span className="study-title">{copy.brand}</span></div></div>;
  const rate = async (rating: 'again' | 'hard' | 'good') => { await recordReview({ entryId: current.id, rating }); if (rating === 'good') setScore((value) => value + 1); if (index === entries.length - 1) setDone(true); else { setIndex((value) => value + 1); setFlipped(false); } };
  if (done) return <div className="study-page"><div className="study-topbar"><span className="study-title">{deck.name}</span><Link href={`/decks/${deck.id}`} aria-label={copy.study.exit}>×</Link></div><SummaryPanel kind="flashcard" score={score} total={entries.length} onRetry={() => { setIndex(0); setScore(0); setDone(false); setFlipped(false); }} onViewDeck={() => { window.location.href = `/decks/${deck.id}`; }} /></div>;
  return <div className="study-page"><div className="study-topbar"><Link href={`/decks/${deck.id}`} aria-label={copy.study.exit}><ArrowLeft size={16} /></Link><div className="study-progress"><div className="progress-line"><span style={{ width: `${((index + 1) / entries.length) * 100}%` }} /></div><span className="progress-text">{deck.name} · {index + 1}/{entries.length}</span></div><span className="study-title">{copy.brand}</span></div><div className="study-content"><StudyCard entry={current} flipped={flipped} onFlip={() => setFlipped((value) => !value)} />{flipped && <div className="rating-row"><button className="rating-button again" type="button" onClick={() => rate('again')}>{copy.study.again}<small>10m</small></button><button className="rating-button hard" type="button" onClick={() => rate('hard')}>{copy.study.hard}<small>1d</small></button><button className="rating-button good" type="button" onClick={() => rate('good')}>{copy.study.good}<small>3d</small></button></div>}</div></div>;
}
