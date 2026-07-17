import type { Metadata } from 'next';
import { Anton, Nunito } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const nunito = Nunito({ subsets: ['latin'], weight: ['400', '800'] });
const anton = Anton({ subsets: ['latin'], weight: ['400'], variable: '--font-exception-display' });

export const metadata: Metadata = {
  title: "Alvin's Lab",
  description: 'Small games about product craft, built with AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito.className} ${anton.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
