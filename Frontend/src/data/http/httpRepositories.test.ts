import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpDeckRepository, HttpStudyRepository, HttpVocabularyRepository } from './httpRepositories';

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

  it('reads due entries through the dedicated endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([{ id: 'entry-1' }]), { status: 200 }));

    await expect(new HttpStudyRepository().getDueEntries('deck 1', '2026-01-01T00:00:00.000Z')).resolves.toEqual([{ id: 'entry-1' }]);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/decks/deck%201/due?now=2026-01-01T00%3A00%3A00.000Z'),
      expect.objectContaining({ credentials: 'include' })
    );
  });
});

describe('HttpDeckRepository', () => {
  it('loads aggregate summaries for all decks', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify([
      { deckId: 'deck-1', totalEntries: 10, dueEntries: 3, masteredEntries: 4, learningEntries: 5 }
    ]), { status: 200 }));

    await expect(new HttpDeckRepository().listSummaries()).resolves.toEqual([
      { deckId: 'deck-1', totalEntries: 10, dueEntries: 3, masteredEntries: 4, learningEntries: 5 }
    ]);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/decks/summary'), expect.objectContaining({ credentials: 'include' }));
  });
});

describe('HttpVocabularyRepository', () => {
  it('encodes pagination and filters for a vocabulary page', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ items: [], total: 0, limit: 25, offset: 50 }), { status: 200 }));

    await expect(new HttpVocabularyRepository().listPage('deck 1', { limit: 25, offset: 50, search: 'hello world', status: 'learning' })).resolves.toEqual({
      items: [], total: 0, limit: 25, offset: 50
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/decks/deck%201/entries/page?limit=25&offset=50&search=hello+world&status=learning'),
      expect.objectContaining({ credentials: 'include' })
    );
  });
});
