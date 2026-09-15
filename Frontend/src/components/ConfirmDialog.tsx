import { AlertTriangle, LoaderCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { copy } from '@/data/mockData';

export interface ConfirmDialogProps {
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({ title = copy.deck.deleteConfirmTitle, description = copy.deck.deleteConfirmDescription, onCancel, onConfirm }: Readonly<ConfirmDialogProps>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onCancel(); }; document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [busy, onCancel]);
  const confirm = async () => { setBusy(true); setError(''); try { await onConfirm(); } catch (caught) { setError(caught instanceof Error ? caught.message : copy.errors.storage); } finally { setBusy(false); } };
  return <div className="modal-backdrop dialog-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><div className="dialog-icon danger"><AlertTriangle size={21} /></div><h2 id="confirm-title">{title}</h2><p id="confirm-description">{description}</p>{error && <p className="dialog-error" role="alert">{error}</p>}<div className="confirm-actions"><button className="button button-secondary" type="button" onClick={onCancel} disabled={busy}>{copy.import.cancel}</button><button className="button button-danger" type="button" onClick={() => void confirm()} disabled={busy}>{busy ? <><LoaderCircle size={13} className="spin" />Đang xóa...</> : <><X size={13} />{copy.deck.delete}</>}</button></div></section></div>;
}
