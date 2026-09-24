import type { Deck, DeckSummary, LearningStatus, VocabularyEntry } from '@/domain/types';

export interface CreateVocabularyInput {
  deckId: string;
  term: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  status?: VocabularyEntry['status'];
}

export interface UpdateVocabularyInput {
  term?: string;
  meaning?: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  status?: VocabularyEntry['status'];
  lastReviewedAt?: string;
  nextReviewAt?: string;
  correctCount?: number;
  incorrectCount?: number;
  lastRating?: VocabularyEntry['lastRating'];
}

export interface ReviewResult {
  entryId: string;
  rating: 'again' | 'hard' | 'good';
  mode?: 'flashcard' | 'quiz';
}

export interface ParsedTable {
  headers: string[];
  rows: Record<string, string>[];
}

export interface DeckRepository {
  list(): Promise<Deck[]>;
  listSummaries(): Promise<DeckSummary[]>;
  get(id: string): Promise<Deck | null>;
  create(input: { name: string; source: Deck['source'] }): Promise<Deck>;
  update(id: string, input: { name: string }): Promise<Deck>;
  delete(id: string): Promise<void>;
}

export interface VocabularyListPage {
  items: VocabularyEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface VocabularyListPageOptions {
  limit?: number;
  offset?: number;
  search?: string;
  status?: LearningStatus;
}

export interface VocabularyRepository {
  listByDeck(deckId: string): Promise<VocabularyEntry[]>;
  listPage(deckId: string, options?: VocabularyListPageOptions): Promise<VocabularyListPage>;
  create(input: CreateVocabularyInput): Promise<VocabularyEntry>;
  update(id: string, input: UpdateVocabularyInput): Promise<VocabularyEntry>;
  delete(id: string): Promise<void>;
  saveMany(entries: CreateVocabularyInput[]): Promise<VocabularyEntry[]>;
}

export interface StudyRepository {
  recordReview(input: ReviewResult): Promise<VocabularyEntry>;
  getDueEntries(deckId: string, now: string): Promise<VocabularyEntry[]>;
}

export interface VocabularyFileParser {
  parse(file: File): Promise<ParsedTable>;
}
