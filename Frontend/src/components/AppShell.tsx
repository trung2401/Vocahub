'use client';

import Link from 'next/link';
import { Bell, BookOpen, CircleHelp, LogOut, Menu, PanelLeftClose } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { copy } from '@/data/mockData';
import { useApp } from '@/lib/app-context';
import { navItems } from './navigation';

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface AppShellProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

export function AppShell({ children, hideSidebar = false }: Readonly<AppShellProps>) {
  const pathname = usePathname();
  const { user, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const wasMenuOpen = useRef(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen && !accountOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && accountOpen && !menuOpen) setAccountOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [accountOpen, menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      if (wasMenuOpen.current) menuButtonRef.current?.focus();
      wasMenuOpen.current = false;
      return;
    }

    wasMenuOpen.current = true;
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    const getFocusableElements = () => Array.from(sidebar.querySelectorAll<HTMLElement>(focusableSelector));
    const focusableElements = getFocusableElements();
    const firstNavigationLink = sidebar.querySelector<HTMLElement>('nav a[href]');
    (firstNavigationLink ?? focusableElements[0])?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const elements = getFocusableElements();
      if (!elements.length) {
        event.preventDefault();
        sidebar.focus();
        return;
      }
      const activeElement = document.activeElement as HTMLElement | null;
      const activeIndex = activeElement ? elements.indexOf(activeElement) : -1;
      if (activeIndex === -1) {
        event.preventDefault();
        elements[0].focus();
      } else if (event.shiftKey && activeIndex === 0) {
        event.preventDefault();
        elements[elements.length - 1].focus();
      } else if (!event.shiftKey && activeIndex === elements.length - 1) {
        event.preventDefault();
        elements[0].focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  if (hideSidebar) return <>{children}</>;
  return (
    <div className="app-shell">
      <aside ref={sidebarRef} id="primary-navigation" className={`sidebar ${menuOpen ? 'mobile-open' : ''}`} aria-label="Điều hướng chính" tabIndex={-1}>
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
      <button className={`mobile-menu-overlay ${menuOpen ? 'visible' : ''}`} type="button" aria-label="Đóng menu" onClick={closeMenu} tabIndex={-1} />
      <div className="main-column" aria-hidden={menuOpen}>
        <header className="top-header">
          <button ref={menuButtonRef} className="icon-button mobile-menu" type="button" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}><Menu size={18} /></button>
          <div className="header-greeting"><strong>{copy.dashboard.greeting}</strong><span>{copy.dashboard.greetingHint}</span></div>
          <div className="header-actions">
            <span className="header-status" title="Trạng thái học tập"><Bell size={15} aria-hidden="true" /></span>
            <div className="account-control">
              <button className="account-trigger" aria-label="Mở tài khoản" aria-expanded={accountOpen} aria-haspopup="menu" type="button" onClick={() => setAccountOpen((open) => !open)}>
                <span className="avatar" aria-hidden="true">{user?.email?.slice(0, 2).toUpperCase() ?? 'VH'}</span>
                <span className="account-copy"><strong>Tài khoản</strong><small>{user?.email ?? 'VocaHub'}</small></span>
              </button>
              {accountOpen && <div className="account-menu" role="menu">
                <span className="account-menu-email">{user?.email ?? 'Tài khoản VocaHub'}</span>
                <button type="button" role="menuitem" onClick={() => { setAccountOpen(false); void logout(); }}><LogOut size={14} /> Đăng xuất</button>
              </div>}
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
