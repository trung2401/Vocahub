import { FileUp, LayoutDashboard } from 'lucide-react';
import { copy } from '../data/mockData';

export const navItems = [
  { href: '/', label: copy.nav.overview, icon: LayoutDashboard },
  { href: '/import', label: copy.dashboard.import, icon: FileUp }
] as const;
