import type { GameId, GameTheme } from '@/types/lab';

export const GAME_THEMES = {
  significant: { accent: 'violet', iconKey: 'significant' },
  'ship-it': { accent: 'orange', iconKey: 'ship-it' },
} satisfies Record<GameId, GameTheme>;

export function gameTheme(gameId: GameId): GameTheme {
  return GAME_THEMES[gameId];
}
