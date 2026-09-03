import { Check, X } from 'lucide-react';

export interface AnswerOptionProps {
  index: number;
  label: string;
  state?: 'default' | 'selected-correct' | 'selected-wrong' | 'disabled';
  onClick: () => void;
}

export function AnswerOption({ index, label, state = 'default', onClick }: Readonly<AnswerOptionProps>) {
  return <button className={`answer-option ${state}`} type="button" disabled={state !== 'default'} onClick={onClick}><span className="answer-index">{index}</span><span>{label}</span>{state === 'selected-correct' && <Check size={15} />} {state === 'selected-wrong' && <X size={15} />}</button>;
}
