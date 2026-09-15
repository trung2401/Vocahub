'use client';

import { CheckCircle2, CloudUpload, FileCheck2, FileWarning, LoaderCircle } from 'lucide-react';
import { copy } from '@/data/mockData';
import { useState } from 'react';

export type DropzoneState = 'idle' | 'dragging' | 'parsing' | 'success' | 'error';

export interface DropzoneProps {
  state: DropzoneState;
  fileName?: string;
  errorMessage?: string;
  onFile: (file: File) => void;
}

export function Dropzone({ state, fileName, errorMessage, onFile }: Readonly<DropzoneProps>) {
  const [dragging, setDragging] = useState(false);
  const icon = state === 'success' ? <FileCheck2 size={22} /> : state === 'error' ? <FileWarning size={22} /> : state === 'parsing' ? <LoaderCircle size={22} className="spin" /> : <CloudUpload size={22} />;
  const title = state === 'success' ? fileName : state === 'error' ? errorMessage : state === 'parsing' ? 'Đang đọc dữ liệu...' : copy.import.dropTitle;
  return <label className={`dropzone ${dragging ? 'dragging' : state}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) onFile(file); }}>
    <input className="file-input" type="file" accept=".csv,.xls,.xlsx" aria-label="Chọn file CSV hoặc Excel" disabled={state === 'parsing'} onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file); }} />
    <span className="drop-icon">{icon}</span>
    <span className="drop-state-label">{state === 'success' ? <CheckCircle2 size={12} /> : state === 'error' ? <FileWarning size={12} /> : null}{state === 'success' ? 'Đã nhận file' : state === 'error' ? 'Không thể đọc file' : 'NHẬP DỮ LIỆU'}</span>
    <h2>{title}</h2>
    <p>{state === 'success' ? 'File đã sẵn sàng để kiểm tra dữ liệu.' : state === 'error' ? 'Kiểm tra lại định dạng và thử một file khác.' : state === 'parsing' ? 'VocaHub đang chuẩn hóa các dòng trong file.' : copy.import.mobileDropHint}</p>
    {state !== 'parsing' && state !== 'success' && <span className="button button-secondary">{copy.import.chooseFile}</span>}
  </label>;
}
