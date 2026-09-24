import { describe, expect, it } from 'vitest';
import type { VocabularyEntry } from '@/domain/types';
import { createMockRepositories, MockStudyRepository, MockVocabularyRepository } from './mock/mockRepositories';
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

describe('mock review scheduling', () => {
  const reviewSequence = async (ratings: Array<'again' | 'hard' | 'good'>) => {
    const vocabulary = new MockVocabularyRepository();
    const study = new MockStudyRepository(vocabulary);
    let result = await vocabulary.getById('entry-1');
    if (!result) throw new Error('test entry is missing');
    for (const rating of ratings) result = await study.recordReview({ entryId: result.id, rating });
    return result;
  };

  it.each([
    { sequence: ['good', 'again', 'good'] },
    { sequence: ['good', 'hard', 'good'] },
    { sequence: ['again', 'good'] }
  ] as Array<{ sequence: Array<'again' | 'hard' | 'good'> }>)('keeps an interrupted good sequence in learning', async ({ sequence }) => {
    const result = await reviewSequence(sequence);

    expect(result.status).toBe('learning');
  });

  it('masters after two consecutive good reviews', async () => {
    const result = await reviewSequence(['good', 'good']);

    expect(result.status).toBe('mastered');
    expect(result.lastRating).toBe('good');
  });
});

describe('mock deck summaries', () => {
  it('aggregates entry counts without loading entries into the caller', async () => {
    const { deck } = createMockRepositories();

    await expect(deck.listSummaries()).resolves.toEqual([expect.objectContaining({
      deckId: 'deck-toeic', totalEntries: 120, dueEntries: 18, masteredEntries: 2, learningEntries: 117
    })]);
  });
});
