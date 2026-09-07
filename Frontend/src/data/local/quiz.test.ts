import { describe, expect, it } from 'vitest';
import type { VocabularyEntry } from '@/domain/types';
import { buildQuizQuestions, hasEnoughQuizData } from './quiz';

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

describe('quiz generation', () => {
  it('requires four distinct meanings and creates four choices from deck entries', () => {
    expect(hasEnoughQuizData(entries(3))).toBe(false);
    const questions = buildQuizQuestions(entries(4));
    expect(questions).toHaveLength(4);
    expect(questions[0].options).toHaveLength(4);
    expect(questions[0].options).toContain(questions[0].correct);
    expect(new Set(questions[0].options).size).toBe(4);
  });

  it('keeps the entry id for review recording and skips duplicate meanings', () => {
    const source = entries(5);
    source[4].meaning = source[0].meaning;
    const questions = buildQuizQuestions(source);
    expect(questions).toHaveLength(4);
    expect(questions.every((question) => question.entryId.startsWith('entry-'))).toBe(true);
  });
});
