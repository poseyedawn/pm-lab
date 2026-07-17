# Exception Room Comprehensive Implementation Plan

> **Implementation status:** Plan only. No product code has been authorized or started by this document.

**Goal:** Build Exception Room as a four to six minute, turn-based AI operations simulation in pm-lab. Players manage a synthetic human-review queue under finite capacity, inspect evidence, resolve cases through approval, correction, or escalation, and receive an inspectable debrief across safety, service, capacity, and backlog.

**Product specification:** `docs/superpowers/specs/2026-07-16-exception-room-design.md`  
**Research brief:** `docs/research/2026-07-16-exception-room-research.md`  
**Fable audit:** `docs/reviews/2026-07-16-exception-room-fable-audit.md`  
**Audit disposition:** `docs/reviews/2026-07-16-exception-room-fable-disposition.md`  
**Target repository:** `/Users/Alvin/Al the Builder/portfolio-projects/pm-lab`  
**Portfolio integration repository:** `/Users/Alvin/Al the Builder/portfolio`  
**Plan date:** 2026-07-16  
**Plan status:** Revised after Fable audit; owner approval required before implementation

## 1. Outcome and proof

The finished product must prove five things through behavior rather than claims:

1. Alvin can translate human-oversight principles into an operating workflow.
2. He understands that model confidence, operational consequence, evidence, authority, and capacity interact.
3. He can design an accessible serious game with defensible learning mechanics.
4. He can specify a deterministic, testable product engine rather than hide logic inside the UI.
5. He can explain tradeoffs, measurement, limitations, and ethical boundaries on the public about page.

The product is complete only when the real deployed route, mobile experience, accessibility flow, analytics, and portfolio integration have been verified. Green unit tests alone are insufficient.

## 2. Authorization boundaries

- This plan does not authorize implementation, dependency installation, deployment, production analytics changes, portfolio publication, or merge.
- Stage 1 and Stage 2 implementation may start only after Alvin approves the revised plan. Stage 4 UI work additionally requires Alvin to select one of three visual directions.
- Keep pm-lab and portfolio changes in separate branches and commits.
- Never merge, deploy, or publish without explicit owner direction.
- Browser-driven or Playwright QA requires the normal owner approval gate before execution.
- Real TRA data, workflows, interfaces, clients, and metrics are outside scope.

## 3. Locked product decisions

- Product name: Exception Room.
- Slug: `exception-room`.
- Default mode: turn-based campaign.
- Target duration: four to six minutes.
- Campaign size: twelve synthetic cases across three shifts.
- Core actions: Approve, Correct, Escalate.
- Pressure: finite capacity, aging, arrivals, and service-level thresholds.
- Default mode has no real-time countdown.
- Queue order is player-selectable rather than a forced card sequence.
- Decision support shows route reason, consequence, reversibility, evidence, and due state.
- Results show Safety, Service, Capacity, raw metrics, and a descriptive profile.
- Pure deterministic engine with authored cases and no AI API.
- No auth, backend, database, upload, free-text input, leaderboard, or hiring assessment.
- WCAG 2.2 AA target, keyboard-first source of truth, reduced motion, optional sound.
- Existing pm-lab shell, profile, analytics wrapper, PRNG, storage, and juice primitives are reused.

## 4. Deferred decisions

The visual ideation gate must resolve these before UI coding:

- selected queue layout;
- evidence presentation pattern;
- exact fictional organization and neutral domain language;
- final deep teal identity and restrained amber accent token values, measured against the current Lab palette;
- icon set and game-card illustration;
- campaign shift names;
- final share-card layout.

Timed challenge, additional domain packs, user-authored cases, multiplayer, and leaderboards remain post-v1 ideas and must not leak into the MVP backlog.

## 5. Architecture

### 5.1 Layering

```text
Typed domain and authored content
  <- deterministic engine and scoring
    <- persistence and analytics services
      <- React hooks
        <- presentation components
          <- thin App Router pages
```

- `src/lib/exception-room/**` has zero React imports.
- Engine functions receive all time, seed, content, and action inputs explicitly.
- Components do not read or write localStorage directly.
- Pages orchestrate route-level composition only.
- Analytics calls live behind the existing wrapper and receive a constrained event type.

### 5.2 Proposed file map

```text
src/
├── lib/
│   └── exception-room/
│       ├── types.ts
│       ├── cases.ts
│       ├── cases.test.ts
│       ├── engine.ts
│       ├── engine.test.ts
│       ├── replay.ts
│       ├── scoring.ts
│       ├── scoring.test.ts
│       ├── analytics.ts
│       ├── analytics.test.ts
│       ├── review.ts
│       ├── review.test.ts
│       ├── state.ts
│       ├── state.test.ts
│       ├── daily.ts
│       └── daily.test.ts
├── hooks/
│   ├── useExceptionRun.ts
│   ├── useExceptionRun.test.ts
│   ├── useExceptionDaily.ts
│   └── useExceptionDaily.test.ts
├── components/
│   └── exception-room/
│       ├── CapacityHeader.tsx
│       ├── QueueList.tsx
│       ├── QueueCaseCard.tsx
│       ├── CaseReview.tsx
│       ├── EvidenceList.tsx
│       ├── EvidenceItem.tsx
│       ├── DecisionButtons.tsx
│       ├── CorrectionPicker.tsx
│       ├── EscalationReason.tsx
│       ├── ResolutionReveal.tsx
│       ├── ShiftSummary.tsx
│       ├── RunDebrief.tsx
│       ├── DecisionTrace.tsx
│       ├── ShareCard.tsx
│       ├── ExceptionRunScreen.tsx
│       └── exception-room.test.tsx
└── app/
    └── exception-room/
        ├── page.tsx
        ├── play/page.tsx
        ├── daily/page.tsx
        └── about/page.tsx

docs/
├── research/2026-07-16-exception-room-research.md
├── reviews/2026-07-16-exception-room-fable-audit.md
├── reviews/2026-07-16-exception-room-fable-disposition.md
├── superpowers/specs/2026-07-16-exception-room-design.md
├── superpowers/plans/2026-07-16-exception-room.md
└── qa/exception-room-owner-acceptance.md
```

### 5.3 Existing files expected to change

- `src/app/page.tsx`: add the Exception Room Lab card after campaign launch readiness.
- `src/app/globals.css`: add game-specific tokens only after visual selection.
- `src/lib/labProfile.ts`: include Exception Room XP in the shared profile calculation.
- `src/lib/analytics.ts`: keep the shared untyped wrapper unchanged; Exception Room uses its own typed facade.
- `README.md`: add route and development notes.

Do not refactor Significant or Ship It as part of this feature unless a shared primitive is genuinely required and covered by regression tests.

## 6. Domain contracts

### 6.1 Core types

Implement the types in the approved specification with these additions:

