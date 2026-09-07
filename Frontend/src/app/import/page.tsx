'use client';

import { ArrowLeft, ArrowRight, Check, FileUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ColumnMapper } from '@/components/ColumnMapper';
import { Dropzone, type DropzoneState } from '@/components/Dropzone';
import { ImportPreviewTable } from '@/components/ImportPreviewTable';
import { InlineError } from '@/components/InlineError';
import { useApp } from '@/lib/app-context';
import { copy } from '@/data/mockData';
import { autoMapColumns, buildImportRows } from '@/data/local/mock/mockParser';

export interface ImportPageProps {}

const defaultMapping = { term: 'term', meaning: 'meaning', pronunciation: 'pronunciation', example: '', partOfSpeech: '' };

export default function ImportPage(_props: Readonly<ImportPageProps>) {
  const router = useRouter();
  const { parser, saveImportedRows } = useApp();
  const [step, setStep] = useState(1);
  const [dropState, setDropState] = useState<DropzoneState>('idle');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>(['term', 'meaning', 'pronunciation']);
  const [mapping, setMapping] = useState<Record<string, string>>(defaultMapping);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [includedByRow, setIncludedByRow] = useState<Record<number, boolean>>({});
  const [excludedRows, setExcludedRows] = useState<Set<number>>(new Set());
  const [deckName, setDeckName] = useState('TOEIC Vocabulary');
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setDropState('parsing'); setError(''); setFileName(file.name);
    try {
      const table = await parser.parse(file);
      setHeaders(table.headers); setRawRows(table.rows); setIncludedByRow({}); setExcludedRows(new Set()); setMapping(autoMapColumns(table.headers)); setDropState('success'); setStep(2);
    } catch (caught) {
      setDropState('error');
      const code = caught instanceof Error ? caught.message : '';
      setError(code === 'too_large' ? 'File vượt quá 10 MB.' : code === 'too_many_rows' ? 'File vượt quá 5.000 dòng.' : code === 'empty_file' ? 'File không có dữ liệu.' : code === 'invalid_file' ? 'File không hợp lệ hoặc thiếu tiêu đề cột.' : 'Định dạng file chưa được hỗ trợ.');
    }
  };

  const rows = useMemo(() => buildImportRows(rawRows, mapping, includedByRow, excludedRows), [excludedRows, includedByRow, mapping, rawRows]);
  const toggleRow = (rowNumber: number) => setIncludedByRow((current) => ({ ...current, [rowNumber]: !(current[rowNumber] ?? true) }));
  const removeRow = (rowNumber: number) => setExcludedRows((current) => new Set([...current, rowNumber]));
  const canCreate = Boolean(deckName.trim()) && rows.some((row) => row.included && row.issues.length === 0);

  const finish = async () => { if (!canCreate) return; const deck = await saveImportedRows(deckName.trim(), rows, fileName); router.push(`/decks/${deck.id}`); };

  return <AppShell><div className="content"><p className="breadcrumb">{copy.import.breadcrumb}</p><div className="page-heading"><h1>{copy.import.title}</h1></div><div className="stepper">{copy.import.steps.map((label, index) => { const number = index + 1; return <div className={`step ${step === number ? 'active' : ''} ${step > number ? 'done' : ''}`} key={label}><span className="step-dot">{step > number ? <Check size={13} /> : number}</span><span>{label}</span></div>; })}</div>{step === 1 ? <section className="import-panel"><Dropzone state={dropState} fileName={fileName} errorMessage={error} onFile={handleFile} />{error && <InlineError message={error} />}<div className="format-row"><span className="format-chips"><span className="chip">CSV</span><span className="chip">XLS/XLSX</span></span><span>{copy.import.maxSize}</span></div><div className="import-actions"><button className="button button-secondary" type="button" disabled><ArrowRight size={14} />{copy.import.next}</button></div></section> : <section className="import-panel"><ColumnMapper headers={headers} mapping={mapping} onChange={(field, value) => setMapping((current) => ({ ...current, [field]: value }))} /><ImportPreviewTable rows={rows} onToggle={toggleRow} onDelete={removeRow} /><div className="import-footer"><button className="button button-secondary" type="button" onClick={() => setStep(1)}><ArrowLeft size={14} />{copy.import.back}</button><div className="field"><label htmlFor="deck-name">{copy.import.deckName}</label><input id="deck-name" value={deckName} onChange={(event) => setDeckName(event.target.value)} placeholder={copy.import.deckNamePlaceholder} /></div><button className="button button-primary" type="button" disabled={!canCreate} onClick={finish}><FileUp size={14} />{copy.import.create}</button></div></section>}</div></AppShell>;
}
