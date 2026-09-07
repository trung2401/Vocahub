import type { VocabularyEntry } from '@/domain/types';

export const selectFlashcardEntries = (entries: VocabularyEntry[]): VocabularyEntry[] => [...entries];
