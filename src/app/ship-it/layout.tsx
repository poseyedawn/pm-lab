import type { Metadata } from 'next';
import { GameShell } from '@/components/game/GameShell';

export const metadata: Metadata = {
  title: 'Ship It',
  description: 'Balance customer, business, team, and technical pressure without crossing product integrity lines.',
  alternates: { canonical: '/ship-it' },
  openGraph: {
    type: 'website',
    url: '/ship-it',
    title: "Ship It | Alvin's Product Lab",
    description: 'A mobile field test for product tradeoffs and accountable prioritization.',
    images: [{
      url: '/lab/ship-it-depth-card.webp',
      width: 1400,
      height: 630,
      alt: 'Ship It product tradeoff field test artwork',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ship It | Alvin's Product Lab",
    description: 'A mobile field test for product tradeoffs and accountable prioritization.',
    images: ['/lab/ship-it-depth-card.webp'],
  },
};

export default function ShipItLayout({ children }: { children: React.ReactNode }) {
  return <GameShell gameId="ship-it">{children}</GameShell>;
}
