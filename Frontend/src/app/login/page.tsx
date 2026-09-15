'use client';

import Link from 'next/link';
import { Eye, EyeOff, LockKeyhole, Sparkles } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useApp } from '@/lib/app-context';

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { await login(email, password); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Email hoặc mật khẩu không đúng.'); } finally { setBusy(false); } };
  return <main className="auth-page"><div className="auth-layout"><aside className="auth-aside"><div className="brand auth-brand"><span className="brand-mark"><Sparkles size={14} /></span><span className="brand-copy"><span className="brand-name">VocaHub</span><span className="brand-tagline">Học từ vựng mỗi ngày</span></span></div><div className="auth-aside-copy"><p className="eyebrow">Không gian học tập cá nhân</p><h2>Mỗi phiên học là một bước tiến rõ ràng.</h2><p>Giữ lại nhịp học, những từ cần ôn và cảm giác tiến bộ trong một nơi gọn gàng.</p></div><div className="auth-aside-note"><LockKeyhole size={16} /><span>Dữ liệu học tập của bạn được lưu riêng theo tài khoản.</span></div></aside><section className="auth-panel"><div className="auth-mobile-brand"><div className="brand auth-brand"><span className="brand-mark"><Sparkles size={14} /></span><span className="brand-name">VocaHub</span></div></div><p className="eyebrow">Chào mừng trở lại</p><h1>Đăng nhập</h1><p className="auth-subtitle">Tiếp tục phiên học từ vựng của bạn.</p><form className="auth-form" onSubmit={submit}><div className="field"><label htmlFor="login-email">Email</label><input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div><div className="field"><label htmlFor="login-password">Mật khẩu</label><div className="auth-input-wrap"><input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /><button className="input-action" type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></div>{error && <p className="auth-error" role="alert">{error}</p>}<button className="button button-primary button-block" disabled={busy}>{busy ? 'Đang đăng nhập...' : 'Đăng nhập'}</button></form><p className="auth-switch">Chưa có tài khoản? <Link href="/register">Đăng ký</Link></p></section></div></main>;
}
