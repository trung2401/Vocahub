'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, CircleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnswerOption } from '@/components/AnswerOption';
import { SummaryPanel } from '@/components/SummaryPanel';
import { useApp } from '@/lib/app-context';
import { copy, quizTerms } from '@/data/mockData';

export interface QuizPageProps { params: { deckId: string }; }

export default function QuizPage({ params }: Readonly<QuizPageProps>) {
  const { decks, entriesByDeck, recordReview } = useApp(); const deck = decks.find((item) => item.id === params.deckId); const entries = entriesByDeck[params.deckId] ?? [];
  const [index, setIndex] = useState(0); const [selected, setSelected] = useState<number | null>(null); const [score, setScore] = useState(0); const [wrong, setWrong] = useState<string[]>([]); const [done, setDone] = useState(false);
  const questions = useMemo(() => quizTerms.slice(0, Math.min(quizTerms.length, 10)), []); const question = questions[index];
  if (!deck || !question) return <div className="study-page" />;
  const choose = async (optionIndex: number) => { if (selected !== null) return; setSelected(optionIndex); const correct = question.options[optionIndex] === question.correct; const matching = entries.find((entry) => entry.term === question.term); if (matching) await recordReview({ entryId: matching.id, rating: correct ? 'good' : 'again', mode: 'quiz' }); if (correct) setScore((value) => value + 1); else setWrong((value) => [...value, question.term]); };
  const next = () => { if (index === questions.length - 1) setDone(true); else { setIndex((value) => value + 1); setSelected(null); } };
  const wrongEntries = entries.filter((entry) => wrong.includes(entry.term));
  if (done) return <div className="study-page"><div className="study-topbar"><span className="study-title">{deck.name}</span><Link href={`/decks/${deck.id}`} aria-label={copy.study.exit}>×</Link></div><SummaryPanel kind="quiz" score={score} total={questions.length} wrongTerms={wrongEntries} onRetry={() => { setIndex(0); setSelected(null); setScore(0); setWrong([]); setDone(false); }} onViewDeck={() => { window.location.href = `/decks/${deck.id}`; }} /></div>;
  return <div className="study-page"><div className="study-topbar"><span className="study-title">{copy.brand}</span><div className="study-progress"><div className="progress-line"><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div><span className="progress-text">Câu {index + 1}/{questions.length}</span></div><Link href={`/decks/${deck.id}`} aria-label={copy.study.exit}><ArrowLeft size={16} /></Link></div><div className="study-content quiz-content"><div className="quiz-question"><p>{copy.study.chooseMeaning}</p><h1>{question.term}</h1></div><div className="answer-list">{question.options.map((option, optionIndex) => { const isCorrect = option === question.correct; const state = selected === null ? 'default' : isCorrect ? 'selected-correct' : selected === optionIndex ? 'selected-wrong' : 'disabled'; return <AnswerOption key={option} index={optionIndex + 1} label={option} state={state} onClick={() => choose(optionIndex)} />; })}</div>{selected !== null && <div className="quiz-feedback"><span className={`feedback-pill ${question.options[selected] === question.correct ? '' : 'error'}`}>{question.options[selected] === question.correct ? <><CheckCircle2 size={12} /> {copy.study.correct}</> : <><CircleAlert size={12} /> {copy.study.incorrect}</>}</span><small>{copy.study.correctAnswer}: {question.correct}</small><button className="button button-primary" type="button" onClick={next}>{copy.study.next} →</button><small>Nhấn Enter để tiếp tục</small></div>}</div></div>;
}