```ts
export interface CaseResolution {
  caseId: string;
  action: ExceptionAction;
  detailId?: string;
  evidenceViewedIds: string[];
  resolvedAtTick: number;
  capacityCost: number;
  outcome: DecisionOutcome;
  learningDestination: LearningDestination;
}

export type RunEvent =
  | { type: 'case-arrived'; caseId: string; tick: number }
  | { type: 'case-opened'; caseId: string; tick: number }
  | { type: 'evidence-viewed'; caseId: string; evidenceId: string; tick: number }
  | { type: 'case-resolved'; resolution: CaseResolution }
  | { type: 'case-warning'; caseId: string; tick: number }
  | { type: 'case-breached'; caseId: string; tick: number }
  | { type: 'case-expired'; caseId: string; tick: number; reason: 'capacity-constrained' | 'shift-limit' | 'run-ended-before-arrival' }
  | { type: 'time-advanced'; fromTick: number; toTick: number }
  | { type: 'capacity-exhausted'; shift: 1 | 2 | 3; tick: number }
  | { type: 'shift-complete'; shift: 1 | 2 | 3; tick: number };

export interface ScoreBreakdown {
  safety: number;
  service: number;
  capacity: number;
  safeCompletions: number;
  unsafeApprovals: number;
  correctCorrections: number;
  justifiedEscalations: number;
  unnecessaryEscalations: number;
  serviceBreaches: number;
  unresolved: number;
  capacitySpent: number;
  profile: OperatorProfile;
}
```

### 6.2 Engine API

```ts
startExceptionRun(seed, mode, cases): ExceptionRunState
selectCase(state, caseId): EngineResult
viewEvidence(state, caseId, evidenceId): EngineResult
resolveCase(state, decision, cases): EngineResult
endShift(state, cases): EngineResult
advanceAfterResolution(state, cases): ExceptionRunState
completeShiftIfNeeded(state, cases): ExceptionRunState
availableCases(state, cases): ExceptionCase[]
scoreRun(state, cases): ScoreBreakdown
replayRun(seed, history, cases): EngineResult
```

Functions must not call `Date.now()`, `Math.random()`, browser APIs, analytics, storage, or React.

`resolveCase` is the only public transactional decision function. It records `resolvedAtTick` at the pre-advance tick, spends capacity, classifies the outcome, and invokes `advanceAfterResolution` internally exactly once. `advanceAfterResolution` may remain exported for focused unit tests, but hooks and components must not call it separately.

### 6.3 Engine invariants

- Capacity never falls below zero.
- A case enters the queue once.
- A case reaches one terminal state once.
- No terminal case remains selectable.
- Every successful resolution records an event and advances exactly one tick once. Invalid decisions advance nothing.
- Viewing evidence never advances a tick or spends capacity.
- A case emits warning and breach events at most once each.
- No case disappears at a shift boundary.
- An empty queue with a scheduled current-shift or next-shift arrival advances deterministically to that arrival.
- On shift completion, tick moves to the next shift opening tick before arrivals are admitted and capacity resets.
- A resolution is permitted at `tick == maxTick`; the post-resolution advance may cross the boundary and end the shift.
- A shift ends deterministically when no harm-avoiding authored resolution is affordable. An unsafe cheap action alone cannot keep it open.
- A player may end the shift explicitly; the transition records all remaining cases as carried or expired and is reproducible in replay.
- Every authored shift has a tested full-clear path inside its tick and capacity budgets.
- A complete run has no ambiguous case state.
- Never-arrived cases expire with an explicit terminal reason at final completion.
- Replaying the same seed and action history produces byte-equivalent serializable state.

## 7. User stories and product acceptance

### US-01: Understand the premise quickly

**As a portfolio visitor, I want to understand the game and its time commitment before starting, so I can decide whether to play.**

Acceptance criteria:

- Given the start route, when the page loads, then the first viewport states the premise, four to six minute duration, and synthetic-case boundary.
- Given a returning player, when practice is already complete, then campaign start remains one primary action and practice becomes optional.
- Given storage is unavailable, when the page loads, then the campaign remains playable and the persistence limitation is communicated only when relevant.
- Campaign, Daily, About, and sound controls have accessible names and visible focus.

### US-02: Learn without risking the run

**As a first-time player, I want a short guided practice, so I can learn the queue and action model before scoring begins.**

Acceptance criteria:

- Practice is optional and never changes campaign scores.
- Three guided micro-cases demonstrate route reason, consequence, evidence, and one of Approve, Correct, or Escalate each.
- The reveal explains why confidence alone was insufficient.
- Completing practice persists locally when storage is available.
- Skipping practice requires no confirmation trap and does not reduce XP.

### US-03: Choose what deserves attention

**As the reviewer, I want to select any available case, so priority is a decision rather than a forced sequence.**

Acceptance criteria:

- The queue shows three to five active cases at the intended campaign points.
- Every card shows consequence tier, due state, age, and route reason without revealing the preferred action.
- Default order is arrival order.
- Sort controls introduced after shift one can order by consequence or due state and clearly announce the current sort.
- Selecting a case preserves queue state and moves focus to the review heading.
- Returning to the queue restores focus to the originating card.

### US-04: Inspect the evidence

**As the reviewer, I want to compare relevant evidence, so I can challenge the recommendation.**

Acceptance criteria:

- Each case exposes two to four evidence items.
- Evidence identifies source type, relative recency, and support, conflict, missing, or context state without relying on color alone.
- The AI recommendation remains distinguishable from authoritative source material.
- Opening evidence logs an aggregate local event and permitted analytics event without sending evidence text.
- Required evidence is never hidden behind hover, swipe, or sound.

### US-05: Take a bounded action

**As the reviewer, I want to approve, correct, or escalate, so I can move the case to a known state.**

Acceptance criteria:

- Actions are semantic buttons with concise descriptions.
- Correct opens a bounded authored correction picker when needed.
- Escalate requires one authored reason and shows the destination role.
- No action can spend more capacity than remains. If insufficient capacity exists, the action is disabled with a visible explanation.
- Resolving a case records action, evidence viewed, tick, cost, outcome class, and learning destination.
- Double activation cannot resolve a case twice.

### US-06: Experience queue pressure accessibly

**As the reviewer, I want cases to age while I work, so I can understand service tradeoffs without a reaction-speed test.**

Acceptance criteria:

- Each resolution advances one operational tick.
- Pending cases move to warning one tick before due and breach after due.
- Warning and breach use text, icon, and accessible announcements.
- New cases arrive at authored ticks and appear without stealing focus.
- No required countdown exists in campaign or daily v1.
- A player can pause indefinitely without penalty.
- A player can end a shift without resolving another case and receives the resulting backlog and service consequences.

### US-07: See the consequence of a decision

**As the reviewer, I want an immediate explanation after acting, so I can understand the evidence and tradeoff.**

