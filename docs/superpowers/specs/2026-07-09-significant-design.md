# Significant — Design Spec

**Date:** 2026-07-09 (rev 2: engagement layer + vibrant visual identity, same day)
**Status:** Approved by Alvin (design conversation, 2026-07-09); rev 2 pending review
**Scope:** The Lab app shell + the first game, "Significant"

## Context

Alvin is rebuilding his product manager portfolio site. Alongside real products
(e.g. Bragora), the portfolio links to a set of small, self-contained interactive
projects that demonstrate PM craft to recruiters at companies like Meta and
Anthropic. Four games are greenlit, all living in one "Lab" app:

1. **Significant** — A/B testing intuition game (this spec)
2. **Ship It** — PM decision game (future spec)
3. **Jailbreak** — prompt-injection challenge (future spec)
4. **Metric Detective** — dashboard mystery game (future spec)

Design rationale from research: PM portfolios that win big-tech offers pair
shipped artifacts with documented trade-offs; the top AI-PM hiring separator is
experimentation/eval fluency; the quality bar for self-contained web interactives
is Neal.fun — curiosity-driven, instant-loading, mobile-first, not childish.
Each game therefore doubles as proof of a specific PM competency, and each ships
with a short PM writeup page.

## Goals

- A visitor on a phone taps a link from the portfolio and is playing within seconds.
- A hiring manager who plays recognizes genuine experimentation fluency.
- **The product feels rich and shipped** — Duolingo-grade polish, color, and
  feedback. The intended reaction: "if he built this in his spare time, I want
  him building real product here."
- **Engagement psychology is a first-class design layer** (see Engagement
  layer): the game should hold a session, pull players through the campaign,
  and give them a reason to return tomorrow.
- Weekend-scale core build; zero backend; near-zero running cost.
- Replayable enough to share (daily mode + emoji share grid).

## Non-goals

- No accounts, no server-side state, no database.
- No LLM/API usage in Significant (Jailbreak will handle that later).
- No leaderboards in v1.
- The other three games are out of scope beyond shell routing conventions.

## The Lab shell

