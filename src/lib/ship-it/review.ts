import { hashString, mulberry32, pick, type RNG } from '@/lib/prng';
import { METERS, type Card, type MeterId, type Rating, type RunState } from '@/lib/ship-it/types';

export interface Review {
  rating: Rating;
  prose: string;
  arcsDrawn: string[];
  arcsResolved: string[];
}

const BONUS: Record<Rating, number> = {
  'PIP': 0, 'Meets Expectations': 50, 'Exceeds Expectations': 100, 'Promoted': 200, 'CEO-in-waiting': 400,
};

export const xpForRun = (rating: Rating, weeks: number): number => weeks * 10 + BONUS[rating];

const isBalanced = (s: RunState): boolean => METERS.every((m) => s.meters[m] >= 30 && s.meters[m] <= 70);

function arcFacts(state: RunState, deck: Card[]): { drawn: string[]; resolved: string[] } {
  const byId = new Map(deck.map((c) => [c.id, c]));
  const drawn = [...new Set(state.history.map((h) => byId.get(h.cardId)?.arc).filter((a): a is string => !!a))];
  const resolved = drawn.filter((a) => state.flags.includes(`arc:${a}:resolved`));
  return { drawn, resolved };
}

function rate(state: RunState, arcs: { drawn: string[]; resolved: string[] }): Rating {
  if (state.status === 'dead') return 'PIP';
  const balanced = isBalanced(state);
  if (balanced && arcs.drawn.length >= 2 && arcs.resolved.length === arcs.drawn.length) return 'CEO-in-waiting';
  if (arcs.resolved.length >= 2) return 'Promoted';
  if (balanced) return 'Exceeds Expectations';
  return 'Meets Expectations';
}

// ---- prose fragments (2-3 sentences assembled from pools keyed off run facts) ----

const OPENERS: Record<Rating, string[]> = {
  'PIP': [
    'This quarter did not go the way anyone hoped.',
    'We need to talk about how the quarter ended.',
    'The less said about weeks like these, the better — but HR insists.',
  ],
  'Meets Expectations': [
    'The product shipped and nobody quit, which counts for more than it sounds.',
    'A steady quarter, if you squint past the wobbles.',
    'You kept the lights on under real pressure.',
  ],
  'Exceeds Expectations': [
    'You kept four constituencies fed with one roadmap — genuinely rare.',
    'A balanced quarter under pressure; the meters tell a disciplined story.',
    'Strong quarter. Stakeholders are, improbably, all still speaking to you.',
  ],
  'Promoted': [
    'When it mattered, you closed the loops you opened. Leadership noticed.',
    'You turned two fires into case studies. The promo packet writes itself.',
  ],
  'CEO-in-waiting': [
    'Balanced meters, resolved crises, no bodies. People are whispering about your future.',
    'This is the review we show new PMs as the ceiling. Congratulations.',
  ],
};

// keyed by the lowest meter — one sentence about the sore spot (always included)
const LOW_METER: Record<MeterId, string[]> = {
  users:    ['Users noticed the neglect: growth was the meter you fed last.', 'The Users number limped; adoption paid for your other wins.'],
  business: ['Business confidence took the hits — the board reads that chart first.', 'Business was the meter you gambled with, and it shows.'],
  team:     ['The Team carried the cost; watch the morale line before it watches you.', 'Team morale absorbed every trade-off. That bill comes due.'],
  tech:     ['Tech health quietly eroded — next quarter inherits the debt.', 'The Tech platform creaked all quarter; you shipped on borrowed uptime.'],
};

const DIED: Record<MeterId, string[]> = {
  users:    ['Your DAU chart is a cliff. The product is shelved.'],
  business: ["The board pulls funding. You're fired."],
  team:     ['Your senior engineers quit in one week.'],
  tech:     ['The platform collapses during peak traffic.'],
};

const ARC_GOOD = [
  'Resolving the {arc} arc cleanly was the highlight of the quarter.',
  'The way you closed out the {arc} situation belongs in an onboarding deck.',
];
const ARC_BAD = [
  'The {arc} situation was left to rot, and everyone knows it.',
  'You opened the {arc} storyline and never finished it; consequences pending.',
];
const OVERSHOOT_NOTE = [
  'You also learned that a maxed-out meter is its own emergency.',
  'Note for next time: red-lining a meter invites the backlash card.',
];

export function generateReview(state: RunState, deck: Card[]): Review {
  const arcs = arcFacts(state, deck);
  const rating = rate(state, arcs);
  const rng: RNG = mulberry32(hashString(`shipit-review:${state.seed}:${state.week}`));

  const sentences: string[] = [];
  if (state.status === 'dead' && state.deadMeter) {
    sentences.push(pick(rng, DIED[state.deadMeter]));
    sentences.push(pick(rng, OPENERS.PIP));
  } else {
    sentences.push(pick(rng, OPENERS[rating]));
    const lowest = METERS.reduce((a, b) => (state.meters[a] <= state.meters[b] ? a : b));
    sentences.push(pick(rng, LOW_METER[lowest]));
  }
  const fumbled = arcs.drawn.filter((a) => !arcs.resolved.includes(a));
  if (arcs.resolved.length > 0) sentences.push(pick(rng, ARC_GOOD).replace('{arc}', arcs.resolved[0]));
  else if (fumbled.length > 0) sentences.push(pick(rng, ARC_BAD).replace('{arc}', fumbled[0]));
  else if (state.overshootsTriggered.length > 0) sentences.push(pick(rng, OVERSHOOT_NOTE));

  return { rating, prose: sentences.slice(0, 3).join(' '), arcsDrawn: arcs.drawn, arcsResolved: arcs.resolved };
}

export function buildShareText(review: Review, state: RunState, origin: string): string {
  const m = state.meters;
  return `Ship It · ${review.rating} · survived ${state.week}w · U${m.users} B${m.business} T${m.team} P${m.tech}\n${origin}/ship-it`;
}