Acceptance criteria:

- Reveal distinguishes preferred, acceptable, unsafe, and unnecessary outcomes.
- Acceptable alternatives explain the tradeoff without marking the player simply wrong.
- Reveal names the evidence that mattered and the downstream consequence.
- Reveal states whether the signal changes a rule, evaluation set, workflow, policy, or nothing.
- Motion and sound are enhancements. Equivalent text is always present.

### US-08: Understand the whole run

**As a player, I want a transparent debrief, so I can inspect how my decisions shaped the queue.**

Acceptance criteria:

- Debrief shows Safety, Service, Capacity, and all required raw metrics.
- A descriptive profile follows published precedence rules.
- A decision trace lists every case, action, outcome, tick, and relevant evidence without exposing hidden source text by default.
- Debrief identifies two strong decisions and one improvement opportunity using deterministic templates.
- Repeated exception classes surface as a product or workflow signal.
- The about page links from the debrief.

### US-09: Replay and compare

**As a returning player, I want a deterministic replay and daily run, so I can test another strategy and share a stable result.**

Acceptance criteria:

- Campaign replay can reuse the same seed or start a new seeded variant.
- Daily mode uses a local-date seed and the same authored content contract.
- Daily rollover handles midnight without requiring a hard refresh.
- An active daily run pins its date and seed at start. Midnight rollover changes only the next run's availability and countdown.
- Share text includes product name, profile, three score dimensions, and canonical route.
- Clipboard failure reveals selectable text.
- No leaderboard or claim of professional ranking appears.

### US-10: Use the product with different access needs

**As a player with motor, visual, cognitive, or motion sensitivity needs, I want an equivalent core experience.**

Acceptance criteria:

- The full campaign completes with keyboard only.
- Screen reader focus and live-region behavior pass the owner acceptance checklist.
- At 320 CSS pixels and 200 percent zoom, no core action requires horizontal scrolling.
- Reduced motion removes shake, travel, count-up, and confetti.
- Sound can be disabled before play and persists when storage is available.
- No outcome is conveyed only by color, icon, motion, sound, or haptics.

### US-11: Inspect the product thinking

**As a recruiter or practitioner, I want an about page, so I can understand the research, model, limitations, and implementation choices.**

Acceptance criteria:

- About page explains the seven-part Exception Queue Contract.
- It cites the research brief's primary sources.
- It publishes scoring formulas and profile precedence.
- It states that cases are synthetic and the game is not professional assessment or regulated advice.
- It explains why the default pressure is turn based.
- It explains that Capacity abstracts reviewer effort while evidence inspection is free by accessibility choice, and that Capacity is not a utilization target.
- It links to the article and portfolio project after those routes are approved and live.

### US-12: Measure product use without collecting sensitive content

**As the product owner, I want privacy-bounded analytics, so I can improve completion and comprehension.**

Acceptance criteria:

- Only approved event names and properties can compile.
- No event includes evidence text, case copy, free text, or stable personal identifier.
- Analytics failure never blocks gameplay.
- Completion, duration band, about-page open, replay, and aggregate action patterns are measurable.
- Public claims are withheld until sample size, methodology, and limitations are documented.

## 8. Implementation stages

## Stage 0: Audit, branch, and visual gate

### ER-000: Establish the clean implementation boundary

**Purpose:** Prevent plan work, current pm-lab changes, and portfolio publication work from colliding.

- [ ] Confirm `main` is current and record the baseline commit.
- [ ] Inspect `git status` and preserve all owner changes.
- [ ] Create a fresh `codex/exception-room-*` branch or isolated worktree from the verified baseline.
- [ ] Record the separate portfolio branch needed only for article and project integration.
- [ ] Add a short implementation handoff naming both repository boundaries.

Exit criteria:

- Clean implementation branch exists.
- No unrelated changes are staged or modified.
- Baseline `npm test`, `npm run lint`, and `npm run build` results are recorded.

### ER-001: Read framework and existing-pattern contracts

- [ ] Read the relevant Next.js 16 App Router documentation under `node_modules/next/dist/docs/` before page work.
- [ ] Inspect Significant and Ship It engine, state, daily, analytics, sound, reduced-motion, and Lab-card patterns.
- [ ] Document components that will be reused and patterns that must remain isolated.
- [ ] Confirm no new dependency is required.

Exit criteria:

- Reuse map is attached to the implementation handoff.
- Any necessary shared refactor has a separate test-backed task and explicit rationale.

### ER-002: Complete the three-option visual ideation gate

**Dependency:** Approved product spec.  
**Hard boundary:** No UI scaffolding before selection.

- [ ] Generate exactly three visually distinct queue and case-review directions.
- [ ] Use deep teal as the identity lead and treat amber as a restrained accent unless Alvin selects a measured alternative; do not claim shared `--color-gold` is distinct.
- [ ] Show queue, selected case, evidence, action placement, capacity, warning, and mobile crop in every direction.
- [ ] Keep the shared Lab shell and game-specific identity visible.
- [ ] Evaluate each option against scan speed, evidence clarity, thumb reach, accessibility, and recruiter comprehension.
- [ ] Receive Alvin's explicit selection.
- [ ] Save the selected visual as the implementation target and record rejected directions.

Exit criteria:

- One visual direction is owner approved.
- Token, type, spacing, icon, and motion decisions are measurable from the selected target.

### ER-003: Prepare research and usability instruments

- [ ] Convert the learning hypotheses into a five-participant moderated script.
- [ ] Write pre-run questions, observation prompts, post-run comprehension questions, and neutral follow-ups.
- [ ] Define success as four of five participants naming two priority factors beyond confidence and one escalation cost.
- [ ] Define failure and revision rules before testing.
- [ ] Create a consent-safe note template that records no sensitive participant data.

Exit criteria:

- Protocol can be run without improvising leading questions.
- Findings template distinguishes observation, quote, interpretation, and design decision.

## Stage 1: Domain model and deterministic engine

### ER-101: Add domain types

**Files:**

- Create `src/lib/exception-room/types.ts`.

- [ ] Add all enums and interfaces from the specification.
- [ ] Represent authored cases with `shift` and `dueOffsetTicks`, and derive scheduled `arrivesAtTick` and `dueAtTick` values at run start.
- [ ] Add a total `outcomeByAction` mapping for Approve, Correct, and Escalate plus typed detail overrides for authored correction and escalation choices.
- [ ] Use discriminated unions for run events and decision outcomes.
- [ ] Use readonly arrays where authored content should not mutate.
- [ ] Define one `CASE_LIMITS` constant for text and evidence limits.
- [ ] Export no UI colors or React-facing props from domain types.

Acceptance:

- TypeScript rejects an unknown action, route reason, evidence status, consequence tier, or run event.
- No `any` appears.
- File imports only zero-layer types or nothing.

