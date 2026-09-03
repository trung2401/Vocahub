'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useApp } from '@/lib/app-context';

export default function RegisterPage() {
  const { register } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { await register(email, password); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể tạo tài khoản.'); } finally { setBusy(false); } };
  return <main className="auth-page"><section className="auth-panel"><div className="brand auth-brand"><span className="brand-mark">V</span><span className="brand-name">VocaHub</span></div><h1>Tạo tài khoản</h1><p className="auth-subtitle">Bắt đầu xây dựng thói quen học mỗi ngày.</p><form className="auth-form" onSubmit={submit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Mật khẩu<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="button button-primary button-block" disabled={busy}>{busy ? 'Đang tạo tài khoản...' : 'Đăng ký'}</button></form><p className="auth-switch">Đã có tài khoản? <Link href="/login">Đăng nhập</Link></p></section></main>;
}
