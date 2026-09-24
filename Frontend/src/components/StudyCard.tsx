'use client';

import { Keyboard, RotateCcw, Volume2 } from 'lucide-react';
import { useEffect } from 'react';
import { copy } from '@/data/mockData';
import type { VocabularyEntry } from '@/domain/types';
import { cancelVocabularySpeech, speakVocabularyTerm } from './speechSynthesis';

export interface StudyCardProps {
  entry: VocabularyEntry;
  flipped: boolean;
  onFlip: () => void;
}

export function StudyCard({ entry, flipped, onFlip }: Readonly<StudyCardProps>) {
  useEffect(() => () => {
    cancelVocabularySpeech();
  }, [entry.id]);

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onFlip();
    }
  };

  return (
    <div
      className={`study-card ${flipped ? 'is-flipped' : ''}`}
      onClick={onFlip}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      aria-label={flipped ? copy.study.flipToFront : copy.study.flipToBack}
      aria-pressed={flipped}
    >
      <span className="study-card-inner">
        <span className="study-card-topline">
          <span className="card-label">{flipped ? copy.study.back : copy.study.front}</span>
          <button
            className="audio-mark"
            type="button"
            aria-label={`Phát âm ${entry.term}`}
            title="Phát âm từ vựng"
            onClick={(event) => { event.stopPropagation(); speakVocabularyTerm(entry.term); }}
          >
            <Volume2 size={18} aria-hidden="true" />
          </button>
        </span>
        <span className="study-card-main" key={flipped ? 'back' : 'front'}>
          {flipped ? (
            <>
              <span className="study-card-kicker">{copy.study.meaningLabel}</span>
              <span className="study-card-meaning">{entry.meaning}</span>
              <span className="study-card-details">
                {entry.pronunciation && <span className="pronunciation">{entry.pronunciation}</span>}
                {entry.partOfSpeech && <span className="part-of-speech">{entry.partOfSpeech}</span>}
              </span>
              {entry.example && <span className="study-card-example"><span>Ví dụ</span>{entry.example}</span>}
            </>
          ) : (
            <>
              <span className="study-card-kicker">{copy.study.termLabel}</span>
              <span className="study-card-term">{entry.term}</span>
            </>
          )}
        </span>
        <span className="study-card-footer">
          {flipped ? <><span className="rating-hint">{copy.study.rateHint}</span><span className="keyboard-hint"><Keyboard size={13} /> Space</span></> : <><span className="flip-hint"><RotateCcw size={12} /> {copy.study.flipHint}</span><span className="keyboard-hint"><Keyboard size={13} /> Space</span></>}
        </span>
      </span>
    </div>
  );
}