### ER-102: Build a minimal case fixture set

**Files:**

- Create `src/lib/exception-room/cases.ts`.
- Create `src/lib/exception-room/cases.test.ts`.

- [ ] Author three fixtures: clean approval, bounded correction, justified escalation.
- [ ] Add a runtime test helper that validates IDs, text limits, evidence references, actions, and costs.
- [ ] Keep all names and records synthetic.
- [ ] Add one acceptable alternative to verify non-binary scoring.
- [ ] Prove every fixture maps all three actions and every offered detail choice to exactly one outcome and aligns with its preferred and acceptable actions.

Acceptance:

- Every required evidence ID resolves.
- Preferred action is valid and absent from `acceptableActions`.
- Action costs are positive integers and at least one action is affordable at fixture start.
- No fixture contains company names, customer data, or regulated advice.

### ER-103: Implement run creation and queue arrivals

**Files:**

- Create `src/lib/exception-room/engine.ts`.
- Create `src/lib/exception-room/engine.test.ts`.

- [ ] Write failing tests for deterministic start, scheduled arrivals, default order, and initial capacity.
- [ ] Implement `startExceptionRun` and `availableCases`.
- [ ] Deterministically permute each shift's cases across authored arrival slots through the existing PRNG.
- [ ] Compute each scheduled deadline as `arrivesAtTick + dueOffsetTicks`.

Acceptance:

- Same seed and case set produce identical initial state.
- Cases scheduled later do not appear early.
- Adjacent seeds may change per-shift arrival order without producing a deadline before arrival.
- Initial event history contains each admitted case once.

### ER-104: Implement selection and evidence inspection

- [ ] Write failing tests for valid selection, invalid selection, terminal-case rejection, evidence view deduplication, and no-tick evidence behavior.
- [ ] Implement `selectCase` and `viewEvidence`.
- [ ] Record events without mutating prior state.

Acceptance:

- Opening evidence spends no capacity and advances no tick.
- Reopening the same evidence does not duplicate `evidenceViewedIds`.
- Invalid IDs return a typed failure result or unchanged state according to one documented convention.

### ER-105: Implement resolution and capacity

- [ ] Write failing tests for approve, correct, escalate, acceptable action, insufficient capacity, double resolution, and action cost.
- [ ] Implement `resolveCase` as the sole public decision transaction.
- [ ] Require correction and escalation detail when the authored case requires it.
- [ ] Record `resolvedAtTick` before invoking one internal post-resolution advance.
- [ ] Emit a complete resolution record.

Acceptance:

- Capacity cannot go negative.
- Unsafe approval remains representable and does not crash the run.
- Invalid decisions do not partially mutate state.
- Every successful decision produces one terminal case state and one resolution event.
- Hooks and components cannot advance the same resolution a second time.

### ER-106: Implement aging, warning, breach, and shifts

- [ ] Write failing tests for age progression, one-time warning, one-time breach, late arrival, shift completion, carryover, capacity exhaustion, and final completion.
- [ ] Add an explicit `endShift` transition that records the player input and terminal state of every remaining case.
- [ ] Implement `advanceAfterResolution` and `completeShiftIfNeeded`.
- [ ] Make shift rules data-driven rather than embedded in components.
- [ ] Set Shift 3 starting capacity to 12.
- [ ] On shift completion, set the global tick to the next opening tick, reset capacity, then admit arrivals.
- [ ] Permit a resolution at `tick == maxTick`; end the shift only after the post-resolution tick crosses the maximum.
- [ ] End a capacity-constrained shift when no harm-avoiding authored resolution is affordable, even if a cheap unsafe action remains.
- [ ] Expire never-arrived final cases with an explicit reason.

Acceptance:

- Cases warn and breach on the specified ticks.
- New arrivals do not erase selection or history.
- Carryover cases preserve age and evidence state.
- Final state accounts for every authored case as resolved, escalated, or explicitly expired. No unresolved terminal state remains.
- The preferred policy clears each shift within its tick and capacity budgets.
- Ending a shift early cannot erase, hide, or silently resolve queued work.

### ER-107: Implement deterministic replay

- [ ] Add `replayRun(seed, history, cases)`.
- [ ] Test full campaign histories, acceptable alternatives, and invalid history rejection.
- [ ] Include seed in a non-prominent debug data attribute at the UI layer later.

Acceptance:

- Replay state matches original serializable state.
- Invalid or impossible histories fail safely with a typed error and no partial replay.

## Stage 2: Scoring, review, and content invariants

### ER-201: Implement transparent score calculations

**Files:**

- Create `src/lib/exception-room/scoring.ts`.
- Create `src/lib/exception-room/scoring.test.ts`.

- [ ] Implement consequence weights, Safety, Service, Capacity, and raw metrics.
- [ ] Credit Safety for every harm-avoiding outcome, including cautious unnecessary escalation, and zero only for unsafe outcomes.
- [ ] Calculate safe resolution value as `min(actualActionCost, preferredActionCost)` for preferred and acceptable resolutions, with zero value for unsafe or unnecessary resolutions.
- [ ] Add boundary tests for zero arrivals, zero capacity spent, all safe, all unsafe, all escalated, and unresolved cases.
- [ ] Add monotonicity tests.
- [ ] Add a resolve-only-cheap policy test that produces high Capacity but Backlog Bound and sub-80 Safety or Service.

Acceptance:

- Scores always fall from 0 through 100.
- Replacing a safe decision with an otherwise identical unsafe decision never increases Safety.
- Turning an on-time resolution into a breach never increases Service.
- Replacing an unnecessary escalation with a safe lower-cost action never decreases Capacity.
- Safe resolution value never exceeds capacity spent, and zero capacity spent returns zero Capacity.
- One critical unsafe approval prevents Balanced Operator regardless of other scores.

### ER-202: Implement profile precedence

- [ ] Encode first-match precedence as Balanced Operator, Speed Over Evidence, Escalation Heavy, Backlog Bound, Safety First, then Calibration in Progress.
- [ ] Define escalation baseline as the preferred-policy escalation count for the active seed.
- [ ] Test every profile and overlapping condition.
- [ ] Keep profile labels descriptive and non-evaluative.

Acceptance:

- Balanced Operator, Safety First, Speed Over Evidence, Escalation Heavy, Backlog Bound, and Calibration in Progress are each reachable.
- Rule order is documented on the about page and in tests.
- Overlap tests prove the first-match result and the seed-specific escalation baseline.
- No profile claims professional competence.

### ER-203: Build deterministic debrief copy

**Files:**

- Create `src/lib/exception-room/review.ts`.
- Create `src/lib/exception-room/review.test.ts`.

- [ ] Generate two strengths, one improvement opportunity, and one repeated-system signal.
- [ ] Use authored templates keyed to actual run facts.
- [ ] Never generate praise for an unsafe high or critical approval.
- [ ] Keep all public copy short enough for mobile cards.

