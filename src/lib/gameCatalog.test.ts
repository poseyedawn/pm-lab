import { describe, expect, it } from 'vitest';
import { GAME_CATALOG, GAME_CATALOG_ORDER, LAB_GAMES, gameDefinition } from '@/lib/gameCatalog';

describe('game catalog', () => {
  it('defines every game once in the intended hub order', () => {
    expect(Object.keys(GAME_CATALOG)).toEqual([...GAME_CATALOG_ORDER]);
    expect(LAB_GAMES.map(({ gameId }) => gameId)).toEqual([...GAME_CATALOG_ORDER]);
  });

  it('keeps routes, theme identities, and shell policy aligned', () => {
    for (const game of LAB_GAMES) {
      expect(game.href).toBe(`/${game.gameId}`);
      expect(game.theme.iconKey).toBe(game.gameId);
      expect(game.name).not.toHaveLength(0);
      expect(game.tagline).not.toHaveLength(0);
      expect(game.art).toMatch(/^\/lab\/.+-card\.webp$/);
    }

    expect(gameDefinition('significant').chrome).toBe('immersive');
    expect(gameDefinition('ship-it').chrome).toBe('standard');
    expect(gameDefinition('exception-room').chrome).toBe('standard');
  });
});
