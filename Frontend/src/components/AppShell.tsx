'use client';

import Link from 'next/link';
import { Bell, BookOpen, BarChart3, CircleHelp, FileUp, LayoutDashboard, Menu, Settings, Sparkles, PanelLeftClose, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { copy } from '@/data/mockData';
import { useApp } from '@/lib/app-context';

export interface AppShellProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

const navItems = [
  { href: '/', label: copy.nav.overview, icon: LayoutDashboard },
  { href: '/', label: copy.nav.vocabulary, icon: BookOpen },
  { href: '/import', label: copy.dashboard.import, icon: FileUp },
  { href: '/', label: copy.nav.practice, icon: Sparkles },
  { href: '/', label: copy.nav.statistics, icon: BarChart3 },
  { href: '/', label: copy.nav.settings, icon: Settings }
];

export function AppShell({ children, hideSidebar = false }: Readonly<AppShellProps>) {
  const pathname = usePathname();
  const { user, logout } = useApp();
  if (hideSidebar) return <>{children}</>;
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Điều hướng chính">
        <Link className="brand" href="/" aria-label={copy.brand}>
          <span className="brand-mark"><BookOpen size={14} /></span>
          <span className="brand-copy"><span className="brand-name">{copy.brand}</span><span className="brand-tagline">Học từ vựng mỗi ngày</span></span>
        </Link>
        <nav><ul className="nav-list">
          {navItems.map(({ href, label, icon: Icon }) => <li key={label}><Link className={`nav-link ${pathname === href || (href === '/import' && pathname.startsWith('/import')) ? 'active' : ''}`} href={href}><Icon size={14} /><span>{label}</span></Link></li>)}
        </ul></nav>
        <div className="sidebar-footer">
          <span className="sidebar-utility"><CircleHelp size={13} />{copy.nav.help}</span>
          <span className="sidebar-utility"><PanelLeftClose size={13} />{copy.nav.collapse}</span>
        </div>
      </aside>
      <div className="main-column">
        <header className="top-header">
          <button className="icon-button mobile-menu" type="button" aria-label="Mở menu"><Menu size={18} /></button>
          <div className="header-greeting"><strong>{copy.dashboard.greeting}</strong><span>{copy.dashboard.greetingHint}</span></div>
          <div className="header-actions">
            <div className="search-wrap"><Search size={13} /><input className="search-input" aria-label="Tìm kiếm từ vựng" placeholder="Tìm kiếm từ vựng..." /></div>
            <Bell size={15} aria-label="Thông báo" />
            <button className="avatar" aria-label="Đăng xuất" title={user?.email ?? 'Tài khoản'} type="button" onClick={() => void logout()}>{user?.email?.slice(0, 2).toUpperCase() ?? 'VH'}</button>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
