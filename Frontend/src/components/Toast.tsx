import { CheckCircle2 } from 'lucide-react';

export interface ToastProps { message: string; }

export function Toast({ message }: Readonly<ToastProps>) { return <div className="toast" role="status"><CheckCircle2 size={15} />{message}</div>; }
