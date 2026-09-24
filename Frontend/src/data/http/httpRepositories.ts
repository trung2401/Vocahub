import type { Deck, DeckSummary, VocabularyEntry } from '@/domain/types';
import { apiRequest } from './httpClient';
import type { CreateVocabularyInput, DeckRepository, ReviewResult, StudyRepository, UpdateVocabularyInput, VocabularyListPage, VocabularyListPageOptions, VocabularyRepository } from '@/data/ports/repositories';

const entryBody = (input: CreateVocabularyInput | UpdateVocabularyInput) => ({
  term: input.term,
  meaning: input.meaning,
  pronunciation: input.pronunciation,
  example: input.example,
  partOfSpeech: input.partOfSpeech
});

export class HttpDeckRepository implements DeckRepository {
  list() { return apiRequest<Deck[]>('/decks'); }
  listSummaries() { return apiRequest<DeckSummary[]>('/decks/summary'); }
  get(id: string) { return apiRequest<Deck>(`/decks/${encodeURIComponent(id)}`); }
  create(input: { name: string; source: Deck['source'] }) { return apiRequest<Deck>('/decks', { method: 'POST', body: JSON.stringify(input) }); }
  update(id: string, input: { name: string }) { return apiRequest<Deck>(`/decks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) }); }
  async delete(id: string) { await apiRequest<void>(`/decks/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
}

export class HttpVocabularyRepository implements VocabularyRepository {
  listByDeck(deckId: string) { return apiRequest<VocabularyEntry[]>(`/decks/${encodeURIComponent(deckId)}/entries`); }
  listPage(deckId: string, options: VocabularyListPageOptions = {}) {
    const params = new URLSearchParams();
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    if (options.offset !== undefined) params.set('offset', String(options.offset));
    if (options.search) params.set('search', options.search);
    if (options.status) params.set('status', options.status);
    const query = params.toString();
    return apiRequest<VocabularyListPage>(`/decks/${encodeURIComponent(deckId)}/entries/page${query ? `?${query}` : ''}`);
  }
  create(input: CreateVocabularyInput) { return apiRequest<VocabularyEntry>(`/decks/${encodeURIComponent(input.deckId)}/entries`, { method: 'POST', body: JSON.stringify(entryBody(input)) }); }
  update(id: string, input: UpdateVocabularyInput) { return apiRequest<VocabularyEntry>(`/entries/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(entryBody(input)) }); }
  async delete(id: string) { await apiRequest<void>(`/entries/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
  saveMany(entries: CreateVocabularyInput[]) {
    if (!entries.length) return Promise.resolve([] as VocabularyEntry[]);
    const deckId = entries[0].deckId;
    return apiRequest<VocabularyEntry[]>(`/decks/${encodeURIComponent(deckId)}/entries/bulk`, { method: 'POST', body: JSON.stringify({ entries: entries.map(entryBody) }) });
  }
}

export class HttpStudyRepository implements StudyRepository {
  recordReview(input: ReviewResult) { return apiRequest<VocabularyEntry>(`/entries/${encodeURIComponent(input.entryId)}/review`, { method: 'POST', body: JSON.stringify({ rating: input.rating, mode: input.mode ?? 'flashcard' }) }); }
  getDueEntries(deckId: string, now: string) { return apiRequest<VocabularyEntry[]>(`/decks/${encodeURIComponent(deckId)}/due?now=${encodeURIComponent(now)}`); }
}

export const createHttpRepositories = () => {
  const deck = new HttpDeckRepository();
  const vocabulary = new HttpVocabularyRepository();
  return { deck, vocabulary, study: new HttpStudyRepository() };
};

export async function importDeck(name: string, fileName: string, entries: CreateVocabularyInput[]) {
  return apiRequest<{ deck: Deck; entries: VocabularyEntry[]; counts: { total: number; created: number; validRows: number; invalidRows: number } }>('/imports/decks', {
    method: 'POST',
    body: JSON.stringify({ name, fileName, entries: entries.map(entryBody) })
  });
}
