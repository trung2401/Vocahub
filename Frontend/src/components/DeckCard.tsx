import Link from 'next/link';
import { BookOpen, Clock3, Trash2 } from 'lucide-react';
import type { Deck, VocabularyEntry } from '@/domain/types';
import { copy } from '@/data/mockData';

export interface DeckCardProps {
  deck: Deck;
  entries: VocabularyEntry[];
  onDelete: (deck: Deck) => void;
}

export function DeckCard({ deck, entries, onDelete }: Readonly<DeckCardProps>) {
  const due = entries.filter((entry) => entry.nextReviewAt <= new Date().toISOString()).length;
  const mastered = entries.filter((entry) => entry.status === 'mastered').length;
  const isMastered = entries.length > 0 && mastered > entries.length / 2;
  const progress = entries.length ? Math.round((mastered / entries.length) * 100) : 0;
  return <article className="deck-card">
    <div className="deck-card-top"><span className={`status-badge ${isMastered ? 'mastered' : 'learning'}`}><span className="status-dot" />{isMastered ? copy.statuses.mastered : copy.statuses.learning}</span><button className="icon-button danger-hover" type="button" aria-label={`${copy.deck.delete} ${deck.name}`} title={copy.deck.delete} onClick={() => onDelete(deck)}><Trash2 size={15} /></button></div>
    <h3 title={deck.name}>{deck.name}</h3>
    <div className="deck-meta"><span><BookOpen size={11} /> {entries.length} từ</span><span className="due"><Clock3 size={11} /> {due} cần ôn</span></div>
    <div className="deck-progress" aria-label={`${progress}% đã thuộc`}><span style={{ width: `${progress}%` }} /></div>
    <div className="deck-progress-meta"><span>Tiến độ học</span><strong>{progress}%</strong></div>
    <div className="deck-actions"><Link className="button button-primary" href={`/decks/${deck.id}/study/flashcards`}>{copy.dashboard.studyNow}</Link><Link className="button button-secondary" href={`/decks/${deck.id}`}>{copy.dashboard.viewDeck}</Link></div>
  </article>;
}
