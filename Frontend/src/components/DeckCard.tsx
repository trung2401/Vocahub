import Link from 'next/link';
import { BookOpen, Clock3, Trash2 } from 'lucide-react';
import type { Deck, DeckSummary } from '@/domain/types';
import { copy } from '@/data/mockData';

export interface DeckCardProps {
  deck: Deck;
  summary: DeckSummary;
  onDelete: (deck: Deck) => void;
}

export function DeckCard({ deck, summary, onDelete }: Readonly<DeckCardProps>) {
  const isMastered = summary.totalEntries > 0 && summary.masteredEntries > summary.totalEntries / 2;
  const progress = summary.totalEntries ? Math.round((summary.masteredEntries / summary.totalEntries) * 100) : 0;
  return <article className="deck-card">
    <div className="deck-card-top"><span className={`status-badge ${isMastered ? 'mastered' : 'learning'}`}><span className="status-dot" />{isMastered ? copy.statuses.mastered : copy.statuses.learning}</span><button className="icon-button danger-hover" type="button" aria-label={`${copy.deck.delete} ${deck.name}`} title={copy.deck.delete} onClick={() => onDelete(deck)}><Trash2 size={15} /></button></div>
    <h3 title={deck.name}>{deck.name}</h3>
    <div className="deck-meta"><span><BookOpen size={11} /> {summary.totalEntries} từ</span><span className="due"><Clock3 size={11} /> {summary.dueEntries} cần ôn</span></div>
    <div className="deck-progress" aria-label={`${progress}% đã thuộc`}><span style={{ width: `${progress}%` }} /></div>
    <div className="deck-progress-meta"><span>Tiến độ học</span><strong>{progress}%</strong></div>
    <div className="deck-actions"><Link className="button button-primary" href={`/decks/${deck.id}/study/flashcards`}>{copy.dashboard.studyNow}</Link><Link className="button button-secondary" href={`/decks/${deck.id}`}>{copy.dashboard.viewDeck}</Link></div>
  </article>;
}
