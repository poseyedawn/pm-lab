import { GameHeader } from '@/components/game/GameHeader';
import { gameDefinition } from '@/lib/gameCatalog';
import type { GameId } from '@/types/lab';

interface GameShellProps {
  gameId: GameId;
  children: React.ReactNode;
}

export function GameShell({ gameId, children }: GameShellProps) {
  const game = gameDefinition(gameId);
  const className = gameId === 'significant'
    ? 'game-shell significant-world'
    : 'game-shell';

  return (
    <section
      data-game={gameId}
      data-lab-chrome={game.chrome}
      className={className}
    >
      <GameHeader gameId={gameId} />
      {children}
    </section>
  );
}