- **One repo, one Vercel project.** Next.js App Router + TypeScript + Tailwind.
- **Home page (`/`)**: title, one-line positioning ("Small games about product
  craft, built with AI"), and a card per game (title, one-liner, play link).
  Unreleased games show as "coming soon" cards only once their build starts.
- **Per-game routes**: `/significant` (game), `/significant/about` (PM writeup:
  why it exists, key design trade-offs, what it demonstrates, how it was built).
- **Design system — vibrant, Duolingo-grade** (revised in rev 2, overriding the
  earlier dark/restrained direction): a colorful, saturated palette on a light
  base (one dominant brand hue per game + supporting bright feedback colors:
  green = correct, red/orange = wrong, gold = rewards), chunky rounded
  components, bold friendly type (still max 4 sizes / 2 weights), tactile
  "pressed" 3D button treatment, playful SVG illustration. Discipline still
  applies — 8pt grid, one cohesive token set shared across all four games so
  the Lab reads as a single rich product, not four weekend hacks.
- **Shared juice library**: a small internal package of feedback primitives
  used by every game — count-up numbers, confetti/particle bursts, card flip
  and shake animations, progress-bar fills with overshoot, sound effects
  (user-toggleable, preference persisted), and haptics via `navigator.vibrate`
  where supported. Motion respects `prefers-reduced-motion`.
- **Lab-wide meta-progression**: one localStorage profile aggregates XP and
  badges across all games. Playing one game visibly starts progress in a
  larger system — a reason to try the next game.
- **Analytics**: Vercel Analytics; custom events `game_start`, `round_complete`,
  `campaign_complete`, `daily_played`, `streak_extended`, `share_clicked`,
  `sound_toggled` so real usage and retention numbers can be quoted later.

## Game design: Significant

### Premise

You are the PM on ship review. For each experiment readout you must call
**Ship / Kill / Keep Running**. Every scenario is simulated from a hidden ground
truth (the true effect of the change), so the game scores you against what was
*actually* true — not what looked plausible.

### Core loop (~30 seconds per round)

1. **Readout card** shows: hypothesis (one sentence, fictional but realistic
   product context), arms A/B with per-arm sample size, days running, a small
   daily conversion-rate time series (SVG sparkline, both arms), observed lift,
   and a 95% confidence interval on the lift.
2. Player taps **Ship**, **Kill**, or **Keep Running** (three thumb-sized buttons).
3. **Reveal**: correct/incorrect, the ground truth ("true lift was 0% — the
   observed 12% was noise"), and a 2–3 sentence explanation naming the trap.
4. Score updates; advance to next round.

### Correctness rules

Each archetype defines the correct call:

- True positive lift + adequate power + no integrity issues → **Ship**
- True zero/negative lift (observed lift is noise or bias) → **Kill**
- Test genuinely unresolved (underpowered so far, early peek, data-quality
  issue like SRM that requires rerun) → **Keep Running** (reveal copy
  distinguishes "let it run" from "fix and rerun" where relevant)

### Trap archetypes (v1: 10)

Each archetype = parameter ranges + a simulation recipe + templated reveal copy.

1. **Peeking** — significant-looking lift at day 2–4 of a 14-day test; true effect ~0.
2. **Underpowered** — real but small true effect; sample far too small to confirm. Correct: keep running.
3. **Novelty effect** — early lift decaying visibly across the time series; true long-run effect ~0.
4. **Sample-ratio mismatch** — arm sizes deviate beyond plausible randomization (e.g. 48/52 on large n); results untrustworthy regardless of lift.
5. **Multiple comparisons** — readout notes this was the 1 significant metric among 12 checked; true effect ~0.
6. **Simpson's paradox** — aggregate lift positive but both major segments negative (segment table shown); mix shift artifact.
7. **Seasonality/event contamination** — time series shows a spike aligned to an external event noted in the readout (e.g. promo day); effect not attributable.
8. **Winner's curse** — significant result on tiny n with implausibly huge lift (e.g. +40% conversion); true effect much smaller/zero.
9. **Clean win** — adequately powered, stable lift, healthy CI. Correct: ship.
10. **Clean loss** — adequately powered, clearly negative/flat. Correct: kill.

Honest scenarios (9, 10) are essential: they punish reflexive cynicism and make
the game about judgment, not pattern-matching "everything is a trap."

### Scenario engine

- Pure TypeScript module (`src/lib/engine/`), no React imports, fully unit-testable.
- **Seeded PRNG** (e.g. mulberry32) — a seed fully determines a scenario.
- Simulation draws real binomial data per arm per day from the archetype's true
  parameters, so every displayed number (daily rates, lift, CI) is internally
  consistent and recomputable.
- Displayed stats (lift, 95% CI, significance) computed from the simulated
  draws with standard two-proportion methods.
- Templated reveal copy per archetype with slot-filled numbers.
- Fictional product/hypothesis flavor text drawn from a curated list, seeded.

### Modes

- **Campaign**: 10 levels, one per archetype, ordered from blatant to subtle.
  Per-level result stored in localStorage. Completion shows an
  **"Experimentation IQ"** summary card: score out of 10, a title
  (e.g. "p-hacker's nightmare"), per-trap results, share button.
- **Daily**: one scenario for everyone, seeded from the visitor's local date
  (`YYYY-MM-DD` → seed), archetype rotated so consecutive days differ. Streak
  count in localStorage. Share button copies a Wordle-style emoji grid, e.g.:

  ```
  Significant #142 🟢 streak 6
  [link]
  ```

### Scoring

Correct call = base XP. In-session combo multiplier for consecutive correct
calls (x2, x3...) shown as a flame/badge that grows — and visibly breaks on a
wrong call. No time pressure. Campaign shows X/10 plus total XP; daily shows
correct/incorrect + streak + XP earned.

## Engagement layer

Research-backed mechanics (Duolingo case studies; game-feel/"juice" design
literature), applied deliberately. Three time horizons:

### 1. In-session: juice (make every tap satisfying)

- Every interaction gets amplified feedback: buttons depress with a thunk,
  the readout card deals in with a flip, numbers count up rather than appear,
  correct answers fire a confetti burst + rising chime, wrong answers shake
  the card + dull thud. XP flies into the score counter.
- Combo multiplier with escalating visual intensity (glow, flame stages) —
  variable-ratio dopamine within a session.
- Occasional random bonus: a "critical insight" 2x XP round appears
  unpredictably (variable reward schedule).
- Sound on by default with a prominent, persistent mute toggle; haptic pulse
  on Android for correct/wrong.

### 2. Through-session: progression pull (finish the campaign)

- Campaign rendered as a **Duolingo-style level path** — a winding map of 10
  nodes with locked levels visible ahead (Zeigarnik effect: visible unfinished
  business pulls players forward).
- **Endowed progress**: a 20-second "calibration" warm-up round auto-completes
  node 0, so players start with the path already begun.
- Per-level stars (correct on first try = 3 stars) create a perfection loop
  for replays.
- Campaign completion delivers the "Experimentation IQ" card with a tiered,
  collectible title (e.g. Intern → Growth PM → p-Hacker's Nightmare) and a
  big celebratory moment (full-screen confetti, animated card reveal).

### 3. Cross-session: return hooks (bring them back)

- **Daily streak with loss aversion**: streak flame counter; after a completed
  daily, show a countdown to the next puzzle ("next experiment in 14:32:07").
- **Streak Shield**: earned by a perfect campaign or 7-day streak; auto-spends
  to protect a missed day (Duolingo's Streak Freeze pattern — protects the
  at-risk segment instead of punishing them).
- Wordle-style emoji share grid after each daily = social distribution loop.
- Lab-wide XP/badge profile gives a reason to come back and try the *other*
  games.

### The meta-move

`/significant/about` explicitly documents this engagement system — which
mechanics were used (loss aversion, variable rewards, endowed progress,
juice), why, and where the ethical line was drawn (no dark patterns: no fake
scarcity, no guilt copy, sound/motion opt-outs, no data collection). A
recruiter who enjoyed the game then reads a PM articulating exactly why they
enjoyed it. The addictiveness itself becomes the demonstrated skill.

## UX / UI

- **Mobile-first single column**: readout card, then the three decision buttons
  within thumb reach at the bottom. Desktop centers the same column (~28rem).
- Reveal is an in-place card state change (no route change), with a clear
  correct/incorrect treatment, juice (confetti/shake), and a "Next" button.
- Numbers formatted for scanning (lift as %, CI as range, n with thousands separators).
- Loading: none needed post-hydration (engine is client-side); the app is static.
- Tone: playful and colorful in visuals and feedback, smart and precise in the
  statistical copy. The reveal explanations stay sharp and credible — the
  Duolingo energy lives in the interaction layer, never in dumbed-down content.

## Error handling

- `localStorage` unavailable (private mode): game fully playable; streaks and
  campaign persistence silently disabled.
- Clipboard API unavailable: share button falls back to a selectable text block.
- Engine is deterministic; any scenario bug is reproducible from its seed.
  Seed is included as a code-comment-level detail in the DOM (data attribute)
  to aid debugging, invisible to players.

## Testing

- **Unit tests (Vitest)** on the engine: given a seed, scenario generation is
  deterministic; each archetype's generated data satisfies its invariants
  (e.g. SRM scenarios actually fail an SRM check; clean wins are actually
  significant at the displayed n); correct-call logic matches archetype intent.
- **Statistical sanity tests**: across many seeds, peeking scenarios' true lift
  is ~0; underpowered scenarios' true lift is within the declared range, etc.
- **Component smoke tests** for the round card and reveal states.
- Manual mobile QA pass (iOS Safari + Android Chrome) before deploy, including
  sound toggle persistence, haptics, `prefers-reduced-motion`, and juice
  performance on mid-range devices (animations must stay at 60fps).

## Tech summary

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript, Tailwind |
| Hosting | Vercel, single project, static/near-static |
| State | localStorage only |
| Charts | Hand-rolled SVG sparklines |
| Randomness | Seeded PRNG (mulberry32), date-seeded daily |
| Analytics | Vercel Analytics + custom events |
| Backend / API | None |

## Rollout

1. Scaffold Lab shell + vibrant design tokens + juice library primitives.
2. Build engine + tests, then round UI with full juice, then campaign path,
   then daily + streaks + share.
3. Write `/significant/about` PM writeup (including the engagement-design section).
4. Deploy to Vercel, link from portfolio site.

Note: the engagement layer widens scope beyond a strict weekend for this first
game — the juice library and level path are one-time investments the other
three games inherit.
