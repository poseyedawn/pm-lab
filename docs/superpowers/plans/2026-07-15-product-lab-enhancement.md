# Alvin's Product Lab — Product Enhancement Implementation Plan

- **Date:** 2026-07-15
- **Status:** Proposed after source audit, research synthesis, and completed 18-state live visual pass
- **Source branch:** `main` at `dbd8362`
- **Planning branch:** `codex/product-lab-audit-plan`
- **Primary product:** Lab shell + Significant
- **Protected parallel lane:** `feature/ship-it` remains separate until shared-shell sequencing is approved
- **Evidence:** [Experience audit](../../audits/2026-07-15-product-lab-experience-audit.md), [interaction inventory](../../audits/2026-07-15-product-lab-interaction-inventory.md), [research brief](../../research/2026-07-15-game-engagement-and-product-lab-research.md), and [comparator study](../../research/2026-07-15-browser-game-comparator-study.md)

## Goal

Turn Alvin's Product Lab from a sparse collection index with a functional game into a complete, authored product that:

- gets a cold visitor to a meaningful decision in under 30 seconds;
- makes the first round understandable without requiring A/B-testing expertise;
- creates a satisfying loop of decision, evidence, insight, and mastery;
- gives a recruiter or client concrete proof of Alvin's product judgment and craft;
- supports ethical return behavior through daily cases and visible progress;
- becomes a durable shell for Significant, Ship It, and later Lab games.

## Outcome definition

The enhancement is successful when a new visitor can answer all five questions without explanation from Alvin:

1. What is this Lab?
2. What decision am I making?
3. Why was my answer right or wrong?
4. What should I do next?
5. What does this demonstrate about the person who built it?

## Product principles

1. **Play before explanation.** The primary path begins with a guided decision, not a marketing carousel or a level map.
2. **Teach through evidence.** Every reveal connects the outcome to the signal on the original readout.
3. **Mastery before currency.** XP, stars, and streaks support competence; they are not the reason the game exists.
4. **Every effect has a job.** Motion, sound, haptics, and color must confirm input, direct attention, explain state, or celebrate real progress.
5. **Portfolio proof is built in.** Authorship and design rationale are visible without interrupting play.
6. **Return hooks stay humane.** No guilt, fake scarcity, punishment notifications, paywalls, or inaccessible opt-outs.
7. **The Lab is the product.** Shared navigation, profile, tokens, settings, and collection behavior must work across future games.

## Non-goals

- Accounts, cloud saves, global leaderboards, or social graphs.
- Paid currency, consumable purchases, loot boxes, or random paid rewards.
- A full desktop game layout that sacrifices mobile clarity.
- Rewriting the statistics engine unless the audit uncovers correctness defects.
- Shipping Ship It from this plan.
- Merging, deploying, or updating the portfolio link without explicit approval.

## Baseline constraints

- Next.js App Router, React, TypeScript, Tailwind, Vitest, and Vercel remain the stack.
- Before implementation, read the relevant Next.js 16 guides in `node_modules/next/dist/docs/` as required by the repository's `AGENTS.md`.
- Do not add a dependency unless an existing platform API or current dependency cannot meet the need.
- Preserve deterministic scenario generation and zero-backend daily behavior.
- Preserve absolute `@/` imports and the types → services → hooks → components → pages dependency direction.
- Keep modified files under 300 lines when practical; extract at 300 and do not allow new 500-line files.
- All new runtime inputs and persisted-state migrations require Zod validation.

## Branch and integration strategy

The current clean local checkout is on `feature/ship-it`. This plan lives in a separate worktree and branch created from `main`, so no Ship It code has been mixed into the audit.

Recommended delivery strategy:

1. Land documentation only from `codex/product-lab-audit-plan` if desired.
2. Create one implementation branch per slice from a freshly synced `main`.
3. Land shared Lab foundations before the final Ship It integration.
4. Rebase or merge `feature/ship-it` onto the shared-shell baseline only after the shell API and tokens stabilize.
5. Keep Ship It route behavior out of Significant-focused PRs, except for compile-safe adaptations to shared interfaces.

