# Significant — Design Spec

**Date:** 2026-07-09
**Status:** Approved by Alvin (design conversation, 2026-07-09)
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
- Weekend-scale build; zero backend; near-zero running cost.
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
- **Design system**: shared tokens — 8pt spacing grid, max 4 font sizes / 2
  weights, 60/30/10 color rule with one restrained accent, dark-leaning default
  theme. Subtle motion only.
- **Analytics**: Vercel Analytics; custom events `game_start`, `round_complete`,
  `campaign_complete`, `share_clicked` so real usage numbers can be quoted later.

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

Correct call = 1 point. No partial credit; no time pressure. Campaign shows
X/10; daily shows correct/incorrect + streak.

## UX / UI

- **Mobile-first single column**: readout card, then the three decision buttons
  within thumb reach at the bottom. Desktop centers the same column (~28rem).
- Reveal is an in-place card state change (no route change), with a clear
  correct/incorrect treatment and a "Next" button.
- Numbers formatted for scanning (lift as %, CI as range, n with thousands separators).
- Loading: none needed post-hydration (engine is client-side); the app is static.
- The tone is dry and confident, never cutesy. No emoji in the game UI itself
  (emoji appear only in the share grid).

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
- Manual mobile QA pass (iOS Safari + Android Chrome) before deploy.

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

1. Scaffold Lab shell + design tokens.
2. Build engine + tests, then round UI, then campaign, then daily + share.
3. Write `/significant/about` PM writeup.
4. Deploy to Vercel, link from portfolio site.