Acceptance:

- Same run produces identical debrief copy.
- Every template is reachable in simulation.
- No empty or contradictory debrief appears.
- Copy distinguishes decision quality from person quality.

### ER-204: Author the twelve-case campaign

- [ ] Expand fixtures into twelve reviewed cases.
- [ ] Satisfy every taxonomy and distribution rule in the specification.
- [ ] Create three shift definitions with capacity, max tick, arrival schedule, and learning emphasis.
- [ ] Add at least two acceptable alternatives.
- [ ] Add two clean approvals to prevent reflexive distrust.
- [ ] Add a repeated exception class that surfaces in the debrief.
- [ ] Make every pre-evidence surface-cue signature at admission appear in at least two cases with different preferred actions.
- [ ] Validate the total `outcomeByAction` mapping for every action on every case.

Acceptance:

- Content-invariant suite proves all required distributions.
- Every case can be resolved under at least one reachable campaign state.
- Every case rationale names the evidence and consequence.
- Independent editorial review finds no real-company leakage or regulated advice.
- Queue-visible cues alone cannot deterministically identify the preferred action.

### ER-205: Run simulation and balance checks

- [ ] Simulate at least 1,000 seeds under preferred, approve-only, escalate-only, correction-heavy, earliest-due, highest-consequence, and random policies.
- [ ] Add queue-visible-cue-only, zero-evidence, and resolve-only-cheap policies.
- [ ] Record score distributions, profile reachability, completion ticks, and capacity exhaustion.
- [ ] Adjust case costs and shift capacity only through named configuration.
- [ ] Save a balance report in `docs/qa/`.

Acceptance:

- Preferred policy can reach Balanced Operator.
- Approve-only and escalate-only cannot reach Balanced Operator.
- Queue-visible-cue-only and zero-evidence policies cannot reach Balanced Operator across the launch case set.
- No authored case is unreachable.
- No policy causes an engine error or ambiguous terminal state.
- Median preferred-policy run remains compatible with the four to six minute experience target in manual testing.

### ER-206: Author the guided practice

- [ ] Author three short, unscored synthetic micro-cases, one each for Approve, Correct, and Escalate.
- [ ] Reuse the campaign domain contract and content limits.
- [ ] Keep practice outcomes out of campaign scores, profiles, XP, and analytics beyond completion or skip.
- [ ] Explain once why confidence alone is insufficient.

Acceptance:

- Each action is demonstrated exactly once.
- Practice can be skipped without confirmation or penalty.
- Practice content passes the same evidence-reference, outcome-mapping, privacy, and text-limit invariants as campaign content.

## Stage 3: Persistence, hooks, and analytics boundaries

### ER-301: Implement local state and safe parsing

**Files:**

- Create `src/lib/exception-room/state.ts`.
- Create `src/lib/exception-room/state.test.ts`.

- [ ] Define storage key `pmlab:exception-room:v1`.
- [ ] Use the `pmlab:exception-room:v1` key suffix as the v1 schema boundary.
- [ ] Store practice completion, campaign completion, campaign reward state, best profile, sound preference, daily history, streak, and earned XP.
- [ ] Reuse the existing safe-storage and in-memory fallback pattern without adding an unused stored schema-version field or migration framework.
- [ ] Add parse, default, partial-payload, corrupt-payload, and unavailable-storage tests.
- [ ] Do not persist full case evidence or analytics history.

Acceptance:

- Corrupt or unknown state falls back without blocking play.
- Denied storage keeps in-session state in memory.
- Saving never throws into the UI.
- State contains no evidence copy, user content, or identifier.

### ER-302: Integrate shared Lab profile

**Files:**

- Modify `src/lib/labProfile.ts`.
- Update its tests.

- [ ] Add Exception Room XP to the existing profile calculation.
- [ ] Preserve Significant and Ship It totals.
- [ ] Grant 200 XP once for the first campaign completion and 50 XP once per completed local-date daily run.
- [ ] Store a campaign reward flag and guard daily XP with `lastDailyDate` before addition.

Acceptance:

- Existing profile tests remain green.
- A player with earlier Lab progress sees it preserved.
- Exception Room cannot double-count the same one-time reward.
- A same-date daily completion cannot grant a second 50 XP reward.

### ER-303: Build the campaign hook

**Files:**

- Create `src/hooks/useExceptionRun.ts`.
- Create `src/hooks/useExceptionRun.test.ts`.

- [ ] Wrap pure engine transitions in a reducer or equivalent state machine.
- [ ] Expose start, practice, select, view evidence, decide, continue, restart same seed, and restart new seed.
- [ ] Keep analytics and persistence effects outside reducer logic.
- [ ] Guard against rapid double-submit and stale selected-case state.

Acceptance:

- Hook tests cover the full practice and campaign lifecycle.
- A successful decision emits one analytics request and one persistence write.
- Engine errors produce a recoverable UI state without losing the original seed.

### ER-304: Add a typed Exception Room analytics facade

**Files:**

- Create `src/lib/exception-room/analytics.ts`.
- Create `src/lib/exception-room/analytics.test.ts`.
- Leave the existing shared `src/lib/analytics.ts` signature and its Significant and Ship It callers unchanged.

- [ ] Add `trackException(event: ExceptionAnalyticsEvent)` over the existing untyped `track` wrapper.
- [ ] Narrow permitted events and property unions through a discriminated union.
- [ ] Prohibit raw case text and evidence through types and code review.
- [ ] Bucket duration and scores rather than sending unnecessary precision.
- [ ] Confirm analytics exceptions are swallowed by the wrapper.

Acceptance:

- An unsupported event or property fails TypeScript.
- Existing Significant and Ship It analytics call sites require no changes.
- Gameplay behaves identically with analytics disabled or throwing.
- Network inspection during QA shows no case or evidence copy in payloads.

## Stage 4: Campaign presentation

**Dependency:** ER-002 visual selection and Stage 1 engine completion.

### ER-401: Add game tokens from the selected visual

**Files:**

- Modify `src/app/globals.css`.

- [ ] Measure and add only the approved deep teal identity, restrained amber accent, surface, focus, and status tokens.
- [ ] Preserve existing game tokens and avoid generic overrides.
- [ ] Document contrast pairs.
- [ ] Add reduced-motion styles or component behavior as required.

Acceptance:

- Significant and Ship It screenshots remain visually unchanged.
- All approved text and control pairs meet WCAG AA.
- Tokens use the shared 8-point spacing and radius discipline.

### ER-402: Build the start route

**Files:**

- Create `src/app/exception-room/page.tsx`.

- [ ] Read the applicable App Router page and metadata documentation first.
- [ ] Implement premise, duration, synthetic boundary, campaign, daily, sound, and about actions.
- [ ] Reuse Lab shell and GameCard patterns where appropriate.
- [ ] Add route metadata and canonical path.

