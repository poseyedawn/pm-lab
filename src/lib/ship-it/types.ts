export type MeterId = 'users' | 'business' | 'team' | 'tech';
export type Dir = 'left' | 'right';
export type Meters = Record<MeterId, number>;

export type IntegrityDomain =
  | 'accessibility'
  | 'customer-trust'
  | 'evidence'
  | 'legal'
  | 'privacy'
  | 'security'
  | 'truthfulness';

export type IntegrityOutcome = 'protected' | 'review-required' | 'breach';

export interface IntegrityGuidance {
  domain: IntegrityDomain;
  outcome: IntegrityOutcome;
  boundary: string;
}

export interface ChoiceGuidance {
  why: string;
  assumption: string;
  integrity?: IntegrityGuidance;
}

export interface DecisionFeedback {
  cardId: string;
  choiceLabel: string;
  effects: Partial<Record<MeterId, number>>;
  guidance: ChoiceGuidance;
}

export type Rating =
  | 'PIP'
  | 'Needs Review'
  | 'Meets Expectations'
  | 'Exceeds Expectations'
  | 'Promoted'
  | 'CEO-in-waiting';

export interface Choice {
  label: string;                              // <= 40 chars
  effects: Partial<Record<MeterId, number>>;  // -25..+25 per meter
  setFlags?: string[];
  clearFlags?: string[];
}

export interface Card {
  id: string;                                 // kebab-case, unique
  speaker: string;                            // "Maya, Eng Lead" / "The CEO"
  avatar: string;                             // legacy role token mapped to a source-controlled icon
  text: string;                               // <= 220 chars
  left: Choice;
  right: Choice;
  requires?: {
    flags?: string[];                         // all must be set
    notFlags?: string[];                      // none may be set
    week?: { min?: number; max?: number };
    meter?: Partial<Record<MeterId, { min?: number; max?: number }>>;
  };
  weight?: number;                            // draw weight, default 1
  arc?: string;                               // arc name (authoring + tests + week-12 extension)
  overshoot?: MeterId;                        // meter X's overshoot card
}

export interface RunState {
  seed: number;
  product: string;                            // flavor, picked from PRODUCTS by seed
  week: number;                               // 1-based; week of the current card
  meters: Meters;
  flags: string[];
  drawn: string[];                            // card ids drawn this run (incl. current)
  history: { cardId: string; dir: Dir }[];
  currentCardId: string | null;
  status: 'active' | 'dead' | 'complete';
  deadMeter: MeterId | null;
  overshootsTriggered: MeterId[];             // each overshoot card drawn logs its meter
  exhausted: boolean;                         // true only if deck truly ran dry (tested unreachable)
}

export interface SavedShipRun {
  run: RunState;
  failureSeen: boolean;
}

export const METERS: MeterId[] = ['users', 'business', 'team', 'tech'];

export const METER_INFO: Record<MeterId, { label: string; bar: string; deep: string }> = {
  users:    { label: 'Customer', bar: 'bg-sky',   deep: 'bg-sky-deep' },
  business: { label: 'Business', bar: 'bg-gold',  deep: 'bg-gold' },
  team:     { label: 'Team',     bar: 'bg-lose',  deep: 'bg-lose-deep' },
  tech:     { label: 'Tech',     bar: 'bg-brand', deep: 'bg-brand-deep' },
};