## Design gate before code

The audit identifies the product direction and establishes a measured live baseline, but it does not select a finished visual target. Before Slice 2 begins:

1. Use the accepted 320px, 390px, and 1600px captures as the current baseline; add 768px when comparing responsive concepts.
2. Generate exactly three visual directions for the Lab landing and Significant first-run screen.
3. Compare each direction against the existing light, saturated, tactile design language.
4. Select one direction and produce source mockups for mobile and desktop.
5. Record the chosen token, type, illustration, motion, and layout decisions.

No production UI implementation should start until one visual direction is selected. Slice 0 and nonvisual bug fixes can proceed earlier.

## Target information architecture

```text
/
  Lab landing
  Featured Significant preview
  Game collection
  Lab profile and recent mastery
  Alvin / portfolio connection

/significant
  First visit -> Significant introduction + calibration CTA
  Returning visit -> campaign home + continue CTA

/significant/calibration
  Guided first case
  Evidence coaching
  First reveal
  Earned baseline completion

/significant/play?level=N
  Campaign case
  Decision
  Evidence-preserving reveal
  Continue or focused retry

/significant/daily
  Daily case
  Result + native share + practice/continue

/significant/profile
  Mastery profile, trap breakdown, badges, share artifact

/significant/about
  Portfolio-quality product case study
```

If route expansion feels excessive during implementation, calibration can be an explicit state inside `/significant/play`; the behavioral distinction is required even if the URL is not.

## Shared architecture target

```text
src/
  types/
    lab.ts
    preferences.ts
    analytics.ts
    significant.ts
  services/
    labProfileService.ts
    preferencesService.ts
    analyticsService.ts
    shareService.ts
  hooks/
    lab/useLabProfile.ts
    lab/usePreferences.ts
    lab/useGameCollection.ts
    significant/useCalibration.ts
    significant/useCampaign.ts
    significant/useDaily.ts
    significant/useGameRound.ts
  components/
    lab/
      LabShell.tsx
      LabHeader.tsx
      LabMark.tsx
      FeaturedGame.tsx
      GameCollection.tsx
      LabProfileSummary.tsx
    game/
      GameShell.tsx
      GameHeader.tsx
      GameSettings.tsx
      ProgressReward.tsx
    significant/
      SignificantIntro.tsx
      CalibrationRound.tsx
      EvidenceReadout.tsx
      DecisionControls.tsx
      EvidenceReveal.tsx
      CampaignMap.tsx
      MasteryProfile.tsx
      ShareCard.tsx
```

Types remain dependency-free. Services may import types and browser/platform clients. Hooks compose services and domain state. Components render hook state. Pages remain orchestration layers.

---

## Slice 0 — Baseline, truthfulness, and instrumentation

**Purpose:** Fix trust and measurement gaps before changing the experience.

### Work

- Replace “No data collected” with accurate plain-language disclosure explaining aggregate Vercel Analytics and custom interaction events.
- Add a compact privacy/analytics note to the case study and Lab footer.
- Validate `level` query values against known campaign levels; redirect or fall back without writing an invalid level ID.
- Rename ambiguous analytics events:
  - `share_clicked` -> `share_succeeded` when the clipboard/native share resolves;
  - add `share_failed` with a non-sensitive reason category;
  - keep a separate `share_opened` only for native-share invocation if measurable.
- Add missing funnel events using typed names and properties.
- Capture current performance, accessibility, and funnel baselines before visual changes.

### Event model

