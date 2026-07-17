import type { Metadata } from 'next';
import { GameShell } from '@/components/game/GameShell';
import './exception-room.css';

export const metadata: Metadata = {
  title: "Exception Room | Alvin's Product Lab",
  description: 'A mobile operations simulation about judgment under finite review capacity.',
};

export default function ExceptionRoomLayout({ children }: { children: React.ReactNode }) {
  return <GameShell gameId="exception-room">{children}</GameShell>;
}
