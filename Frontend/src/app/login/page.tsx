'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useApp } from '@/lib/app-context';

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { await login(email, password); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Email hoặc mật khẩu không đúng.'); } finally { setBusy(false); } };
  return <main className="auth-page"><section className="auth-panel"><div className="brand auth-brand"><span className="brand-mark">V</span><span className="brand-name">VocaHub</span></div><h1>Đăng nhập</h1><p className="auth-subtitle">Tiếp tục phiên học từ vựng của bạn.</p><form className="auth-form" onSubmit={submit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Mật khẩu<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="button button-primary button-block" disabled={busy}>{busy ? 'Đang đăng nhập...' : 'Đăng nhập'}</button></form><p className="auth-switch">Chưa có tài khoản? <Link href="/register">Đăng ký</Link></p></section></main>;
}
