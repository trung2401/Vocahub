import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpStudyRepository } from './httpRepositories';

afterEach(() => vi.restoreAllMocks());

describe('HttpStudyRepository', () => {
  it('posts a review for the entry selected by flashcard or quiz', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ id: 'entry-1' }), { status: 200 }));

    await new HttpStudyRepository().recordReview({ entryId: 'entry-1', rating: 'good', mode: 'flashcard' });

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/entries/entry-1/review'), expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ rating: 'good', mode: 'flashcard' })
    }));
  });
});
