import type { Metadata } from 'next';
import { Bungee, Caveat, Nunito } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { LabShell } from '@/components/lab/LabShell';
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
  title: "Alvin's Product Lab",
  description: 'Mobile-first games that make product judgment visible.',
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
