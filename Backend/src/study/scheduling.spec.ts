import { scheduleReview } from './scheduling';

describe('scheduleReview', () => {
  const now = new Date('2026-08-28T10:00:00.000Z');

  it('moves a new entry to learning and schedules good for three days', () => {
    const result = scheduleReview({ status: 'new', correctCount: 0, incorrectCount: 0, lastRating: null }, 'good', now);
    expect(result.status).toBe('learning');
    expect(result.correctCount).toBe(1);
    expect(result.lastRating).toBe('good');
    expect(result.nextReviewAt.toISOString()).toBe('2026-08-31T10:00:00.000Z');
  });

  it('masters an entry after the second consecutive good review', () => {
    const result = scheduleReview({ status: 'learning', correctCount: 1, incorrectCount: 0, lastRating: 'good' }, 'good', now);
    expect(result.status).toBe('mastered');
  });

  it('returns learning and a ten-minute interval after again', () => {
    const result = scheduleReview({ status: 'mastered', correctCount: 4, incorrectCount: 0, lastRating: 'good' }, 'again', now);
    expect(result.status).toBe('learning');
    expect(result.incorrectCount).toBe(1);
    expect(result.lastRating).toBe('again');
    expect(result.nextReviewAt.toISOString()).toBe('2026-08-28T10:10:00.000Z');
  });

  it.each([
    ['good', 'again', 'good'],
    ['good', 'hard', 'good']
  ] as const)('does not master after %s -> %s -> %s', (first, second, third) => {
    let entry: { status: 'new' | 'learning' | 'mastered'; correctCount: number; incorrectCount: number; lastRating: 'again' | 'hard' | 'good' | null } = { status: 'new', correctCount: 0, incorrectCount: 0, lastRating: null };
    entry = { ...entry, ...scheduleReview(entry, first, now) };
    entry = { ...entry, ...scheduleReview(entry, second, now) };
    const result = scheduleReview(entry, third, now);

    expect(result.status).toBe('learning');
  });

  it('does not master after again -> good because the first good starts a new streak', () => {
    const afterAgain = scheduleReview({ status: 'new', correctCount: 0, incorrectCount: 0, lastRating: null }, 'again', now);
    const result = scheduleReview({
      status: afterAgain.status,
      correctCount: afterAgain.correctCount,
      incorrectCount: afterAgain.incorrectCount,
      lastRating: afterAgain.lastRating
    }, 'good', now);

    expect(result.status).toBe('learning');
  });
});
