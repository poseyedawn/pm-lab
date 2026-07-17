export type GameId = 'significant' | 'ship-it' | 'exception-room';

export type LabChromeMode = 'standard' | 'immersive';

export interface GameTheme {
  accent: 'violet' | 'orange' | 'teal';
  iconKey: GameId;
}

export interface GameCatalogEntry {
  gameId: GameId;
  fieldTest: string;
  name: string;
  tagline: string;
  href: `/${string}`;
  art: string | null;
  theme: GameTheme;
  chrome: LabChromeMode;
}

export interface LabGameProgress {
  gameId: GameId;
  xp: number;
  completedMilestones: string[];
  lastPlayedAt: string | null;
}

export interface LabProfile {
  version: 2;
  games: Partial<Record<GameId, LabGameProgress>>;
}
