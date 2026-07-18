import type { GameCatalogEntry, GameId } from '@/types/lab';

export const GAME_CATALOG = {
  significant: {
    gameId: 'significant',
    fieldTest: '01',
    name: 'Significant',
    tagline: 'Trust your product instinct.',
    href: '/significant',
    art: '/lab/significant-depth-card.webp',
    theme: { accent: 'violet', iconKey: 'significant' },
    chrome: 'immersive',
  },
  'ship-it': {
    gameId: 'ship-it',
    fieldTest: '02',
    name: 'Ship It',
    tagline: 'Survive the quarter. Everyone wants something.',
    href: '/ship-it',
    art: '/lab/ship-it-depth-card.webp',
    theme: { accent: 'orange', iconKey: 'ship-it' },
    chrome: 'standard',
  },
  'exception-room': {
    gameId: 'exception-room',
    fieldTest: '03',
    name: 'Exception Room',
    tagline: 'The model made a call. You own what happens next.',
    href: '/exception-room',
    art: '/lab/exception-room-depth-card.webp',
    theme: { accent: 'teal', iconKey: 'exception-room' },
    chrome: 'standard',
  },
} satisfies Record<GameId, GameCatalogEntry>;

export const GAME_CATALOG_ORDER = [
  'significant',
  'ship-it',
  'exception-room',
] as const satisfies readonly GameId[];

export const LAB_GAMES = GAME_CATALOG_ORDER.map((gameId) => GAME_CATALOG[gameId]);

export function gameDefinition(gameId: GameId): GameCatalogEntry {
  return GAME_CATALOG[gameId];
}
