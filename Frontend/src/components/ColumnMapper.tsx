import { ArrowRight, Check, CircleAlert } from 'lucide-react';
import { copy } from '@/data/mockData';

export interface ColumnMapperProps {
  headers: string[];
  mapping: Record<string, string>;
  onChange: (field: string, header: string) => void;
}

const fields = [
  { key: 'term', label: copy.deck.term, required: true },
  { key: 'meaning', label: copy.deck.meaning, required: true },
  { key: 'pronunciation', label: copy.deck.pronunciation, required: false },
  { key: 'example', label: copy.deck.example, required: false },
  { key: 'partOfSpeech', label: copy.deck.partOfSpeech, required: false }
] as const;

export function ColumnMapper({ headers, mapping, onChange }: Readonly<ColumnMapperProps>) {
  return <section><h2 className="section-heading"><span>{copy.import.mappingTitle}</span></h2><p className="eyebrow">{copy.import.mappingHint}</p><div className="mapping-grid">
    {fields.map((field) => { const selected = Boolean(mapping[field.key]); const invalid = field.required && !selected; return <div className={`mapping-field ${selected ? 'mapped' : ''} ${invalid ? 'mapping-invalid' : ''}`} key={field.key}><div className="mapping-label"><label htmlFor={`map-${field.key}`}>{field.label} {field.required && <strong>*</strong>}</label><span>{field.required ? 'Bắt buộc' : 'Tùy chọn'}</span></div><div className="mapping-control"><ArrowRight size={13} aria-hidden="true" /><select id={`map-${field.key}`} value={mapping[field.key] ?? ''} onChange={(event) => onChange(field.key, event.target.value)} aria-required={field.required} aria-invalid={invalid}><option value="">{copy.import.chooseColumn}</option>{headers.map((header) => <option key={header} value={header}>{header}</option>)}</select>{selected ? <Check className="mapping-status" size={15} aria-label="Đã ghép cột" /> : invalid ? <CircleAlert className="mapping-status" size={15} aria-label="Thiếu cột bắt buộc" /> : null}</div></div>; })}
  </div></section>;
}
