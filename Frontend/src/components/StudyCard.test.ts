import { afterEach, describe, expect, it, vi } from 'vitest';
import { speakVocabularyTerm } from './speechSynthesis';

describe('speakVocabularyTerm', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('speaks the current term with an English voice and cancels queued speech', () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const speak = vi.fn();
    const utterance = { lang: '', rate: 0, pitch: 0, voice: null };
    const SpeechSynthesisUtterance = vi.fn(() => utterance);
    vi.stubGlobal('window', {
      SpeechSynthesisUtterance,
      speechSynthesis: {
        cancel,
        speak,
        getVoices: () => [{ lang: 'en-US' }, { lang: 'vi-VN' }]
      }
    });

    expect(speakVocabularyTerm('schedule')).toBe(true);
    expect(utterance).toMatchObject({ lang: 'en-US', rate: 0.72, pitch: 1, volume: 1, voice: { lang: 'en-US' } });
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(speak).not.toHaveBeenCalled();
    vi.advanceTimersByTime(40);
    expect(speak).toHaveBeenCalledWith(utterance);
  });

  it('returns false when speech synthesis is unavailable', () => {
    vi.stubGlobal('window', {});

    expect(speakVocabularyTerm('schedule')).toBe(false);
  });

  it('waits for voices to initialize before speaking the first time', () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const speak = vi.fn();
    const listeners = new Set<() => void>();
    const utterance = { lang: '', rate: 0, pitch: 0, volume: 0, voice: null };
    const SpeechSynthesisUtterance = vi.fn(() => utterance);
    const speechSynthesis = {
      cancel,
      speak,
      getVoices: () => [],
      addEventListener: vi.fn((_event: string, listener: () => void) => listeners.add(listener)),
      removeEventListener: vi.fn((_event: string, listener: () => void) => listeners.delete(listener))
    };
    vi.stubGlobal('window', { SpeechSynthesisUtterance, speechSynthesis });

    expect(speakVocabularyTerm('schedule')).toBe(true);
    expect(speak).not.toHaveBeenCalled();
    listeners.forEach((listener) => listener());
    vi.advanceTimersByTime(40);

    expect(speak).toHaveBeenCalledWith(utterance);
  });
});
