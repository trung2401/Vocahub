import type { Metadata } from 'next';
import { AppProvider } from '@/lib/app-context';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'VocalHub — Học từ vựng',
  description: 'Học và luyện từ vựng tiếng Anh từ danh sách của bạn.'
};

export interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="vi">
      <body><AppProvider>{children}</AppProvider></body>
    </html>
  );
}
