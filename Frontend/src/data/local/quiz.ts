import type { VocabularyEntry } from '@/domain/types';

export interface QuizQuestion {
  entryId: string;
  term: string;
  correct: string;
  options: string[];
}

const normalized = (value: string) => value.trim().toLocaleLowerCase();

export const buildQuizQuestions = (entries: VocabularyEntry[], limit = 10): QuizQuestion[] => {
  const byMeaning = new Map<string, VocabularyEntry>();
  entries.forEach((entry) => {
    const meaning = entry.meaning.trim();
    const term = entry.term.trim();
    if (term && meaning && !byMeaning.has(normalized(meaning))) byMeaning.set(normalized(meaning), { ...entry, term, meaning });
  });
  const uniqueEntries = [...byMeaning.values()];
  if (uniqueEntries.length < 4) return [];

  return uniqueEntries.slice(0, limit).map((entry, index) => {
    const distractors = uniqueEntries
      .filter((candidate) => candidate.id !== entry.id)
      .slice(0, 3)
      .map((candidate) => candidate.meaning);
    const choices = [entry.meaning, ...distractors];
    const offset = index % choices.length;
    const options = choices.slice(offset).concat(choices.slice(0, offset));
    return { entryId: entry.id, term: entry.term, correct: entry.meaning, options };
  });
};

export const hasEnoughQuizData = (entries: VocabularyEntry[]): boolean => {
  const meanings = new Set(entries.map((entry) => normalized(entry.meaning)).filter(Boolean));
  return meanings.size >= 4;
};
