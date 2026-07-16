'use client';

import { usePathname } from 'next/navigation';
import { GameHeader } from '@/components/game/GameHeader';
import { gameTheme } from '@/lib/gameThemes';
import type { GameId } from '@/types/lab';

interface GameShellProps {
  gameId: GameId;
  children: React.ReactNode;
}

export function GameShell({ gameId, children }: GameShellProps) {
  const pathname = usePathname();
  const isCalibration = gameId === 'significant' && pathname === '/significant/calibration';

  return (
    <section data-game={gameId}>
      {!isCalibration && <GameHeader gameId={gameId} theme={gameTheme(gameId)} />}
      {children}
    </section>
  );
}
