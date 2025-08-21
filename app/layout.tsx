import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Tarot App',
  description: 'Structured Tarot reflection (MVP)',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'Tarot App',
    description: 'Draw cards, get deterministic action plans, export, review, and weekly reports.',
    url: '/',
    siteName: 'Tarot App',
    images: [
      { url: '/icon.svg', width: 256, height: 256, alt: 'Tarot App' }
    ],
    locale: 'zh_CN',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'Tarot App',
    description: 'Deterministic Tarot reading with action plans and reviews.',
    images: ['/icon.svg']
  }
};

export const viewport: Viewport = {
  themeColor: '#111111'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-cn">
      <body>{children}</body>
    </html>
  );
}