| Event | Required properties | Purpose |
|---|---|---|
| `lab_viewed` | referrer class, viewport class | Top of funnel |
| `game_selected` | game ID, placement | Lab-to-game conversion |
| `game_intro_viewed` | game ID, first/returning | Entry conversion |
| `calibration_started` | game ID | First-run activation |
| `decision_made` | game ID, mode, level, call | Core action reached |
| `reveal_viewed` | game ID, mode, correct, archetype | Learning loop reached |
| `round_continued` | next action type | Loop continuation |
| `campaign_level_completed` | level, attempts, stars | Progression |
| `daily_completed` | correct, streak band | Return loop |
| `share_succeeded` | surface, method | Distribution |
| `case_study_viewed` | entry surface | Portfolio conversion |
| `portfolio_returned` | entry surface | Lab-to-portfolio value |

Do not send hypothesis text, seeds, clipboard contents, stable personal identifiers, or raw local profile data.

### Success metrics

- **Lab conversion:** `game_selected / lab_viewed`.
- **Activation:** `reveal_viewed / game_intro_viewed` for first-time visitors.
- **First-loop continuation:** second `decision_made / first reveal_viewed` in a session.
- **Campaign depth:** median levels completed per activated visitor.
- **Daily conversion:** `daily_completed / daily_viewed`.
- **Portfolio proof:** `case_study_viewed` and `portfolio_returned` after at least one reveal.
- **Share success:** `share_succeeded / share_attempted`.

Vercel custom events do not define retention cohorts on their own. If longitudinal retention cannot be measured without adding invasive identity, use privacy-preserving aggregate daily return signals and explicit playtest follow-up instead of inventing a pseudo-precise retention number.

### Files

- Modify `src/lib/analytics.ts` or replace it with `src/services/analyticsService.ts`.
- Create `src/types/analytics.ts`.
- Modify `src/app/layout.tsx`, `src/app/page.tsx`, Significant route pages, `ShareGrid.tsx`, and `IQCard.tsx`.
- Create unit tests for event-name and property validation.

### Acceptance

- Every event compiles against a discriminated union; arbitrary string events are rejected by TypeScript.
- Analytics failures never break play.
- Privacy copy matches the actual implementation.
- Invalid, missing, decimal, negative, `NaN`, and out-of-range level values cannot corrupt progress.
- Baseline measurements and test notes are saved under `docs/qa/`.

---

## Slice 1 — Shared Lab shell, profile, and preference foundation

**Purpose:** Build the durable product layer needed by every game.

### Work

- Create a responsive `LabShell` with skip link, Lab home navigation, portfolio return, main content, and footer.
- Create `GameShell` and `GameHeader` with Lab breadcrumb, game identity, progress summary, and settings trigger.
- Define a per-game theme contract without accepting arbitrary Tailwind class strings.
- Move persistent preference access behind a service and Zod-validated migration.
- Add independent settings for sound, haptics, and reduced motion.
- Default motion to system preference; let the explicit player preference override it.
- Expose the existing Lab-wide XP/profile state on the Lab home.
- Define versioned profile migrations so Ship It and future games can contribute safely.
- Remove the captured 5px horizontal overflow from the alternating campaign path without flattening its visual rhythm.

### Type contracts

```ts
type GameId = 'significant' | 'ship-it';

interface GameTheme {
  accent: 'violet' | 'orange';
  iconKey: 'significant' | 'ship-it';
}

interface LabPreferences {
  sound: boolean;
  haptics: boolean;
  motion: 'system' | 'reduced' | 'full';
}

interface LabGameProgress {
  gameId: GameId;
  xp: number;
  completedMilestones: string[];
  lastPlayedAt: string | null;
}
```

Use Zod schemas at the storage boundary. Components receive parsed types only.

### Files

- Create `src/types/lab.ts` and `src/types/preferences.ts`.
- Create `src/services/labProfileService.ts` and `src/services/preferencesService.ts`.
- Create `src/hooks/lab/useLabProfile.ts` and `src/hooks/lab/usePreferences.ts`.
- Create shared components under `src/components/lab/` and `src/components/game/`.
- Modify `src/app/layout.tsx` and `src/app/globals.css`.

