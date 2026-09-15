'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, Keyboard, LoaderCircle, RotateCcw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnswerOption } from '@/components/AnswerOption';
import { InlineError } from '@/components/InlineError';
import { SummaryPanel } from '@/components/SummaryPanel';
import { useApp } from '@/lib/app-context';
import { copy } from '@/data/mockData';
import { buildQuizQuestions } from '@/data/local/quiz';

export interface QuizPageProps { params: { deckId: string }; }

export default function QuizPage({ params }: Readonly<QuizPageProps>) {
  const { decks, entriesByDeck, recordReview } = useApp();
  const deck = decks.find((item) => item.id === params.deckId);
  const entries = useMemo(() => entriesByDeck[params.deckId] ?? [], [entriesByDeck, params.deckId]);
  const questions = useMemo(() => buildQuizQuestions(entries), [entries]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [failedOption, setFailedOption] = useState<number | null>(null);
  const [reviewError, setReviewError] = useState('');
  const question = questions[index];
  const progress = questions.length ? Math.round(((index + 1) / questions.length) * 100) : 0;

  const next = useCallback(() => {
    if (savingReview || selected === null) return;
    if (index === questions.length - 1) setDone(true);
    else {
      setIndex((value) => value + 1);
      setSelected(null);
    }
  }, [index, questions.length, savingReview, selected]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && selected !== null) {
        event.preventDefault();
        next();
      }
      if (event.key === 'Escape') window.location.href = `/decks/${params.deckId}`;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, params.deckId, selected]);

  if (!deck) return <div className="study-page" />;
  if (!questions.length || !question) {
    return <div className="study-page"><QuizTopbar deckName={deck.name} current={0} total={0} onExit={`/decks/${deck.id}`} /><main className="study-content"><div className="study-empty"><span className="study-empty-icon"><Sparkles size={20} /></span><h1>{copy.errors.insufficientChoices}</h1><p>Thêm ít nhất bốn nghĩa khác nhau để mở phiên quiz.</p><Link className="button button-secondary" href={`/decks/${deck.id}`}><ArrowLeft size={14} />{copy.study.viewDeck}</Link></div></main></div>;
  }

  const choose = async (optionIndex: number) => {
    if (selected !== null || savingReview) return;
    const correct = question.options[optionIndex] === question.correct;
    setSavingReview(true);
    setFailedOption(null);
    setReviewError('');
    try {
      await recordReview({ entryId: question.entryId, rating: correct ? 'good' : 'again', mode: 'quiz' });
      setSelected(optionIndex);
      if (correct) setScore((value) => value + 1);
      else setWrong((value) => [...value, question.entryId]);
    } catch (caught) {
      setFailedOption(optionIndex);
      setReviewError(caught instanceof Error && caught.message ? caught.message : copy.errors.review);
    } finally {
      setSavingReview(false);
    }
  };

  const wrongEntries = entries.filter((entry) => wrong.includes(entry.id));
  if (done) {
    return <div className="study-page"><QuizTopbar deckName={deck.name} current={questions.length} total={questions.length} onExit={`/decks/${deck.id}`} /><SummaryPanel kind="quiz" score={score} total={questions.length} wrongTerms={wrongEntries} onRetry={() => { setIndex(0); setSelected(null); setScore(0); setWrong([]); setDone(false); }} onViewDeck={() => { window.location.href = `/decks/${deck.id}`; }} /></div>;
  }

  return (
    <div className="study-page">
      <QuizTopbar deckName={deck.name} current={index + 1} total={questions.length} onExit={`/decks/${deck.id}`} />
      <main className="study-content quiz-content">
        <section className="quiz-question-panel" aria-labelledby="quiz-question-title">
          <span className="study-mode-pill"><Sparkles size={14} />{copy.deck.quiz}</span>
          <p className="quiz-question-label">{copy.study.chooseMeaning}</p>
          <h1 id="quiz-question-title">{question.term}</h1>
          <p className="quiz-question-meta">Chọn một đáp án phù hợp nhất với từ vựng.</p>
        </section>
        <div className="answer-list" role="group" aria-label="Các đáp án">
          {question.options.map((option, optionIndex) => {
            const isCorrect = option === question.correct;
            const state = selected === null ? (savingReview ? 'disabled' : 'default') : isCorrect ? 'selected-correct' : selected === optionIndex ? 'selected-wrong' : 'disabled';
            return <AnswerOption key={`${question.entryId}-${option}`} index={optionIndex + 1} label={option} state={state} onClick={() => void choose(optionIndex)} />;
          })}
        </div>
        {savingReview && <p className="review-saving" role="status"><LoaderCircle size={13} className="spin" /> Đang lưu kết quả...</p>}
        {reviewError && <div className="review-error"><InlineError message={reviewError} />{failedOption !== null && <button className="button button-secondary review-retry" type="button" onClick={() => void choose(failedOption)} disabled={savingReview}><RotateCcw size={13} />{copy.errors.retryReview}</button>}</div>}
        {selected !== null && <section className={`quiz-feedback ${question.options[selected] === question.correct ? 'is-correct' : 'is-wrong'}`} aria-live="polite"><div className="feedback-icon">{question.options[selected] === question.correct ? <CheckCircle2 size={21} /> : <CircleAlert size={21} />}</div><div className="feedback-copy"><strong>{question.options[selected] === question.correct ? copy.study.correct : copy.study.incorrect}</strong><span>{copy.study.correctAnswer}: <b>{question.correct}</b></span></div><button className="button button-primary feedback-next" type="button" onClick={next}>{copy.study.next}<ArrowRight size={14} /></button><span className="feedback-keyboard"><Keyboard size={13} /> Enter</span></section>}
        <div className="study-progress-caption"><span>Câu {index + 1} trong {questions.length}</span><strong>{progress}%</strong></div>
      </main>
    </div>
  );
}

function QuizTopbar({ deckName, current, total, onExit }: Readonly<{ deckName: string; current: number; total: number; onExit: string }>) {
  const progress = total ? Math.round((current / total) * 100) : 0;
  return (
    <header className="study-topbar">
      <div className="study-topbar-left">
        <Link className="study-exit" href={onExit} aria-label={copy.study.exit}><ArrowLeft size={17} /></Link>
        <div className="study-context"><span className="study-kicker">{copy.brand} / {copy.deck.quiz}</span><strong className="study-title">{deckName}</strong></div>
      </div>
      <div className="study-progress" aria-label={`Tiến độ câu ${current} trên ${total}`}>
        <div className="progress-line"><span style={{ width: `${progress}%` }} /></div>
        <div className="study-progress-meta"><span>{current || '-'} / {total || '-'}</span><small>{total ? `${Math.max(total - current, 0)} câu còn lại` : 'Chưa bắt đầu'}</small></div>
      </div>
      <span className="study-brand-mark">VH</span>
    </header>
  );
}
