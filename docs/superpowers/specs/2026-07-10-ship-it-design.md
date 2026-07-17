# Ship It — Design Spec

**Date:** 2026-07-10
**Status:** Approved by Alvin (design conversation, 2026-07-10)
**Scope:** The second pm-lab game, "Ship It", built on the existing Lab shell

## Context

Ship It is the flagship of the four greenlit pm-lab games (see
`2026-07-09-significant-design.md` for the Lab shell, design system, juice
library, engagement philosophy, and lab-wide profile — all of which this game
inherits rather than re-specifies). Where Significant proves experimentation
fluency, Ship It proves **product judgment under competing stakeholder
pressure** — prioritization, trade-offs, and living with consequences.

Mechanic (approved): a Reigns-style card run. One dilemma card at a time, two
choices, four live meters, seeded decks, runs of ~12–18 cards ending in a
generated performance review.

## Goals

- A 3–5 minute run that a recruiter finishes and immediately replays ("one
  more run" loop).
- Every card is a real PM dilemma with no strictly-correct answer — the game
  teaches that optimizing one stakeholder starves another.
- The performance review is funny, sharp, and screenshot/share-worthy.
- Duolingo-grade juice throughout; swipe interaction feels native on mobile.
- Deterministic seeded engine, zero backend, same testing discipline as
  Significant.

## Non-goals

- No LLM/API usage (review text is template-generated from run state).
- No multi-quarter campaign or meta-progression beyond lab XP/titles in v1.
- No card editor or user-generated content.
- No leaderboards.

## The four meters

| Meter | Represents | Death at 0 | Overshoot near 100 |
|---|---|---|---|
| Users | Growth, adoption | "Your DAU chart is a cliff. The product is shelved." | Viral spike overwhelms support/infra → Tech and Team take hits |
| Business | Revenue, exec confidence | "The board pulls funding. You're fired." | Monetization squeeze → Users backlash |
| Team | Morale, velocity | "Your senior engineers quit in one week." | Comfort culture → Business pressure card |
| Tech | Platform health (inverse tech debt) | "The platform collapses during peak traffic." | Gold-plating → Business demands features |

- All meters start at 50; clamp to [0, 100].
- **0 ends the run immediately** with a themed full-screen failure.
- **Overshoot**: when a meter is ≥ 85 after a choice, the deck's next draw
  strongly weights that meter's overshoot card (each meter has at least 2).
  Overshoot cards knock other meters down — mechanized stakeholder tension.

## Card system

### Card schema (typed TS data, `src/lib/shipit/cards.ts`)

```ts
interface Choice {
  label: string;                          // button/swipe text, <= 40 chars
  effects: Partial<Record<MeterId, number>>; // -25..+25 per meter
  setFlags?: string[];
  clearFlags?: string[];
}

interface Card {
  id: string;                             // kebab-case, unique
  speaker: string;                        // "Maya, Eng Lead" / "The CEO" / "Big-4 Customer"
  avatar: string;                         // emoji for the portrait chip
  text: string;                           // the dilemma, <= 220 chars
  left: Choice;
  right: Choice;
  requires?: {
    flags?: string[];                     // all must be set
    notFlags?: string[];                  // none may be set
    week?: { min?: number; max?: number };
    meter?: Partial<Record<MeterId, { min?: number; max?: number }>>;
  };
  weight?: number;                        // draw weight, default 1
  arc?: string;                           // arc name, for tests/authoring hygiene
  overshoot?: MeterId;                    // marks this as meter X's overshoot card
}
```

### Content (v1: ~50 cards)

- ~30 core dilemmas (always eligible), ~12 arc/consequence cards (flag-gated),
  ~8 overshoot cards (2 per meter).
- Arcs create consequences: e.g. choosing "skip the postmortem" sets
  `skipped-postmortem`; the week-8+ outage card checks it and hits Tech/Trust
  double. At least 4 authored arcs in v1 (incident, big-customer, burnout,
  launch-gamble).
- **Arc resolution (used by rating tiers)**: each arc has exactly one
  authored resolution card whose better choice sets the flag
  `arc:{name}:resolved`. "≥ 2 arcs resolved well" in the review tiers means
  ≥ 2 such flags set at run end; "all arcs well" means every arc whose
  opening card was drawn ended with its resolved flag set.
- Tone: dry, specific, real. Speakers are named fictional colleagues at a
  fictional product (one product per run, drawn from a small flavor list).
  No lectures — the meters do the teaching.

### Choice hint dots

Each choice shows small dots for the meters it affects (color = meter, no
magnitude, no direction). Informed gambles, not memorization.

## Deck engine (`src/lib/shipit/`)

- Pure TS, seeded via the existing `mulberry32`/`hashString` from
  `src/lib/prng.ts`. A run is fully determined by its seed.
- **Draw algorithm** each turn: filter eligible cards (requires-rules, not
  already drawn this run), apply overshoot weighting when triggered, weighted
  random pick.
- **Run structure**: week counter advances 1 per card. Surviving week 12+
  with all meters > 0 completes the quarter; arc cards drawn beyond week 12
  can extend a run to ~18 cards max (hard stop: week 18 auto-completes).
- Engine emits a `RunState` (meters, week, flags, history of card ids +
  choices) that the UI renders and the review generator consumes.

## Performance review generator

Template-based, seeded, consumes final `RunState`:

- **Rating tiers** by score = weeks survived + meter balance bonus (all
  meters in [30, 70] at end = "balanced leader" bonus) minus failure:
  died = **PIP**; survived unbalanced = **Meets Expectations**; survived
  balanced = **Exceeds Expectations**; survived with ≥ 2 arcs resolved well =
  **Promoted**; perfect (survived, balanced, all arcs well) = **CEO-in-waiting**.
- **Review prose**: 2–3 sentences assembled from fragment pools keyed off
  notable run facts (lowest meter, resolved/fumbled arcs, overshoots
  triggered), so reviews read specific to the run.
- Share text (exact format):
  `Ship It · {rating} · survived {weeks}w · U{users} B{biz} T{team} P{tech}\n{origin}/ship-it`

## Modes

- **Free run** (default): seed = random at run start (client-side
  `Math.random` → seed int, presentation layer; engine stays pure). "Run it
  back" button on the review card restarts instantly.
- **Daily run**: seed from local date (`shipit-daily-YYYY-MM-DD` via
  `hashString`), same deck order for everyone, streak + shield reusing the
  same state patterns as Significant's daily (separate `pmlab:shipit:v1`
  storage key, same reducer style), share grid, countdown, midnight rollover
  handled the same way (tick-refreshed date, fresh date in complete()).

