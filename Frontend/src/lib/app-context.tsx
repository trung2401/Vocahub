'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Deck, ImportRow, VocabularyEntry } from '@/domain/types';
import type { CreateVocabularyInput, ReviewResult, UpdateVocabularyInput } from '@/data/ports/repositories';
import { createHttpRepositories, importDeck } from '@/data/http/httpRepositories';
import { apiRequest } from '@/data/http/httpClient';
import { MockVocabularyFileParser } from '@/data/local/mock/mockParser';
import { usePathname, useRouter } from 'next/navigation';

export interface AuthUser { id: string; email: string; createdAt: string; }

interface AppContextValue {
  decks: Deck[];
  entriesByDeck: Record<string, VocabularyEntry[]>;
  refresh: () => Promise<void>;
  createDeck: (name: string, source?: Deck['source']) => Promise<Deck>;
  renameDeck: (id: string, name: string) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  createEntry: (input: CreateVocabularyInput) => Promise<void>;
  updateEntry: (id: string, input: UpdateVocabularyInput) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  recordReview: (input: ReviewResult) => Promise<void>;
  saveImportedRows: (name: string, rows: ImportRow[], fileName?: string) => Promise<Deck>;
  parser: MockVocabularyFileParser;
  user: AuthUser | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: Readonly<AppProviderProps>) {
  const repositories = useMemo(() => createHttpRepositories(), []);
  const pathname = usePathname();
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [entriesByDeck, setEntriesByDeck] = useState<Record<string, VocabularyEntry[]>>({});
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        let nextUser: AuthUser;
        try { nextUser = await apiRequest<AuthUser>('/auth/me'); }
        catch { await apiRequest('/auth/refresh', { method: 'POST' }); nextUser = await apiRequest<AuthUser>('/auth/me'); }
        if (active) setUser(nextUser);
      } catch { if (active) setUser(null); }
      finally { if (active) setAuthLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authLoading && !user && pathname !== '/login' && pathname !== '/register') router.replace('/login');
  }, [authLoading, pathname, router, user]);

  const refresh = useCallback(async () => {
    const nextDecks = await repositories.deck.list();
    const entries = await Promise.all(nextDecks.map(async (deck) => [deck.id, await repositories.vocabulary.listByDeck(deck.id)] as const));
    setDecks(nextDecks);
    setEntriesByDeck(Object.fromEntries(entries));
  }, [repositories]);

  useEffect(() => { if (user) void refresh(); }, [refresh, user]);

  const value = useMemo<AppContextValue>(() => ({
    decks,
    entriesByDeck,
    refresh,
    createDeck: async (name, source = 'manual') => {
      const deck = await repositories.deck.create({ name, source });
      await refresh();
      return deck;
    },
    renameDeck: async (id, name) => { await repositories.deck.update(id, { name }); await refresh(); },
    deleteDeck: async (id) => { await repositories.deck.delete(id); await refresh(); },
    createEntry: async (input) => { await repositories.vocabulary.create(input); await refresh(); },
    updateEntry: async (id, input) => { await repositories.vocabulary.update(id, input); await refresh(); },
    deleteEntry: async (id) => { await repositories.vocabulary.delete(id); await refresh(); },
    recordReview: async (input) => { await repositories.study.recordReview(input); await refresh(); },
    saveImportedRows: async (name, rows, fileName = 'import') => {
      const validEntries = rows.filter((row) => row.included && row.issues.length === 0).map((row) => ({
        deckId: '',
        term: row.values.term,
        meaning: row.values.meaning,
        pronunciation: row.values.pronunciation,
        example: row.values.example,
        partOfSpeech: row.values.partOfSpeech
      }));
      const imported = await importDeck(name, fileName, validEntries);
      await refresh();
      return imported.deck;
    },
    parser: new MockVocabularyFileParser(),
    user,
    authLoading,
    login: async (email, password) => { const nextUser = await apiRequest<AuthUser>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setUser(nextUser); setAuthLoading(false); router.replace('/'); },
    register: async (email, password) => { const nextUser = await apiRequest<AuthUser>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }); setUser(nextUser); setAuthLoading(false); router.replace('/'); },
    logout: async () => { await apiRequest<{ ok: boolean }>('/auth/logout', { method: 'POST' }); setUser(null); router.replace('/login'); }
  }), [authLoading, decks, entriesByDeck, refresh, repositories, router, user]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = (): AppContextValue => {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used within AppProvider');
  return value;
};
