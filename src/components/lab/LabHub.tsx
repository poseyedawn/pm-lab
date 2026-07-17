'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';
import { useLabProfile } from '@/hooks/lab/useLabProfile';
import { track } from '@/services/analyticsService';
import type { GameId } from '@/types/lab';

interface HubGame {
  gameId: GameId;
  fieldTest: string;
  name: string;
  tagline: string;
  href: string;
  art: string | null;
}

const GAMES: HubGame[] = [
  {
    gameId: 'significant',
    fieldTest: '01',
    name: 'Significant',
    tagline: 'Trust your product instinct.',
    href: '/significant',
    art: '/significant/entry-world.webp',
  },
  {
    gameId: 'ship-it',
    fieldTest: '02',
    name: 'Ship It',
    tagline: 'Survive the quarter. Everyone wants something.',
    href: '/ship-it',
    art: null,
  },
  {
    gameId: 'exception-room',
    fieldTest: '03',
    name: 'Exception Room',
    tagline: 'The model made a call. You own what happens next.',
    href: '/exception-room',
    art: '/exception-room/selected-direction.webp',
  },
];

export function LabHub() {
  const { ready, profile } = useLabProfile();

  return (
    <div className="flex flex-col gap-4 px-5 pb-6 pt-4">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral-deep">Product Lab</p>
        <h1 className="font-display mt-1 text-2xl uppercase text-ink">Pick a field test</h1>
        <p className="mt-1 text-sm text-ink-soft">Small games that make product judgment visible.</p>
      </header>

      <nav className="flex flex-col gap-4" aria-label="Games">
        {GAMES.map((game) => {
          const xp = profile.games[game.gameId]?.xp ?? 0;
          return (
            <Link
              key={game.gameId}
              href={game.href}
              data-game-tile={game.gameId}
              className="lab-hub-tile"
              onClick={() => track('game_selected', { gameId: game.gameId, placement: 'lab_primary' })}
            >
              {game.art && (
                <Image src={game.art} alt="" fill sizes="350px" className="lab-hub-tile-art" />
              )}
              <span className="lab-hub-tile-scrim" aria-hidden />
              <span className="lab-hub-tile-body">
                <span className="lab-hub-tile-eyebrow">Field test {game.fieldTest}</span>
                <span className="lab-hub-tile-name">{game.name}</span>
                <span className="lab-hub-tile-tagline">{game.tagline}</span>
              </span>
              <span className="lab-hub-tile-side">
                {ready && xp > 0 && <span className="lab-hub-tile-xp">{xp} XP</span>}
                <ArrowRight size={22} weight="bold" aria-hidden />
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
