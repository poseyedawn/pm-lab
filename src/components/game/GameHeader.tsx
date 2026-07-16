import Link from 'next/link';
import { GameSettings } from '@/components/game/GameSettings';
import { LabProfileSummary } from '@/components/lab/LabProfileSummary';
import type { GameId, GameTheme } from '@/types/lab';

interface GameHeaderProps {
  gameId: GameId;
  theme: GameTheme;
}

const GAME_NAMES = { significant: 'Significant', 'ship-it': 'Ship It' } satisfies Record<GameId, string>;
const ACCENT_STYLES = {
  violet: 'border-brand/20 text-brand-deep',
  orange: 'border-gold/30 text-gold-text',
} satisfies Record<GameTheme['accent'], string>;

export function GameHeader({ gameId, theme }: GameHeaderProps) {
  return (
    <header className={`border-b bg-surface ${ACCENT_STYLES[theme.accent]}`}>
      <div className="mx-auto flex max-w-md items-center justify-between gap-4 px-6 py-3">
        <div className="min-w-0">
          <Link href="/" className="text-xs font-extrabold uppercase tracking-wide text-ink-soft underline decoration-2 underline-offset-4">
            Lab
          </Link>
          <p className="truncate font-extrabold">{GAME_NAMES[gameId]}</p>
        </div>
        <div className="flex items-center gap-3">
          <LabProfileSummary variant="compact" gameId={gameId} />
          <GameSettings />
        </div>
      </div>
    </header>
  );
}
