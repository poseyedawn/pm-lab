import { GameShell } from '@/components/game/GameShell';

export default function ShipItLayout({ children }: { children: React.ReactNode }) {
  return <GameShell gameId="ship-it">{children}</GameShell>;
}
