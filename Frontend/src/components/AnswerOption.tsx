import { Check, X } from 'lucide-react';

export interface AnswerOptionProps {
  index: number;
  label: string;
  state?: 'default' | 'selected-correct' | 'selected-wrong' | 'disabled';
  onClick: () => void;
}

export function AnswerOption({ index, label, state = 'default', onClick }: Readonly<AnswerOptionProps>) {
  const isSelected = state === 'selected-correct' || state === 'selected-wrong';
  return (
    <button
      className={`answer-option ${state}`}
      type="button"
      disabled={state !== 'default'}
      onClick={onClick}
      aria-pressed={isSelected}
      data-state={state}
    >
      <span className="answer-index">{index}</span>
      <span className="answer-label">{label}</span>
      <span className="answer-status" aria-hidden="true">
        {state === 'selected-correct' && <Check size={17} />}
        {state === 'selected-wrong' && <X size={17} />}
      </span>
    </button>
  );
}
