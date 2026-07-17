import { GameHeader } from '@/components/game/GameHeader';
import { gameTheme } from '@/lib/gameThemes';
import type { GameId } from '@/types/lab';

interface GameShellProps {
  gameId: GameId;
  children: React.ReactNode;
}

export function GameShell({ gameId, children }: GameShellProps) {
  return (
    <section data-game={gameId} className={gameId === 'significant' ? 'significant-world' : undefined}>
      <GameHeader gameId={gameId} theme={gameTheme(gameId)} />
      {children}
    </section>
  );
}
