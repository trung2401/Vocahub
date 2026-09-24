import type { DeckEntity } from '../decks/entities/deck.entity';
import type { VocabularyEntryEntity } from '../vocabulary/entities/vocabulary-entry.entity';

export interface DeckResponseDto {
  id: string;
  name: string;
  source: 'manual' | 'import';
  createdAt: string;
  updatedAt: string;
}

export interface DeckSummaryResponseDto {
  deckId: string;
  totalEntries: number;
  dueEntries: number;
  masteredEntries: number;
  learningEntries: number;
}

export interface VocabularyPageResponseDto {
  items: VocabularyResponseDto[];
  total: number;
  limit: number;
  offset: number;
}

export interface VocabularyResponseDto {
  id: string;
  deckId: string;
  term: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  status: 'new' | 'learning' | 'mastered';
  lastReviewedAt?: string;
  nextReviewAt: string;
  correctCount: number;
  incorrectCount: number;
  lastRating?: 'again' | 'hard' | 'good';
}

export const toDeckResponse = (entity: DeckEntity): DeckResponseDto => ({ id: entity.id, name: entity.name, source: entity.source, createdAt: entity.createdAt.toISOString(), updatedAt: entity.updatedAt.toISOString() });

export const toVocabularyResponse = (entity: VocabularyEntryEntity): VocabularyResponseDto => ({
  id: entity.id, deckId: entity.deckId, term: entity.term, meaning: entity.meaning,
  ...(entity.pronunciation ? { pronunciation: entity.pronunciation } : {}),
  ...(entity.example ? { example: entity.example } : {}),
  ...(entity.partOfSpeech ? { partOfSpeech: entity.partOfSpeech } : {}), status: entity.status,
  ...(entity.lastReviewedAt ? { lastReviewedAt: entity.lastReviewedAt.toISOString() } : {}), nextReviewAt: entity.nextReviewAt.toISOString(), correctCount: entity.correctCount, incorrectCount: entity.incorrectCount,
  ...(entity.lastRating ? { lastRating: entity.lastRating } : {})
});
