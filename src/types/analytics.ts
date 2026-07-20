import type { GameId } from '@/types/lab';

export type { GameId };
export type GameMode = 'calibration' | 'campaign' | 'daily';
export type ShipItMode = 'free' | 'daily';
export type ShipItRating =
  | 'PIP'
  | 'Needs Review'
  | 'Meets Expectations'
  | 'Exceeds Expectations'
  | 'Promoted'
  | 'CEO-in-waiting';
export type ExceptionMode = 'campaign' | 'daily' | 'practice';
export type ExceptionActionName = 'approve' | 'correct' | 'escalate';
export type ExperimentCall = 'ship' | 'kill' | 'keep';
export type ExperimentArchetype =
  | 'clean-win'
  | 'clean-loss'
  | 'winners-curse'
  | 'peeking'
  | 'novelty'
  | 'underpowered'
  | 'multiple-comparisons'
  | 'seasonality'
  | 'srm'
  | 'simpson';

export interface AnalyticsEventMap {
  lab_viewed: {
    referrerClass: 'direct' | 'internal' | 'portfolio' | 'external';
    viewportClass: 'mobile' | 'tablet' | 'desktop';
  };
  game_selected: { gameId: GameId; placement: 'lab_primary' | 'lab_more' };
  game_intro_viewed: { gameId: GameId; visitor: 'first' | 'returning' };
  calibration_started: { gameId: GameId };
  decision_made:
    | { gameId: GameId; mode: 'calibration'; level: 'calibration'; call: ExperimentCall }
    | { gameId: GameId; mode: 'campaign'; level: number; call: ExperimentCall }
    | { gameId: GameId; mode: 'daily'; level: 'daily'; call: ExperimentCall };
  reveal_viewed: { gameId: GameId; mode: GameMode; correct: boolean; archetype: ExperimentArchetype };
  round_continued: { gameId: GameId; mode: GameMode; nextAction: 'campaign_path' | 'daily_result' };
  campaign_level_completed: { level: number; attempts: number; stars: 0 | 1 | 3 };
  campaign_completed: { firstTryBand: '0-3' | '4-6' | '7-9' | '10' };
  daily_viewed: { state: 'unplayed' | 'completed' };
  daily_completed: { correct: boolean; streakBand: '1-2' | '3-6' | '7-29' | '30+' };
  daily_streak_extended: { streakBand: '1-2' | '3-6' | '7-29' | '30+' };
  share_attempted: { surface: 'daily' | 'profile'; method: 'clipboard' };
  share_succeeded: { surface: 'daily' | 'profile'; method: 'clipboard' };
  share_failed: {
    surface: 'daily' | 'profile';
    method: 'clipboard';
    reason: 'unavailable' | 'permission' | 'unknown';
  };
  case_study_viewed: { entrySurface: 'significant' | 'direct' | 'portfolio' | 'external' };
  portfolio_returned: { entrySurface: 'lab' | 'significant' | 'case_study' };
  settings_changed:
    | { setting: 'sound' | 'haptics'; enabled: boolean }
    | { setting: 'motion'; value: 'system' | 'reduced' | 'full' };
  shipit_run_started: { mode: ShipItMode };
  shipit_card_choice: { cardId: string; dir: 'left' | 'right' };
  shipit_run_completed: { mode: ShipItMode; rating: ShipItRating; weeks: number; died: boolean };
  shipit_daily_completed: { rating: ShipItRating; streakBand: '1-2' | '3-6' | '7-29' | '30+' };
  shipit_streak_extended: { streakBand: '1-2' | '3-6' | '7-29' | '30+' };
  exception_run_started: { mode: ExceptionMode; seed: number };
  exception_case_opened: { mode: ExceptionMode; shift: number; caseId: string };
  exception_evidence_viewed: { mode: ExceptionMode; caseId: string; evidenceId: string };
  exception_decision_submitted: { mode: ExceptionMode; caseId: string; action: ExceptionActionName };
  exception_shift_ended: { mode: ExceptionMode; shift: number; remaining: number };
  exception_run_completed: {
    mode: ExceptionMode;
    profile: string;
    safety: number;
    service: number;
    capacity: number;
  };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
export type AnalyticsEventProperties<Name extends AnalyticsEventName> = AnalyticsEventMap[Name];
