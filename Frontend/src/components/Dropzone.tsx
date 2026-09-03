'use client';

import { CloudUpload, FileCheck2, FileWarning } from 'lucide-react';
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
  return <label className={`dropzone ${dragging ? 'dragging' : state}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) onFile(file); }}>
    <input className="file-input" type="file" accept=".csv,.xls,.xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file); }} />
    <span className="drop-icon">{state === 'success' ? <FileCheck2 size={22} /> : state === 'error' ? <FileWarning size={22} /> : <CloudUpload size={22} />}</span>
    <h2>{state === 'success' ? fileName : state === 'error' ? errorMessage : copy.import.dropTitle}</h2>
    <p>{state === 'success' ? 'File đã sẵn sàng để kiểm tra dữ liệu.' : copy.import.mobileDropHint}</p>
    {state !== 'parsing' && state !== 'success' && <span className="button button-secondary">{copy.import.chooseFile}</span>}
  </label>;
}
