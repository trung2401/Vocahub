import { CheckCircle2 } from 'lucide-react';
import type { VocabularyEntry } from '@/domain/types';
import { copy } from '@/data/mockData';

export interface SummaryPanelProps {
  kind: 'flashcard' | 'quiz';
  score: number;
  total: number;
  wrongTerms?: VocabularyEntry[];
  onRetry: () => void;
  onViewDeck: () => void;
}

export function SummaryPanel({ kind, score, total, wrongTerms = [], onRetry, onViewDeck }: Readonly<SummaryPanelProps>) {
  const accuracy = Math.round((score / Math.max(total, 1)) * 100);
  return <div className="summary-content study-content"><div className="summary-panel"><span className="summary-icon"><CheckCircle2 size={24} /></span><h1>{copy.study.completed}</h1><div className="summary-score">{score}/{total}</div><span className="summary-subtitle">{kind === 'quiz' ? copy.study.score : copy.study.accuracy} · {accuracy}%</span><div className="summary-grid"><div className="summary-box"><h2>{kind === 'quiz' ? copy.study.quizResults : copy.study.progress}</h2>{kind === 'quiz' && wrongTerms.length ? <ul className="wrong-list">{wrongTerms.map((entry) => <li key={entry.id}>{entry.term}</li>)}</ul> : <div className="distribution"><div className="distribution-row"><span>{copy.statuses.mastered}</span><strong>{score}</strong></div><div className="distribution-row"><span>{copy.statuses.learning}</span><strong>{Math.max(total - score, 0)}</strong></div><div className="distribution-row"><span>{copy.statuses.new}</span><strong>0</strong></div></div>}</div><div className="summary-box"><h2>{copy.study.memoryDistribution}</h2><div className="distribution"><div className="distribution-row"><span>{copy.statuses.mastered}</span><strong>{score}</strong></div><div className="distribution-row"><span>{copy.statuses.learning}</span><strong>{Math.max(total - score, 0)}</strong></div><div className="distribution-row"><span>{copy.statuses.new}</span><strong>0</strong></div></div></div></div><div className="summary-actions"><button className="button button-secondary" type="button" onClick={onViewDeck}>{copy.study.viewDeck}</button><button className="button button-primary" type="button" onClick={onRetry}>{kind === 'quiz' ? copy.study.reviewWrong : copy.study.retry}</button></div></div></div>;
}