### Acceptance

- All routes have a keyboard-accessible way back to the Lab.
- All interactive links and buttons have visible focus states.
- Sound, haptics, and motion settings persist and affect every current feedback primitive.
- `prefers-reduced-motion` disables pulse, count-up movement, confetti, route motion, and nonessential transforms.
- Storage denial or corrupt JSON falls back safely without a blank screen.
- Profile migration tests cover missing, old, malformed, and future-version data.
- Campaign navigation has no horizontal overflow at 320px or 390px.

---

## Slice 2 — Rebuild the Lab landing page

**Purpose:** Make the collection feel authored, credible, and irresistible to sample.

### Page structure

1. **Lab header:** distinct Lab mark, “Back to Alvin's portfolio,” optional profile summary.
2. **Interactive hero:** one product dilemma artifact, short promise, and immediate “Make the call” CTA.
3. **Featured game:** Significant artwork/gameplay preview, 30-second promise, skill tags, campaign depth, and continue state.
4. **Game collection:** shipped, in-progress, and intentionally unavailable states; never show empty placeholder cards that imply broken products.
5. **Lab profile:** total cases, mastery badges, daily status, and cross-game XP when meaningful.
6. **Authorship strip:** one compact statement about why Alvin builds the Lab, with a route to the portfolio/case studies.

### Content direction

Replace generic language with concrete stakes. Candidate structure:

- Eyebrow: “Alvin's Product Lab.”
- Headline: “An arcade for product judgment.”
- Supporting line: “Make the call on experiments, trade-offs, and product failures. Each game takes less than a minute to start.”
- Primary CTA: “Make your first call.”
- Proof cues: “No signup,” “real simulated data,” “10 campaign cases,” “daily challenge.”

Final copy requires a dedicated copy review and should preserve Alvin's natural voice.

### Interaction details

- The hero CTA deep-links to calibration, not the generic campaign map.
- Returning visitors see “Continue level N” while first-time visitors see “Start calibration.”
- Game cards include meaningful hover/focus/press states and a still image or generated asset that reflects real gameplay.
- Desktop can add atmosphere and supporting content while keeping the game interaction column compact.
- Replace the captured 400px-on-1600px island with a deliberate desktop composition that still keeps the playable surface focused.
- Empty and loading states reserve space to avoid layout shift.

### Files

- Replace `src/app/page.tsx` with a thin composition page.
- Replace or split `src/components/lab/GameCard.tsx`.
- Add `LabHero`, `FeaturedGame`, `GameCollection`, `LabProfileSummary`, and `LabFooter`.
- Add approved generated or source assets under `public/lab/`.
- Add route-specific metadata and Open Graph assets.

### Acceptance

- A first-time visitor can begin calibration with one primary action above the fold at 320, 375, 768, and 1440 CSS pixels.
- A returning visitor sees current progress without losing access to a fresh start.
- The page explains the Lab, the featured game, time-to-play, and Alvin's authorship without requiring a scroll on standard mobile.
- Game cards remain fully operable by keyboard and screen reader.
- LCP ≤ 2.5 s, INP ≤ 200 ms, and CLS ≤ 0.1 at the 75th-percentile target; lab QA uses both lab and field data when available.

---

## Slice 3 — Significant introduction and real calibration

**Purpose:** Earn the first decision and convert fake endowed progress into learned progress.

### First-visit experience

- Show the premise in one sentence and one gameplay artifact.
- State the role: “You're the PM in ship review.”
- State the goal: “Use the evidence to Ship, Kill, or Keep Running.”
- State time and commitment: “One case, about 30 seconds.”
- Begin an interactive calibration case immediately.

### Calibration case design

- Use a hand-curated, deterministic clean win with a visually obvious signal.
- Introduce one concept at a time:
  1. Hypothesis and metric.
  2. Lift and uncertainty.
  3. The three calls.
