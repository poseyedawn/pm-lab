import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const nunito = Nunito({ subsets: ['latin'], weight: ['400', '800'] });

export const metadata: Metadata = {
  title: "Alvin's Lab",
  description: 'Small games about product craft, built with AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={nunito.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
