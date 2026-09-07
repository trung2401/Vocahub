import { describe, expect, it } from 'vitest';
import type { VocabularyEntry } from '@/domain/types';
import { selectFlashcardEntries } from './study';

const entries = (count: number): VocabularyEntry[] => Array.from({ length: count }, (_, index) => ({
  id: `entry-${index}`,
  deckId: 'deck-1',
  term: `term-${index}`,
  meaning: `meaning-${index}`,
  status: 'new',
  nextReviewAt: new Date().toISOString(),
  correctCount: 0,
  incorrectCount: 0
}));

describe('flashcard session selection', () => {
  it('includes every entry in a large deck', () => {
    expect(selectFlashcardEntries(entries(120))).toHaveLength(120);
    expect(selectFlashcardEntries(entries(120))[119].id).toBe('entry-119');
  });

  it('keeps smaller decks intact', () => {
    expect(selectFlashcardEntries(entries(3))).toHaveLength(3);
  });
});
