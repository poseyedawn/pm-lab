import { GameHeader } from '@/components/game/GameHeader';
import { gameDefinition } from '@/lib/gameCatalog';
import type { GameId } from '@/types/lab';

interface GameShellProps {
  gameId: GameId;
  children: React.ReactNode;
}

export function GameShell({ gameId, children }: GameShellProps) {
  const game = gameDefinition(gameId);

  return (
    <section
      data-game={gameId}
      data-lab-chrome={game.chrome}
      className={gameId === 'significant' ? 'significant-world' : undefined}
    >
      <GameHeader gameId={gameId} />
      {children}
    </section>
  );
}
