import { createSampleEntries, sampleDeck } from '@/data/mockData';
import type { Deck, DeckSummary, VocabularyEntry } from '@/domain/types';
import type {
  CreateVocabularyInput,
  DeckRepository,
  ReviewResult,
  StudyRepository,
  UpdateVocabularyInput, VocabularyListPage, VocabularyListPageOptions,
  VocabularyRepository
} from '@/data/ports/repositories';

const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export class MockDeckRepository implements DeckRepository {
  private decks: Deck[] = [sampleDeck];

  public constructor(private readonly getEntries: () => VocabularyEntry[] = () => []) {}

  async list(): Promise<Deck[]> {
    return [...this.decks];
  }

  async listSummaries(): Promise<DeckSummary[]> {
    const now = Date.now();
    const entries = this.getEntries();
    return this.decks.map((deck) => {
      const deckEntries = entries.filter((entry) => entry.deckId === deck.id);
      return {
        deckId: deck.id,
        totalEntries: deckEntries.length,
        dueEntries: deckEntries.filter((entry) => Date.parse(entry.nextReviewAt) <= now).length,
        masteredEntries: deckEntries.filter((entry) => entry.status === 'mastered').length,
        learningEntries: deckEntries.filter((entry) => entry.status === 'learning').length
      };
    });
  }

  async get(id: string): Promise<Deck | null> {
    return this.decks.find((deck) => deck.id === id) ?? null;
  }

  async create(input: { name: string; source: Deck['source'] }): Promise<Deck> {
    const deck: Deck = {
      id: makeId('deck'),
      name: input.name,
      source: input.source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.decks = [deck, ...this.decks];
    return deck;
  }

  async update(id: string, input: { name: string }): Promise<Deck> {
    const current = await this.get(id);
    if (!current) throw new Error('not_found');
    const updated = { ...current, name: input.name, updatedAt: new Date().toISOString() };
    this.decks = this.decks.map((deck) => (deck.id === id ? updated : deck));
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.decks = this.decks.filter((deck) => deck.id !== id);
  }
}

export class MockVocabularyRepository implements VocabularyRepository {
  private entries: VocabularyEntry[] = createSampleEntries();

  snapshot(): VocabularyEntry[] {
    return [...this.entries];
  }

  async listByDeck(deckId: string): Promise<VocabularyEntry[]> {
    return this.entries.filter((entry) => entry.deckId === deckId);
  }

  async listPage(deckId: string, options: VocabularyListPageOptions = {}): Promise<VocabularyListPage> {
    const search = options.search?.trim().toLocaleLowerCase();
    const filtered = this.entries.filter((entry) => entry.deckId === deckId)
      .filter((entry) => !options.status || entry.status === options.status)
      .filter((entry) => !search || `${entry.term} ${entry.meaning}`.toLocaleLowerCase().includes(search));
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;
    return { items: filtered.slice(offset, offset + limit), total: filtered.length, limit, offset };
  }

  async getById(id: string): Promise<VocabularyEntry | null> {
    return this.entries.find((entry) => entry.id === id) ?? null;
  }

  async create(input: CreateVocabularyInput): Promise<VocabularyEntry> {
    const entry: VocabularyEntry = {
      id: makeId('entry'),
      deckId: input.deckId,
      term: input.term,
      meaning: input.meaning,
      pronunciation: input.pronunciation,
      example: input.example,
      partOfSpeech: input.partOfSpeech,
      status: input.status ?? 'new',
      nextReviewAt: new Date().toISOString(),
      correctCount: 0,
      incorrectCount: 0,
      lastRating: undefined
    };
    this.entries = [entry, ...this.entries];
    return entry;
  }

  async update(id: string, input: UpdateVocabularyInput): Promise<VocabularyEntry> {
    const current = this.entries.find((entry) => entry.id === id);
    if (!current) throw new Error('not_found');
    const updated = { ...current, ...input };
    this.entries = this.entries.map((entry) => (entry.id === id ? updated : entry));
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.entries = this.entries.filter((entry) => entry.id !== id);
  }

  async saveMany(inputs: CreateVocabularyInput[]): Promise<VocabularyEntry[]> {
    const saved = await Promise.all(inputs.map((input) => this.create(input)));
    return saved;
  }
}

export class MockStudyRepository implements StudyRepository {
  public constructor(private readonly vocabulary: MockVocabularyRepository) {}

  async recordReview(input: ReviewResult): Promise<VocabularyEntry> {
    const current = await this.vocabulary.getById(input.entryId);
    if (!current) throw new Error('not_found');
    const nextReviewAt = new Date();
    nextReviewAt.setMinutes(nextReviewAt.getMinutes() + (input.rating === 'again' ? 10 : input.rating === 'hard' ? 60 * 24 : 60 * 24 * 3));
    const consecutiveGood = input.rating === 'good' && current.lastRating === 'good';
    const status = input.rating === 'again' || input.rating === 'hard'
      ? 'learning'
      : current.status === 'mastered'
        ? 'mastered'
        : consecutiveGood
          ? 'mastered'
          : 'learning';
    return this.vocabulary.update(current.id, {
      status,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: nextReviewAt.toISOString(),
      correctCount: current.correctCount + (input.rating === 'good' ? 1 : 0),
      incorrectCount: current.incorrectCount + (input.rating === 'good' ? 0 : 1),
      lastRating: input.rating
    });
  }

  async getDueEntries(deckId: string, now: string): Promise<VocabularyEntry[]> {
    const current = await this.vocabulary.listByDeck(deckId);
    return current.filter((entry) => entry.nextReviewAt <= now);
  }
}

export const createMockRepositories = () => {
  const vocabulary = new MockVocabularyRepository();
  const deck = new MockDeckRepository(() => vocabulary.snapshot());
  return { deck, vocabulary, study: new MockStudyRepository(vocabulary) };
};
