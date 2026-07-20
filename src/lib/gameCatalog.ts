import type { GameCatalogEntry, GameId } from '@/types/lab';

export const GAME_CATALOG = {
  significant: {
    gameId: 'significant',
    fieldTest: '01',
    name: 'Significant',
    tagline: 'Read experiment evidence. Spot the statistical trap.',
    duration: '30 sec',
    modeLabel: 'Solo case',
    href: '/significant',
    art: '/lab/significant-depth-card.webp',
    theme: { accent: 'violet', iconKey: 'significant' },
    chrome: 'immersive',
  },
  'ship-it': {
    gameId: 'ship-it',
    fieldTest: '02',
    name: 'Ship It',
    tagline: 'Balance a quarter without crossing integrity lines.',
    duration: '3 min',
    modeLabel: '12 decisions',
    href: '/ship-it',
    art: '/lab/ship-it-depth-card.webp',
    theme: { accent: 'orange', iconKey: 'ship-it' },
    chrome: 'standard',
  },
  'exception-room': {
    gameId: 'exception-room',
    fieldTest: '03',
    name: 'Exception Room',
    tagline: 'Review AI exceptions before capacity runs out.',
    duration: '8 min',
    modeLabel: '12 cases',
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
