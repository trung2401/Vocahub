export type LearningStatus = 'new' | 'learning' | 'mastered';

export interface Deck {
  id: string;
  name: string;
  source: 'manual' | 'import';
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyEntry {
  id: string;
  deckId: string;
  term: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  status: LearningStatus;
  lastReviewedAt?: string;
  nextReviewAt: string;
  correctCount: number;
  incorrectCount: number;
}

export interface ImportRow {
  rowNumber: number;
  values: Record<string, string>;
  issues: ImportIssue[];
  included: boolean;
}

export interface ImportIssue {
  field: string;
  code: 'required' | 'too_long' | 'duplicate' | 'invalid_file';
  message: string;
}
