import { AlertTriangle, X } from 'lucide-react';
import { copy } from '@/data/mockData';

export interface ConfirmDialogProps {
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ title = copy.deck.deleteConfirmTitle, description = copy.deck.deleteConfirmDescription, onCancel, onConfirm }: Readonly<ConfirmDialogProps>) {
  return <div className="modal-backdrop dialog-center" role="presentation"><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><AlertTriangle size={21} color="var(--color-danger)" /><h2 id="confirm-title">{title}</h2><p>{description}</p><div className="confirm-actions"><button className="button button-secondary" type="button" onClick={onCancel}>{copy.import.cancel}</button><button className="button button-danger" type="button" onClick={onConfirm}><X size={13} />{copy.deck.delete}</button></div></section></div>;
}
