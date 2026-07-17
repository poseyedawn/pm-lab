import { hashString, mulberry32, type RNG } from '@/lib/prng';
import { METERS, type Card, type Dir, type Meters, type MeterId, type RunState } from '@/lib/ship-it/types';

const START = 50;
const QUARTER_END = 12;   // surviving to week 12 completes the quarter…
const HARD_STOP = 18;     // …unless pending arc cards extend it, to 18 max
// When any overshoot card is eligible, the draw uses overshoot cards only 90% of
// the time — "strongly weights that meter's overshoot card" without making the
// backlash a certainty.
const OVERSHOOT_POOL_BIAS = 0.9;

/** Deterministic per-step RNG so RunState needs no RNG state inside it. */
const stepRng = (seed: number, step: number): RNG => mulberry32(hashString(`shipit:${seed}:${step}`));

const clamp = (n: number): number => Math.max(0, Math.min(100, n));

export { METERS } from '@/lib/ship-it/types';

export function isEligible(card: Card, state: RunState): boolean {
  if (state.drawn.includes(card.id)) return false;
  const r = card.requires;
  if (r?.flags && !r.flags.every((f) => state.flags.includes(f))) return false;
  if (r?.notFlags && r.notFlags.some((f) => state.flags.includes(f))) return false;
  if (r?.week?.min !== undefined && state.week < r.week.min) return false;
  if (r?.week?.max !== undefined && state.week > r.week.max) return false;
  if (r?.meter) {
    for (const [id, range] of Object.entries(r.meter)) {
      const v = state.meters[id as MeterId];
      if (range.min !== undefined && v < range.min) return false;
      if (range.max !== undefined && v > range.max) return false;
    }
  }
  return true;
}

const isCore = (c: Card): boolean => !c.arc && !c.overshoot;

function weightedPick(rng: RNG, pool: Card[]): Card {
  const weights = pool.map((c) => c.weight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/** Returns the drawn card, or null when even the fallback pool is empty. */
function drawCard(state: RunState, deck: Card[], rng: RNG): { card: Card | null; fellBack: boolean } {
  let pool = deck.filter((c) => isEligible(c, state));
  // Past the quarter, only pending arc cards keep the run alive.
  if (state.week > QUARTER_END) pool = pool.filter((c) => c.arc !== undefined && !c.overshoot);
  if (pool.length > 0) {
    const overshootPool = pool.filter((c) => c.overshoot);
    if (overshootPool.length > 0 && rng() < OVERSHOOT_POOL_BIAS) pool = overshootPool;
    return { card: weightedPick(rng, pool), fellBack: false };
  }
  if (state.week > QUARTER_END) return { card: null, fellBack: false }; // quarter over, nothing pending
  // Exhaustion fallback: any not-yet-drawn core card, ignoring week rules.
  const fallback = deck.filter((c) => isCore(c) && isEligible(c, { ...state, week: c.requires?.week?.min ?? 1 }));
  if (fallback.length === 0) return { card: null, fellBack: true };
  return { card: weightedPick(rng, fallback), fellBack: false };
}

export function startRun(seed: number, deck: Card[], products: readonly string[] = ['a scrappy startup']): RunState {
  const rng = stepRng(seed, 0);
  const product = products[Math.floor(rng() * products.length)];
  const base: RunState = {
    seed,
    product,
    week: 1,
    meters: { users: START, business: START, team: START, tech: START },
    flags: [],
    drawn: [],
    history: [],
    currentCardId: null,
    status: 'active',
    deadMeter: null,
    overshootsTriggered: [],
    exhausted: false,
  };
  const { card } = drawCard(base, deck, rng);
  if (!card) return { ...base, status: 'complete', exhausted: true };
  return {
    ...base,
    currentCardId: card.id,
    drawn: [card.id],
    overshootsTriggered: card.overshoot ? [card.overshoot] : [],
  };
}

export function choose(state: RunState, dir: Dir, deck: Card[]): RunState {
  if (state.status !== 'active' || !state.currentCardId) return state;
  const card = deck.find((c) => c.id === state.currentCardId);
  if (!card) return state;
  const pick = dir === 'left' ? card.left : card.right;

  const meters: Meters = { ...state.meters };
  for (const [id, delta] of Object.entries(pick.effects)) {
    meters[id as MeterId] = clamp(meters[id as MeterId] + delta);
  }
  let flags = state.flags.filter((f) => !pick.clearFlags?.includes(f));
  for (const f of pick.setFlags ?? []) if (!flags.includes(f)) flags = [...flags, f];

  const next: RunState = {
    ...state,
    meters,
    flags,
    history: [...state.history, { cardId: card.id, dir }],
  };

  const dead = METERS.find((m) => meters[m] <= 0) ?? null;
  if (dead) return { ...next, status: 'dead', deadMeter: dead, currentCardId: null };

  const week = state.week + 1;
  if (week > HARD_STOP) return { ...next, status: 'complete', currentCardId: null };

  const advanced = { ...next, week, currentCardId: null };
  const { card: drawn, fellBack } = drawCard(advanced, deck, stepRng(state.seed, week));
  if (!drawn) {
    // Run over: week stays at the last card actually played.
    return { ...next, status: 'complete', currentCardId: null, exhausted: fellBack || state.exhausted };
  }
  return {
    ...advanced,
    currentCardId: drawn.id,
    drawn: [...state.drawn, drawn.id],
    overshootsTriggered: drawn.overshoot
      ? [...state.overshootsTriggered, drawn.overshoot]
      : state.overshootsTriggered,
  };
}
