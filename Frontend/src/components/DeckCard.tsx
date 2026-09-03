import Link from 'next/link';
import { BookOpen, MoreVertical } from 'lucide-react';
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
  return <article className="deck-card">
    <div className="deck-card-top"><span className={`status-badge ${mastered > entries.length / 2 ? 'mastered' : 'learning'}`}>{mastered > entries.length / 2 ? copy.statuses.mastered : copy.statuses.learning}</span><button className="icon-button" type="button" aria-label={`${copy.deck.delete} ${deck.name}`} onClick={() => onDelete(deck)}><MoreVertical size={15} /></button></div>
    <h3>{deck.name}</h3>
    <div className="deck-meta"><span><BookOpen size={11} /> {entries.length} từ</span><span className="due">{due} cần ôn</span></div>
    <div className="deck-actions"><Link className="button button-primary" href={`/decks/${deck.id}/study/flashcards`}>{copy.dashboard.studyNow}</Link><Link className="button button-secondary" href={`/decks/${deck.id}`}>{copy.dashboard.viewDeck}</Link></div>
  </article>;
}
