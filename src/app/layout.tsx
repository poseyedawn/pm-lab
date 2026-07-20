import type { Metadata } from 'next';
import { Bungee, Caveat, Nunito } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { LabShell } from '@/components/lab/LabShell';
import { SITE_URL } from '@/lib/site';
import './globals.css';

const nunito = Nunito({ subsets: ['latin'], weight: ['400', '800'] });
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-hand',
  weight: ['500', '600'],
});
const bungee = Bungee({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: "Alvin's Product Lab",
    template: "%s | Alvin's Product Lab",
  },
  description: 'Mobile-first games that make product judgment visible.',
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: "Alvin's Product Lab",
    url: '/',
    title: "Alvin's Product Lab",
    description: 'Three mobile field tests for experiment judgment, product tradeoffs, and AI operations.',
    images: [{
      url: '/lab/exception-room-depth-card.webp',
      width: 1400,
      height: 668,
      alt: 'Product Lab field test artwork',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Alvin's Product Lab",
    description: 'Three mobile field tests for experiment judgment, product tradeoffs, and AI operations.',
    images: ['/lab/exception-room-depth-card.webp'],
  },
};

const shouldLoadVercelAnalytics = process.env.VERCEL === '1';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito.className} ${caveat.variable} ${bungee.variable}`}>
        <LabShell>{children}</LabShell>
        {shouldLoadVercelAnalytics && <Analytics />}
      </body>
    </html>
  );
}
