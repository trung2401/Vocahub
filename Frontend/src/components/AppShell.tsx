'use client';

import Link from 'next/link';
import { Bell, BookOpen, CircleHelp, Menu, PanelLeftClose } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { copy } from '@/data/mockData';
import { useApp } from '@/lib/app-context';
import { navItems } from './navigation';

export interface AppShellProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

export function AppShell({ children, hideSidebar = false }: Readonly<AppShellProps>) {
  const pathname = usePathname();
  const { user, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  if (hideSidebar) return <>{children}</>;
  return (
    <div className="app-shell">
      <aside id="primary-navigation" className={`sidebar ${menuOpen ? 'mobile-open' : ''}`} aria-label="Điều hướng chính">
        <Link className="brand" href="/" aria-label={copy.brand} onClick={closeMenu}>
          <span className="brand-mark"><BookOpen size={14} /></span>
          <span className="brand-copy"><span className="brand-name">{copy.brand}</span><span className="brand-tagline">Học từ vựng mỗi ngày</span></span>
        </Link>
        <nav><ul className="nav-list">
          {navItems.map(({ href, label, icon: Icon }) => <li key={label}><Link className={`nav-link ${pathname === href || (href === '/import' && pathname.startsWith('/import')) ? 'active' : ''}`} href={href} onClick={closeMenu}><Icon size={14} /><span>{label}</span></Link></li>)}
        </ul></nav>
        <div className="sidebar-footer">
          <span className="sidebar-utility"><CircleHelp size={13} />{copy.nav.help}</span>
          <span className="sidebar-utility"><PanelLeftClose size={13} />{copy.nav.collapse}</span>
        </div>
      </aside>
      <button className={`mobile-menu-overlay ${menuOpen ? 'visible' : ''}`} type="button" aria-label="Đóng menu" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1} />
      <div className="main-column">
        <header className="top-header">
          <button className="icon-button mobile-menu" type="button" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}><Menu size={18} /></button>
          <div className="header-greeting"><strong>{copy.dashboard.greeting}</strong><span>{copy.dashboard.greetingHint}</span></div>
          <div className="header-actions">
            <Bell size={15} aria-label="Thông báo" />
            <button className="avatar" aria-label="Đăng xuất" title={user?.email ?? 'Tài khoản'} type="button" onClick={() => void logout()}>{user?.email?.slice(0, 2).toUpperCase() ?? 'VH'}</button>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