Acceptance:

- First viewport communicates premise and time without scrolling at 390 by 844.
- Campaign is the primary action.
- Daily can display a clear coming-soon state until Stage 6 without a dead link.
- Page has a single H1, logical headings, and no hydration mismatch.

### ER-403: Build the capacity header and queue list

**Files:**

- Create `CapacityHeader.tsx`, `QueueList.tsx`, and `QueueCaseCard.tsx`.

- [ ] Render shift, capacity, tick, visible queue count, and warning summary.
- [ ] Add a clearly secondary end-shift control with a concise unresolved-work consequence preview.
- [ ] Render arrival-order cards with approved information hierarchy.
- [ ] Add consequence and due-state text alternatives.
- [ ] Add sort control after shift one.
- [ ] Keep list semantics and keyboard order logical.

Acceptance:

- Three to five cases scan without horizontal scrolling.
- New arrival announcement does not steal focus.
- Selected, warning, breached, and terminal styles remain distinct in grayscale.
- Queue list does not calculate priority or scores itself.

### ER-404: Build case review and evidence

**Files:**

- Create `CaseReview.tsx`, `EvidenceList.tsx`, and `EvidenceItem.tsx`.

- [ ] Show recommendation, confidence band, route reason, consequence, reversibility, and due state.
- [ ] Visually separate model output from evidence.
- [ ] Implement progressive evidence disclosure.
- [ ] Preserve an always-visible return-to-queue action.
- [ ] Manage focus on open and close.

Acceptance:

- Required case information appears without a fake enterprise dashboard.
- Evidence states are understandable without color.
- All evidence controls are buttons with expanded state.
- Returning to queue restores focus and state.

### ER-405: Build decision controls

**Files:**

- Create `DecisionButtons.tsx`, `CorrectionPicker.tsx`, and `EscalationReason.tsx`.

- [ ] Keep Approve, Correct, and Escalate within thumb reach.
- [ ] Show capacity cost before commitment.
- [ ] Implement bounded correction and escalation flows.
- [ ] Add confirmation only where a consequential unsafe action would otherwise be accidental. Do not confirm every action.
- [ ] Prevent submission while state is transitioning.

Acceptance:

- Every action is possible with keyboard and pointer.
- Disabled actions explain insufficient capacity through visible text and programmatic description.
- Modal or drawer patterns have focus containment and return.
- Correction and escalation details are authored, not free text.

### ER-406: Build resolution reveal and shift summary

**Files:**

- Create `ResolutionReveal.tsx` and `ShiftSummary.tsx`.

- [ ] Reveal outcome class, evidence, consequence, learning destination, and queue effect.
- [ ] Keep case feedback concise enough to return to the queue quickly.
- [ ] Summarize shift state without exposing final hidden profile early.
- [ ] Use restrained feedback motion and static reduced-motion equivalents.

Acceptance:

- Acceptable alternatives never receive generic incorrect copy.
- Unsafe outcomes explain the mechanism without shame language.
- Shift summary accounts for resolved, escalated, breached, and carried cases.
- Continue action returns focus to the next logical queue element.

### ER-407: Compose the campaign route

**Files:**

- Create `ExceptionRunScreen.tsx`.
- Create `src/app/exception-room/play/page.tsx`.

- [ ] Keep page thin and client state inside the run component and hook.
- [ ] Support practice, queue, case review, reveal, shift summary, debrief, and recoverable error states.
- [ ] Avoid blank loading screens after hydration.
- [ ] Add seed as an unobtrusive data attribute for reproducibility.

Acceptance:

- A fresh visitor can complete practice and campaign without route changes.
- Refresh behavior is documented and consistent. MVP may restart the current run if mid-run persistence is intentionally excluded.
- No unreachable UI state exists for a valid engine state.

## Stage 5: Debrief, accessibility, and experience quality

### ER-501: Build the transparent debrief

**Files:**

- Create `RunDebrief.tsx`, `DecisionTrace.tsx`, and `ShareCard.tsx`.

- [ ] Render three scores, raw metrics, profile, deterministic strengths, improvement, and repeated signal.
- [ ] Make scoring formula accessible through a direct about-page link.
- [ ] Add collapsible decision trace.
- [ ] Add replay same seed and new seed controls.
- [ ] If all three scores are high while evidence inspection is near zero, show a neutral replay prompt that asks the player to verify the evidence rather than granting extra praise.

Acceptance:

- Debrief values match direct engine output in component tests.
- Decision trace contains every resolved case exactly once.
- Profile wording matches the specification.
- No single total score appears as the primary result.

### ER-502: Implement focus and announcement model

- [ ] Document focus destinations for route entry, case open, evidence disclosure, action detail, reveal, shift summary, and debrief.
- [ ] Use minimal live regions for arrival, capacity, warning, breach, and resolution.
- [ ] Prevent duplicate announcements during animation.
- [ ] Test keyboard order and escape behavior.

Acceptance:

- Full campaign completes keyboard only without lost focus.
- Screen reader users receive state changes without reading the entire queue repeatedly.
- No keyboard trap or focus jump appears.

### ER-503: Add sound, haptics, and motion through shared primitives

- [ ] Reuse `sound.ts`, `haptics.ts`, `PressButton`, and existing motion patterns.
- [ ] Add only game-specific cues that communicate no unique information.
- [ ] Reserve confetti for campaign completion.
- [ ] Honor global and game sound preferences.
- [ ] Honor `prefers-reduced-motion` for every animation.

Acceptance:

- Sound-off and reduced-motion states pass component and manual tests.
- No motion blocks interaction.
- Haptic API absence causes no error.
- Repeated queue interactions remain responsive on a representative mobile device.

### ER-504: Complete responsive and visual fidelity pass

- [ ] Compare the selected visual target and rendered implementation at identical 390 by 844 and 1440 by 1000 viewports.
- [ ] Correct spacing, type, radius, borders, focus, cropping, and action placement.
- [ ] Verify 320 CSS pixels and 200 percent zoom.
- [ ] Verify long authored content and worst-case queue states.

Acceptance:

- Core actions remain visible or reachable without overlap.
- No horizontal overflow.
- The desktop view preserves the mobile-sized canvas.
- Side-by-side evidence shows the approved direction was implemented faithfully.

## Stage 6: Daily mode, persistence, and share loop

### ER-601: Implement daily seed and rollover

**Files:**

- Create `src/lib/exception-room/daily.ts` and tests.
- Create `src/hooks/useExceptionDaily.ts` and tests.

- [ ] Derive local-date seed through existing date and PRNG utilities.
- [ ] Prevent same-day replay from overwriting the completed daily result.
- [ ] Handle midnight rollover through a live date check.
- [ ] Pin the date and seed when a daily run starts. A rollover updates only the next available run and countdown until the active run completes.
- [ ] Guard the 50 XP daily reward with `lastDailyDate` before adding it.
- [ ] Reuse streak and shield semantics only if compatible with existing Lab policy.

