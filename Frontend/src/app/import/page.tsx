'use client';

import { ArrowLeft, ArrowRight, Check, FileUp, LoaderCircle } from 'lucide-react';
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
  const [saving, setSaving] = useState(false);

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

  const finish = async () => { if (!canCreate || saving) return; setSaving(true); setError(''); try { const deck = await saveImportedRows(deckName.trim(), rows, fileName); router.push(`/decks/${deck.id}`); } catch (caught) { setError(caught instanceof Error ? caught.message : copy.errors.storage); } finally { setSaving(false); } };

  return <AppShell><div className="content import-content"><p className="breadcrumb">{copy.import.breadcrumb}</p><div className="page-heading"><div><p className="eyebrow">Tạo deck từ dữ liệu sẵn có</p><h1>{copy.import.title}</h1><p className="page-lede">Đưa danh sách của bạn vào VocaHub, kiểm tra nhanh rồi bắt đầu học.</p></div></div><div className="stepper" aria-label="Tiến trình import">{copy.import.steps.map((label, index) => { const number = index + 1; return <div className={`step ${step === number ? 'active' : ''} ${step > number ? 'done' : ''} ${error && step === number ? 'has-error' : ''}`} key={label}><span className="step-dot">{step > number ? <Check size={13} /> : number}</span><span>{label}</span></div>; })}</div>{step === 1 ? <section className="import-panel"><div className="panel-heading"><div><p className="eyebrow">Bước 1</p><h2>Chọn file dữ liệu</h2></div><span className="panel-note">CSV hoặc Excel</span></div><Dropzone state={dropState} fileName={fileName} errorMessage={error} onFile={handleFile} />{error && <InlineError message={error} />}<div className="format-row"><span className="format-chips"><span className="chip">CSV</span><span className="chip">XLS/XLSX</span></span><span>{copy.import.maxSize} · tối đa 5.000 dòng</span></div><div className="import-actions"><button className="button button-secondary" type="button" disabled><ArrowRight size={14} />{copy.import.next}</button></div></section> : <section className="import-panel"><div className="panel-heading"><div><p className="eyebrow">Bước 2</p><h2>Kiểm tra trước khi tạo deck</h2></div><span className="panel-note">Dữ liệu chưa được lưu</span></div><ColumnMapper headers={headers} mapping={mapping} onChange={(field, value) => setMapping((current) => ({ ...current, [field]: value }))} /><ImportPreviewTable rows={rows} onToggle={toggleRow} onDelete={removeRow} />{error && <InlineError message={error} />}<div className="import-footer"><button className="button button-secondary" type="button" onClick={() => { setError(''); setStep(1); }} disabled={saving}><ArrowLeft size={14} />{copy.import.back}</button><div className="field"><label htmlFor="deck-name">{copy.import.deckName}</label><input id="deck-name" value={deckName} onChange={(event) => setDeckName(event.target.value)} placeholder={copy.import.deckNamePlaceholder} disabled={saving} /></div><button className="button button-primary" type="button" disabled={!canCreate || saving} onClick={() => void finish()}>{saving ? <><LoaderCircle size={14} className="spin" />Đang tạo...</> : <><FileUp size={14} />{copy.import.create}</>}</button></div></section>}</div></AppShell>;
}
