'use client';

import Link from 'next/link';
import { Eye, EyeOff, LockKeyhole, Sparkles } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useApp } from '@/lib/app-context';

export default function RegisterPage() {
  const { register } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { await register(email, password); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể tạo tài khoản.'); } finally { setBusy(false); } };
  return <main className="auth-page"><div className="auth-layout"><aside className="auth-aside"><div className="brand auth-brand"><span className="brand-mark"><Sparkles size={14} /></span><span className="brand-copy"><span className="brand-name">VocaHub</span><span className="brand-tagline">Học từ vựng mỗi ngày</span></span></div><div className="auth-aside-copy"><p className="eyebrow">Bắt đầu nhẹ nhàng</p><h2>Xây một thư viện từ vựng theo cách của bạn.</h2><p>Import danh sách, học bằng flashcard và quay lại đúng lúc bạn cần ôn.</p></div><div className="auth-aside-note"><LockKeyhole size={16} /><span>Dữ liệu học tập của bạn được lưu riêng theo tài khoản.</span></div></aside><section className="auth-panel"><div className="auth-mobile-brand"><div className="brand auth-brand"><span className="brand-mark"><Sparkles size={14} /></span><span className="brand-name">VocaHub</span></div></div><p className="eyebrow">Tạo không gian học của bạn</p><h1>Tạo tài khoản</h1><p className="auth-subtitle">Bắt đầu xây dựng thói quen học mỗi ngày.</p><form className="auth-form" onSubmit={submit}><div className="field"><label htmlFor="register-email">Email</label><input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div><div className="field"><label htmlFor="register-password">Mật khẩu</label><div className="auth-input-wrap"><input id="register-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required /><button className="input-action" type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div><span className="field-hint">Tối thiểu 8 ký tự.</span></div>{error && <p className="auth-error" role="alert">{error}</p>}<button className="button button-primary button-block" disabled={busy}>{busy ? 'Đang tạo tài khoản...' : 'Đăng ký'}</button></form><p className="auth-switch">Đã có tài khoản? <Link href="/login">Đăng nhập</Link></p></section></div></main>;
}