Acceptance:

- Same local date produces same run.
- Adjacent dates produce distinct deterministic seeds.
- Midnight rollover updates without hard refresh.
- A run started before midnight completes under its pinned date and seed without reset or reseed.
- Denied storage keeps daily playable while disabling persistence honestly.

### ER-602: Build daily route

**Files:**

- Create `src/app/exception-room/daily/page.tsx`.

- [ ] Reuse campaign components with daily mode configuration.
- [ ] Show completed state and next-run timing without guilt copy.
- [ ] Keep the same accessibility and scoring transparency.

Acceptance:

- Campaign and daily share engine and presentation primitives.
- A completed daily cannot be silently replayed as a new score.
- Countdown is informational and not required for action.

### ER-603: Implement share fallback

- [ ] Define exact share text and canonical route.
- [ ] Include profile and three dimensions, not a professional rank.
- [ ] Use Clipboard API through a safe helper.
- [ ] Provide selectable text fallback.

Acceptance:

- Share output is deterministic for a result.
- Clipboard rejection shows fallback without data loss.
- Shared text contains no case details or identifiers.

## Stage 7: About page and portfolio pair integration

### ER-701: Build the about page

**Files:**

- Create `src/app/exception-room/about/page.tsx`.

- [ ] Explain problem, seven-part contract, core loop, case taxonomy, scoring, research, accessibility, analytics, and limitations.
- [ ] Cite NIST, EU AI Act, Nature meta-analysis, Microsoft guidelines, WCAG, and serious-game research.
- [ ] State synthetic, no-assessment, and no-advice boundaries.
- [ ] Explain that Capacity abstracts reviewer effort, evidence inspection is free by accessibility choice, and Capacity is not a utilization target.
- [ ] Add article link only after its approved public route exists.

Acceptance:

- Sources open correctly and are refreshed before release.
- Scoring formulas and profile precedence match code.
- The page distinguishes sourced findings, product interpretation, and proposed design.
- Page remains readable on the mobile canvas.

### ER-702: Add Exception Room to the Lab home

**Files:**

- Modify `src/app/page.tsx`.

- [ ] Add game card with approved artwork, description, duration, and status.
- [ ] Preserve existing card order and shell behavior according to owner direction.
- [ ] Verify cross-game profile visibility.

Acceptance:

- Existing game cards do not regress.
- Exception Room route, metadata, and card imagery work locally and on preview.
- Card does not claim measured impact before evidence exists.

### ER-703: Create the portfolio project record

**Repository boundary:** Switch to a separate approved branch in `/Users/Alvin/Al the Builder/portfolio`.

- [ ] Create a project entry with truthful role, year, summary, capabilities, external URL, screenshots, and alt text.
- [ ] Link to the application and the approved article.
- [ ] Write the case study around decision, mechanism, testing, and limitations.
- [ ] Add outcome metrics only after analytics or user research meets the evidence standard.
- [ ] Run portfolio content validation and preview QA.

Acceptance:

- No fabricated users, retention, interviews, or business impact.
- No TRA data or internal workflow detail.
- Portfolio route and external game URL both work.
- Publication remains owner gated.

### ER-704: Complete the article and application cross-link

- [ ] Approve and publish The Exception Queue Is the Product through the portfolio editorial gate.
- [ ] Add the live application link to the article after deployment verification.
- [ ] Add the live article link to the about page.
- [ ] Verify canonical routes, related content, sitemap, and card images.

Acceptance:

- No link points to a preview-only or missing route.
- Publication dates remain truthful.
- Both surfaces explain their relationship without duplicated copy.

## Stage 8: Verification, usability, and release

### ER-801: Run the automated gate

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run any route-specific accessibility or component tests.
- [ ] Record command, date, commit, and result in the QA document.

Acceptance:

- All commands exit zero.
- Existing Significant and Ship It suites remain green.
- No warning is dismissed without a written disposition.

### ER-802: Run engine falsification checks

- [ ] Replay recorded campaign histories.
- [ ] Run 1,000-seed policy simulation.
- [ ] Attempt negative capacity, duplicate resolution, invalid IDs, impossible corrections, late arrivals, breach duplication, and corrupted history.
- [ ] Attempt a resolution at `tick == maxTick`, a cross-shift empty queue, a never-arrived final case, and a cheap unsafe action after all harm-avoiding actions become unaffordable.
- [ ] Confirm score monotonicity and profile precedence.

Acceptance:

- No invariant breaks.
- Every failure mode returns a typed, tested result.
- Balance report matches the release case set.

### ER-803: Conduct accessibility QA

- [ ] Keyboard-only campaign.
- [ ] VoiceOver spot check on start, queue, review, reveal, and debrief.
- [ ] Reduced motion and sound-off campaign.
- [ ] 200 percent zoom and 320 CSS pixel reflow.
- [ ] Contrast and focus inspection.
- [ ] Touch target inspection.

Acceptance:

- No critical or serious accessibility blocker remains.
- Any accepted minor limitation is documented with owner decision and follow-up issue.

### ER-804: Conduct five moderated usability sessions

- [ ] Recruit five representative participants, ideally including recruiters, PMs, or operations practitioners.
- [ ] Use the prewritten neutral protocol.
- [ ] Record completion, confusion, evidence usage, priority reasoning, escalation reasoning, and post-run comprehension.
- [ ] Synthesize patterns after all sessions rather than redesigning after each individual.
- [ ] Separate observed facts from interpretation.

Acceptance:

- At least four of five name two priority inputs beyond confidence and one escalation cost, or the product returns to design revision.
- Every material usability issue has a decision: fix now, defer with rationale, or reject.
- No public metric is claimed from five tests as generalizable proof.

### ER-805: Run visual and browser QA

**Approval gate:** Obtain owner approval before browser-driven local QA.

- [ ] Verify 390 by 844 and 1440 by 1000 against the selected visual target.
- [ ] Verify iOS Safari, Android Chrome, and desktop Chromium or Safari.
- [ ] Test refresh, offline after load, denied storage, denied clipboard, analytics failure, and midnight rollover.
- [ ] Capture start, queue, case, reveal, debrief, about, and failure-state evidence.

Acceptance:

- No layout, state, interaction, or content blocker remains.
- Evidence set includes the real rendered product, not code-only claims.

### ER-806: Verify performance and privacy

- [ ] Run Lighthouse on start and play routes with production build.
- [ ] Confirm all four categories meet the approved threshold, with performance, accessibility, best practices, and SEO at least 95.
- [ ] Inspect network requests and analytics payloads.
- [ ] Confirm no network call is required during a run after load.
- [ ] Confirm no case or evidence copy leaves the browser.

