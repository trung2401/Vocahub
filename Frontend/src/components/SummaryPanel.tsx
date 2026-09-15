import { ArrowRight, CheckCircle2, RotateCcw, Target } from 'lucide-react';
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
  return (
    <main className="summary-content study-content">
      <section className="summary-panel" aria-labelledby="study-summary-title">
        <div className="summary-hero">
          <span className="summary-icon"><CheckCircle2 size={25} /></span>
          <span className="summary-kicker">{copy.study.sessionComplete}</span>
          <h1 id="study-summary-title">{copy.study.completed}</h1>
          <p>{kind === 'quiz' ? copy.study.quizCompleteHint : copy.study.flashcardCompleteHint}</p>
        </div>
        <div className="summary-score-block">
          <div className="summary-score" aria-label={`${score} trên ${total}`}>{score}<span>/{total}</span></div>
          <div className="summary-accuracy"><Target size={15} /> <strong>{accuracy}%</strong> {copy.study.accuracy}</div>
          <div className="summary-progress" role="progressbar" aria-label={copy.study.accuracy} aria-valuemin={0} aria-valuemax={100} aria-valuenow={accuracy}><span style={{ width: `${accuracy}%` }} /></div>
        </div>
        <div className="summary-grid">
          <div className="summary-box">
            <h2>{kind === 'quiz' ? copy.study.quizResults : copy.study.progress}</h2>
            {kind === 'quiz' && wrongTerms.length ? <ul className="wrong-list">{wrongTerms.map((entry) => <li key={entry.id}><span>{entry.term}</span><ArrowRight size={13} /></li>)}</ul> : <div className="distribution"><div className="distribution-row mastered"><span>{copy.statuses.mastered}</span><strong>{score}</strong></div><div className="distribution-row learning"><span>{copy.statuses.learning}</span><strong>{Math.max(total - score, 0)}</strong></div><div className="distribution-row new"><span>{copy.statuses.new}</span><strong>0</strong></div></div>}
          </div>
          <div className="summary-box">
            <h2>{copy.study.memoryDistribution}</h2>
            <div className="distribution"><div className="distribution-row mastered"><span>{copy.statuses.mastered}</span><strong>{score}</strong></div><div className="distribution-row learning"><span>{copy.statuses.learning}</span><strong>{Math.max(total - score, 0)}</strong></div><div className="distribution-row new"><span>{copy.statuses.new}</span><strong>0</strong></div></div>
          </div>
        </div>
        <div className="summary-actions">
          <button className="button button-secondary" type="button" onClick={onViewDeck}>{copy.study.viewDeck}</button>
          <button className="button button-primary" type="button" onClick={onRetry}><RotateCcw size={14} />{kind === 'quiz' ? copy.study.reviewWrong : copy.study.retry}</button>
        </div>
      </section>
    </main>
  );
}
