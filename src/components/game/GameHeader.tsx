'use client';

import Link from 'next/link';
import { House } from '@phosphor-icons/react';
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
    <header className={`game-header border-b ${ACCENT_STYLES[theme.accent]}`}>
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="game-header-home" aria-label="Back to Product Lab">
            <House size={20} weight="fill" aria-hidden />
          </Link>
          <div className="min-w-0">
            <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.16em] text-coral">Field test</p>
            <p className="font-display truncate text-sm uppercase text-ink">{GAME_NAMES[gameId]}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LabProfileSummary variant="compact" gameId={gameId} />
          <GameSettings gameId={gameId} />
        </div>
      </div>
    </header>
  );
}
