import type { Metadata } from 'next';
import { GameShell } from '@/components/game/GameShell';
import './significant.css';

export const metadata: Metadata = {
  title: 'Significant',
  description: 'Read simulated experiment evidence, spot statistical traps, and make a defensible product call.',
  alternates: { canonical: '/significant' },
  openGraph: {
    type: 'website',
    url: '/significant',
    title: "Significant | Alvin's Product Lab",
    description: 'A mobile field test for experiment judgment using synthetic data.',
    images: [{
      url: '/lab/significant-depth-card.webp',
      width: 1400,
      height: 663,
      alt: 'Significant experiment field test artwork',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Significant | Alvin's Product Lab",
    description: 'A mobile field test for experiment judgment using synthetic data.',
    images: ['/lab/significant-depth-card.webp'],
  },
};

export default function SignificantLayout({ children }: { children: React.ReactNode }) {
  return <GameShell gameId="significant">{children}</GameShell>;
}
