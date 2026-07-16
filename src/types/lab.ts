export type GameId = 'significant' | 'ship-it';

export interface GameTheme {
  accent: 'violet' | 'orange';
  iconKey: GameId;
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
