import { CircleAlert } from 'lucide-react';

export interface InlineErrorProps { message: string; }

export function InlineError({ message }: Readonly<InlineErrorProps>) { return <p className="field-error" role="alert"><CircleAlert size={12} /> {message}</p>; }