## UX / UI

- **Play screen**: 4 meter bars across the top (icon + animated fill; flash
  on change, red pulse + low heartbeat sfx when < 20), week chip, card stack
  center (speaker chip + avatar, dilemma text), two choice buttons at thumb
  height with hint dots. **Swipe left/right** on the card (framer-motion
  drag with rotation) equals pressing the left/right button; drag past the
  threshold reveals the choice label.
- Card transitions: deal-in flip, fly-out on choice. Meter deltas float up
  (+6 / −12) from the affected bars.
- **Failure screen**: themed full-screen takeover per meter (shake + dark
  flash, thud), then the review card (a failure still gets a review — PIP).
- **Review card**: rating stamp animation, prose, final meters, XP CountUp
  into lab profile, share + "Run it back" buttons.
- Start screen (`/ship-it`): premise in two lines, meter legend, Free run /
  Daily run cards (streak shown), About link, sound toggle.
- All interactions keyboard-operable (buttons are the source of truth; swipe
  is an enhancement). Reduced motion: no swipe rotation/fly-out, instant
  transitions, no confetti.

## Engagement layer (inherits the Significant framework)

- In-session: the juice above; near-death saves ("Tech at 4!") get a dramatic
  recovery flash — manufactured close calls are the run-game dopamine.
- Through-session: "one more run" via instant restart + rating ladder to
  climb; collectible best-rating per mode in local state.
- Cross-session: daily run streak + share grid; lab-wide XP so Significant
  players have visible progress here already.
- `/ship-it/about` documents the stakeholder-tension model, the arc/flag
  system, and the engagement mechanics + ethical lines (same meta-move).

## Error handling

- Storage: same safeStorage pattern (private mode playable, streaks disabled;
  in-memory fallback within session).
- Deck exhaustion (no eligible cards mid-run): engine falls back to any
  not-yet-drawn core card ignoring week rules; if truly none, auto-complete
  the quarter (tested invariant: unreachable in the shipped deck).
- Clipboard fallback: read-only textarea (same as Significant).

## Testing

- Engine unit tests: seeded determinism; meter clamp; death and overshoot
  triggers; week/flag eligibility; draw never repeats a card in a run.
- **Content invariants** (the deck's equivalent of Significant's statistical
  suite): every card reachable from some seed within 200 simulated runs; every
  arc's consequence card reachable when its flag is set; no card's single
  choice can move a meter more than ±25; deck never exhausts across 500
  simulated random-policy runs; every overshoot meter has ≥ 2 cards.
- Review generator: every rating tier reachable; share text exact-format test.
- Hook/component smoke tests per the established pattern; a11y (Lighthouse
  ≥ 95, target 100) and the human device QA checklist before release.

## Tech summary

Everything per the Lab shell spec: Next.js App Router routes under
`/ship-it`, pure TS engine in `src/lib/shipit/`, juice library reuse,
Vercel Analytics events (`game_start` {mode:'shipit-free'|'shipit-daily'},
`card_choice` {cardId, dir}, `run_complete` {rating, weeks, died},
`daily_played`, `streak_extended`, `share_clicked`), zero backend.

## Rollout

1. Engine + card schema + review generator with tests.
2. Card content (50 cards, 4 arcs) + content-invariant suite.
3. Play UI (meters, card stack, swipe) + failure/review screens.
4. Start screen + daily mode + about page + analytics.
5. Lab home card for Ship It; deploy; QA.
