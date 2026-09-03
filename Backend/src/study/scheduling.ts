import type { VocabularyEntryEntity } from '../vocabulary/entities/vocabulary-entry.entity';

export type ReviewRating = 'again' | 'hard' | 'good';

export interface ScheduleResult {
  status: VocabularyEntryEntity['status'];
  nextReviewAt: Date;
  correctCount: number;
  incorrectCount: number;
}

export function scheduleReview(entry: Pick<VocabularyEntryEntity, 'status' | 'correctCount' | 'incorrectCount'>, rating: ReviewRating, now = new Date()): ScheduleResult {
  const nextReviewAt = new Date(now);
  if (rating === 'again') nextReviewAt.setMinutes(nextReviewAt.getMinutes() + 10);
  if (rating === 'hard') nextReviewAt.setDate(nextReviewAt.getDate() + 1);
  if (rating === 'good') nextReviewAt.setDate(nextReviewAt.getDate() + 3);
  const correctCount = entry.correctCount + (rating === 'good' ? 1 : 0);
  const incorrectCount = entry.incorrectCount + (rating === 'good' ? 0 : 1);
  const status = rating !== 'good' ? 'learning' : entry.status === 'mastered' ? 'mastered' : entry.status === 'learning' && correctCount >= 2 ? 'mastered' : 'learning';
  return { status, nextReviewAt, correctCount, incorrectCount };
}
