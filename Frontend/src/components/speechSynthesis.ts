const SPEECH_RATE = 0.72;
const SPEECH_START_DELAY_MS = 40;
let pendingStart: ReturnType<typeof setTimeout> | null = null;
let pendingVoiceTimer: ReturnType<typeof setTimeout> | null = null;
let removeVoiceListener: (() => void) | null = null;

const clearVoiceWait = (): void => {
  if (pendingVoiceTimer) {
    clearTimeout(pendingVoiceTimer);
    pendingVoiceTimer = null;
  }
  removeVoiceListener?.();
  removeVoiceListener = null;
};

export const cancelVocabularySpeech = (): void => {
  if (pendingStart) {
    clearTimeout(pendingStart);
    pendingStart = null;
  }
  clearVoiceWait();
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
};

export const speakVocabularyTerm = (term: string): boolean => {
  if (typeof window === 'undefined' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
  const synthesis = window.speechSynthesis;
  const utterance = new window.SpeechSynthesisUtterance(term);
  utterance.lang = 'en-US';
  utterance.rate = SPEECH_RATE;
  utterance.pitch = 1;
  utterance.volume = 1;
  cancelVocabularySpeech();
  const queueSpeech = (voices: SpeechSynthesisVoice[]) => {
    clearVoiceWait();
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === 'en-us')
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('en-'))
      ?? null;
    pendingStart = setTimeout(() => {
      pendingStart = null;
      synthesis.speak(utterance);
    }, SPEECH_START_DELAY_MS);
  };
  const voices = synthesis.getVoices();
  if (voices.length) queueSpeech(voices);
  else {
    const onVoicesChanged = () => queueSpeech(synthesis.getVoices());
    synthesis.addEventListener('voiceschanged', onVoicesChanged, { once: true });
    removeVoiceListener = () => synthesis.removeEventListener('voiceschanged', onVoicesChanged);
    pendingVoiceTimer = setTimeout(() => queueSpeech(synthesis.getVoices()), 300);
  }
  return true;
};
