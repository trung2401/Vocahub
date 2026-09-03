'use client';

import { RotateCcw, Volume2 } from 'lucide-react';
import { copy } from '@/data/mockData';
import type { VocabularyEntry } from '@/domain/types';

export interface StudyCardProps {
  entry: VocabularyEntry;
  flipped: boolean;
  onFlip: () => void;
}

export function StudyCard({ entry, flipped, onFlip }: Readonly<StudyCardProps>) {
  return <button className="study-card" type="button" onClick={onFlip} aria-label="Lật thẻ flashcard" aria-pressed={flipped}><span className="card-label">{flipped ? copy.study.back : copy.study.front}</span><Volume2 className="icon-button" size={14} aria-label="Phát âm" /><h1>{flipped ? entry.meaning : entry.term}</h1>{flipped ? <p>{entry.pronunciation} · {entry.example}</p> : <p className="flip-hint"><RotateCcw size={11} /> {copy.study.flipHint}</p>}</button>;
}
