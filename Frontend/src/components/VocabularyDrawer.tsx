'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import type { VocabularyEntry } from '@/domain/types';
import { copy } from '@/data/mockData';
import { InlineError } from '@/components/InlineError';

export interface VocabularyDrawerProps {
  entry?: VocabularyEntry;
  onClose: () => void;
  onSave: (values: { term: string; meaning: string; pronunciation?: string; example?: string; partOfSpeech?: string }) => Promise<void>;
}

export function VocabularyDrawer({ entry, onClose, onSave }: Readonly<VocabularyDrawerProps>) {
  const [term, setTerm] = useState(entry?.term ?? '');
  const [meaning, setMeaning] = useState(entry?.meaning ?? '');
  const [pronunciation, setPronunciation] = useState(entry?.pronunciation ?? '');
  const [example, setExample] = useState(entry?.example ?? '');
  const [partOfSpeech, setPartOfSpeech] = useState(entry?.partOfSpeech ?? 'Động từ (v)');
  const [error, setError] = useState('');
  const save = async () => { if (!term.trim() || !meaning.trim()) { setError(copy.deck.requiredError); return; } await onSave({ term: term.trim(), meaning: meaning.trim(), pronunciation: pronunciation.trim() || undefined, example: example.trim() || undefined, partOfSpeech: partOfSpeech || undefined }); };
  return <div className="modal-backdrop"><section className="drawer" role="dialog" aria-modal="true" aria-labelledby="vocab-drawer-title"><header className="drawer-header"><h2 id="vocab-drawer-title">{entry ? copy.deck.formTitleEdit : copy.deck.formTitleAdd}</h2><button className="icon-button" type="button" aria-label={copy.deck.close} onClick={onClose}><X size={16} /></button></header><div className="drawer-body"><div className="field"><label htmlFor="v-term">{copy.deck.term} <strong>*</strong></label><input id="v-term" value={term} onChange={(event) => setTerm(event.target.value)} aria-invalid={Boolean(error)} /></div><div className="field"><label htmlFor="v-meaning">{copy.deck.meaning} <strong>*</strong></label><input id="v-meaning" value={meaning} onChange={(event) => setMeaning(event.target.value)} aria-invalid={Boolean(error)} />{error && <InlineError message={error} />}</div><div className="field"><label htmlFor="v-pronunciation">{copy.deck.pronunciation}</label><input id="v-pronunciation" placeholder="/əˈlaɪv/" value={pronunciation} onChange={(event) => setPronunciation(event.target.value)} /></div><div className="field"><label htmlFor="v-pos">{copy.deck.partOfSpeech}</label><select id="v-pos" value={partOfSpeech} onChange={(event) => setPartOfSpeech(event.target.value)}><option>Động từ (v)</option><option>Danh từ (n)</option><option>Tính từ (adj)</option></select></div><div className="field"><label htmlFor="v-example">{copy.deck.example}</label><textarea id="v-example" placeholder="Nhập câu ví dụ" value={example} onChange={(event) => setExample(event.target.value)} /></div></div><footer className="drawer-footer"><button className="button button-secondary" type="button" onClick={onClose}>{copy.import.cancel}</button><button className="button button-primary" type="button" onClick={save}>{copy.deck.save}</button></footer></section></div>;
}
