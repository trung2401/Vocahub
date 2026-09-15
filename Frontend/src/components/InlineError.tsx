import { CircleAlert } from 'lucide-react';

export interface InlineErrorProps { message: string; }

export function InlineError({ message }: Readonly<InlineErrorProps>) { return <p className="field-error" role="alert" aria-live="polite"><CircleAlert size={12} aria-hidden="true" /> {message}</p>; }