- Let the player choose; do not auto-complete the round.
- Keep copy skippable and replayable.
- On reveal, highlight the decisive evidence and award the existing 50 baseline XP.
- Only after completion show the campaign map, daily mode, and deeper systems.

### Returning behavior

- Returning incomplete players land on a concise campaign home with one dominant “Continue” action.
- Completed players see mastery/profile first and daily status second.
- A “Replay calibration” action remains available from help/settings.

### Files

- Create `src/types/significant.ts` if not already separated from engine types.
- Create `src/hooks/significant/useCalibration.ts`.
- Create `SignificantIntro`, `CalibrationRound`, and contextual-tip components.
- Modify `src/app/significant/page.tsx` and progress persistence.
- Add a route or state machine for calibration.

### Acceptance

- New state has 0 XP and no `warmupDone` before the player acts.
- Calibration awards progress only after a decision and reveal.
- The first interaction can be completed with pointer, keyboard, and screen reader.
- Tutorial steps can be skipped, replayed, and exited.
- Daily, streak, shield, and full map concepts do not interrupt the calibration.

---

## Slice 4 — Rebuild the decision and learning loop

**Purpose:** Preserve the strong mechanic while making every answer teach.

### Readout hierarchy

- Lead with the hypothesis and one primary decision signal.
- Group secondary statistics behind clear labels and optional explanations.
- Annotate the chart when an event, trend, or data-quality issue is material.
- Add plain-language definitions for CI, p-value, sample ratio, and power without removing expert precision.
- Expose an accessible textual summary of the chart and segment comparison.

### Decision controls

- Keep three large semantic buttons.
- Add concise supporting labels only if playtesting shows confusion:
  - Ship — evidence is strong enough.
  - Kill — evidence says no.
  - Keep Running — evidence is unresolved or invalid.
- Support 1/2/3 keyboard shortcuts when focus is not in an editable field, with visible hints and no keyboard trap.
- Confirm input in the next frame before starting any longer reveal transition.

### Evidence-preserving reveal

- Keep the readout visible or provide an immediate before/after layout.
- Highlight the decisive evidence using text, shape, and color.
- Structure feedback as:
  1. Outcome.
  2. Correct call.
  3. Decisive signal.
  4. Why the tempting alternative was wrong.
  5. Transfer rule for future cases.
- Offer “Continue to next case” after success.
- Offer “Try another [trap name] case” after failure.
- Explain combo and star changes at the moment they occur.

### Random reward decision

Remove the unrelated 5% “Critical Insight ×2” reward or redesign it as a skill-earned bonus with a transparent trigger, such as identifying the decisive signal before reveal. Random XP does not improve judgment mastery and complicates the otherwise truthful scoring model.

### Files

- Refactor `GameRound`, `ReadoutCard`, `RevealPanel`, and `DecisionButtons` into bounded components.
- Extend `useGameRound` with explicit `reading`, `deciding`, `revealing`, and `complete` states.
- Add a reusable `EvidenceAnnotation` model to scenario output rather than hard-coding visual clues in components.
- Update engine types and archetype generators only where required to expose explanatory metadata.

### Acceptance

- The decisive evidence remains available during feedback.
- Every archetype has a human-readable decisive-signal annotation and transfer lesson.
- Decision buttons respond visibly within one frame.
- Double decisions and double continuation remain impossible.
- Chart information and segment comparison are understandable without color or vision.
- Correct and incorrect flows both have an unambiguous next action.
- The full initial decision surface fits at 320px without horizontal movement or pushing a primary decision below the intended first view.
- Component and hook tests cover all state transitions and duplicate-action guards.

---

## Delivery companion

Slices 5–8, release QA, playtesting, PR sequencing, dependency policy, open decisions, and the final definition of done are maintained in [`2026-07-15-product-lab-delivery-playbook.md`](2026-07-15-product-lab-delivery-playbook.md).