Acceptance:

- CLS remains below 0.1.
- No sensitive or prohibited analytics property appears.
- Performance exceptions require an owner-approved disposition.

### ER-807: Deploy preview and run owner acceptance

**Authorization gate:** Deployment requires explicit owner direction.

- [ ] Deploy an isolated preview.
- [ ] Verify routes, metadata, assets, analytics, and mobile behavior on the preview URL.
- [ ] Complete `docs/qa/exception-room-owner-acceptance.md`.
- [ ] Present known limitations and deferred work.
- [ ] Receive explicit owner acceptance before production or portfolio publication.

Acceptance:

- Preview matches the verified commit.
- Owner acceptance is recorded.
- Rollback path is known.

### ER-808: Production release and post-release observation

**Authorization gate:** Production release requires explicit owner direction.

- [ ] Release the approved commit.
- [ ] Verify live routes, metadata, mobile layout, analytics, article link, project link, and Lab home card.
- [ ] Observe errors and aggregate funnel data for an agreed window.
- [ ] Record defects and outcome evidence without retroactively changing success criteria.

Acceptance:

- Live route is healthy and reversible.
- No critical error, privacy issue, or broken cross-link remains.
- Public copy distinguishes hypotheses from observed results.

## 9. Test matrix

| Area | Required evidence |
| --- | --- |
| Domain types | Typecheck rejects invalid actions and events |
| Content | Twelve cases pass IDs, limits, evidence, distribution, and reachability |
| Determinism | Same seed and history reproduce state and debrief |
| Queue | Arrival, order, selection, aging, warning, breach, carryover |
| Decisions | Preferred, acceptable, unsafe, unnecessary, insufficient capacity, double submit |
| Scoring | Boundaries, monotonicity, critical unsafe guard, profile precedence |
| Persistence | Default, partial payload, save, corrupt, denied, pinned daily rollover |
| Analytics | Typed allowlist, failure isolation, no case or evidence payload |
| Accessibility | Keyboard, focus, live regions, 200 percent zoom, reduced motion, sound off |
| Responsive | 320 CSS pixels, 390 by 844, 1440 by 1000 |
| Reliability | Offline after load, denied clipboard, missing sound and haptic APIs |
| Regression | Significant and Ship It unit, build, and visible shell checks |
| Publication | Live app, about, article, project, metadata, sitemap, and cross-links |

## 10. Observability and analytics interpretation

### Funnel

```text
exception_room_view
  -> game_start
    -> practice_complete or practice_skip
      -> shift_1_complete
        -> shift_2_complete
          -> run_complete
            -> replay, daily, about_opened, or share_clicked
```

### Diagnostic questions

- If start is high and shift-one completion is low, inspect onboarding, information density, and first-case difficulty.
- If evidence opens are near zero and unsafe approvals are high, inspect evidence discoverability before blaming player judgment.
- If escalation dominates, inspect action framing, authority clarity, and score incentives.
- If Safety is high but Service collapses, inspect capacity, case costs, and unnecessary review burden.
- If About opens are low after completion, inspect debrief hierarchy and link value.
- If replay is high but comprehension is low, engagement may be masking weak learning.

Analytics indicate behavior, not motive. Qualitative research remains necessary before changing the product model.

## 11. Security and privacy review checklist

- No auth or account data.
- No user-generated content.
- No document upload or paste field.
- No server action or API route required.
- No secret in client code.
- No third-party model or data processor.
- No analytics payload containing case or evidence copy.
- No persistent stable visitor identifier introduced by feature code.
- No real customer, employer, tax, health, financial, or employment record.
- No claim that the product provides regulated advice or validated assessment.
- Dependency audit confirms no new package unless separately approved.

## 12. Content review checklist

- All people and organizations are fictional.
- Cases avoid demographic stereotypes and protected-class proxies.
- Evidence conflicts are operational, not sensational.
- Consequences are understandable without fear-based copy.
- Confidence bands do not encode the answer.
- Queue-visible cue signatures are paired with different preferred actions so evidence is required to disambiguate.
- At least two cases reward justified approval.
- Acceptable alternatives receive honest tradeoff explanations.
- Correction does not automatically imply model training.
- Escalation names a destination and creates visible workload.
- Repeated exception classes point toward product improvement.
- Reading level is accessible without flattening product vocabulary.

## 13. Fable audit prompts

Fable should try to disprove the plan through these questions:

1. Can any policy game the scoring and reach Balanced Operator without inspecting evidence?
2. Can escalating every case outperform a balanced policy?
3. Does any case have an arbitrary preferred action unsupported by its evidence?
4. Can a case disappear, resolve twice, or breach more than once?
5. Does the UI plan accidentally reveal the correct priority through styling?
6. Is finite capacity meaningful, or is it cosmetic because every preferred path is always affordable?
7. Does the game teach distrust of AI rather than calibrated review?
8. Are acceptable alternatives treated fairly in scores and copy?
9. Does the about page overstate the evidence behind human oversight or serious-game learning?
10. Can a keyboard or screen reader user complete every state without a timing disadvantage?
11. Does any analytics event expose content or imply individual assessment?
12. Does the plan duplicate Ship It instead of demonstrating a distinct AI operations capability?
13. Can a five-person test produce misleading public outcome claims?
14. Are portfolio and pm-lab repository boundaries explicit enough to prevent accidental cross-repo publishing?
15. Which exit criteria are subjective, and how can they be made observable?

Any unresolved P0 or P1 audit finding blocks implementation. P2 findings require disposition before the affected stage begins.

## 14. Release checklist

- [ ] Research and spec approved.
- [x] Fable audit complete and findings dispositioned.
- [ ] One visual direction owner approved.
- [ ] Engine and content invariants green.
- [ ] Scoring and profile rules published and tested.
- [ ] Campaign complete at 390 by 844.
- [ ] Keyboard and reduced-motion runs complete.
- [ ] Five usability sessions synthesized.
- [ ] Automated test, lint, and build green.
- [ ] Performance, accessibility, privacy, and network checks green.
- [ ] Preview owner acceptance recorded.
- [ ] Production authorization recorded.
- [ ] Live application verified.
- [ ] Article approved and published with truthful date.
- [ ] Portfolio project record approved and published.
- [ ] Cross-links, metadata, sitemap, and analytics verified.
- [ ] Observation window and rollback owner named.

## 15. Final definition of done

Exception Room is done when a visitor can complete a clear, accessible four to six minute run; the deterministic engine accounts for every case and action; the scoring rewards safe, timely, capacity-aware judgment without making escalation the winning strategy; the debrief exposes the decision trace; the about page publishes the research, formulas, and limitations; five moderated tests meet or trigger revision against the predeclared comprehension threshold; the deployed route and portfolio pair are verified; and no public claim exceeds the available evidence.
