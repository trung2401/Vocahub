import { scheduleReview } from './scheduling';

describe('scheduleReview', () => {
  const now = new Date('2026-08-28T10:00:00.000Z');

  it('moves a new entry to learning and schedules good for three days', () => {
    const result = scheduleReview({ status: 'new', correctCount: 0, incorrectCount: 0 }, 'good', now);
    expect(result.status).toBe('learning');
    expect(result.correctCount).toBe(1);
    expect(result.nextReviewAt.toISOString()).toBe('2026-08-31T10:00:00.000Z');
  });

  it('masters an entry after the second consecutive good review', () => {
    const result = scheduleReview({ status: 'learning', correctCount: 1, incorrectCount: 0 }, 'good', now);
    expect(result.status).toBe('mastered');
  });

  it('returns learning and a ten-minute interval after again', () => {
    const result = scheduleReview({ status: 'mastered', correctCount: 4, incorrectCount: 0 }, 'again', now);
    expect(result.status).toBe('learning');
    expect(result.incorrectCount).toBe(1);
    expect(result.nextReviewAt.toISOString()).toBe('2026-08-28T10:10:00.000Z');
  });
});
