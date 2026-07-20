import type { Metadata } from 'next';
import { GameShell } from '@/components/game/GameShell';
import './exception-room.css';

export const metadata: Metadata = {
  title: 'Exception Room',
  description: 'Review synthetic AI exceptions, inspect required evidence, and manage finite operational capacity.',
  alternates: { canonical: '/exception-room' },
  openGraph: {
    type: 'website',
    url: '/exception-room',
    title: "Exception Room | Alvin's Product Lab",
    description: 'A mobile field test for accountable AI operations and evidence review.',
    images: [{
      url: '/lab/exception-room-depth-card.webp',
      width: 1400,
      height: 668,
      alt: 'Exception Room AI operations field test artwork',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Exception Room | Alvin's Product Lab",
    description: 'A mobile field test for accountable AI operations and evidence review.',
    images: ['/lab/exception-room-depth-card.webp'],
  },
};

export default function ExceptionRoomLayout({ children }: { children: React.ReactNode }) {
  return <GameShell gameId="exception-room">{children}</GameShell>;
}
