# Exception Room Product and Design Specification

**Date:** 2026-07-16  
**Status:** Revised after Fable audit; implementation not authorized  
**Scope:** Third pm-lab experience, built on the existing Lab shell  
**Research:** `docs/research/2026-07-16-exception-room-research.md`

## Product statement

Exception Room is a four to six minute, mobile-first serious game about managing the human review queue behind a consequential AI workflow. The player has limited review capacity and a set of synthetic cases with different consequences, deadlines, evidence quality, and route reasons. They choose which case to review and whether to approve, correct, or escalate it. The debrief reveals how those decisions affected safety, service, capacity, and backlog.

The product demonstrates AI product judgment through mechanism. It does not use an AI model, accept real data, or claim to assess professional competence.

## Falsifiable product thesis

A queue that exposes trigger, consequence, evidence, priority, authority, resolution, and learning will help players make more defensible review decisions than a confidence-first queue. In usability testing, players should identify more high-consequence cases before service-level breach and reduce unsafe approvals without escalating every case.

Reject or revise the design if five representative users cannot explain the role of consequence and evidence after one run, or if the queue interaction adds burden without changing decisions.

## Goals

- Create a satisfying four to six minute portfolio experience.
- Make human oversight operational rather than decorative.
- Teach that confidence alone cannot prioritize consequential work.
- Make approval, correction, and escalation create visible tradeoffs.
- Show product depth through an inspectable engine, scoring model, and about page.
- Reuse the pm-lab shell, juice, accessibility, analytics, and deterministic-engine patterns.

## Non-goals

- Real compliance, fraud, medical, employment, tax, or financial decision support.
- Professional certification or hiring assessment.
- Real-time AI inference, chat, document upload, or free-text case generation.
- Multiplayer, leaderboard, account, database, or social graph.
- A production workforce-management queue.
- Legal interpretation of human-oversight requirements.
- Timed challenge mode in v1.

## Personas

### Portfolio visitor

Has little time and wants to understand Alvin's product judgment through direct interaction.

### AI product practitioner

Recognizes the workflow patterns and wants to inspect the framework, tradeoffs, and technical implementation.

### Recruiter or hiring manager

Wants evidence that Alvin can translate responsible AI principles into a coherent product mechanism and communicate the decisions clearly.

## Core experience principles

1. **The queue is selectable.** The player decides what receives attention.
2. **Evidence beats decoration.** Confidence never replaces source inspection.
3. **Every action moves work.** Approval, correction, escalation, and delay have operational effects.
4. **Pressure is turn based.** Capacity and aging create urgency without requiring reaction speed.
5. **The score is inspectable.** Raw outcomes and formulas remain available.
6. **The game permits defensible alternatives.** Some cases have acceptable actions with different costs.
7. **The debrief teaches.** It explains the decision path and repeated exception patterns.

## Experience map

### Entry

The player lands on `/exception-room`, sees the premise, estimated duration, synthetic-data statement, campaign and daily choices, sound control, and about link.

### Practice

An optional guided practice uses three short, unscored micro-cases, one for each action. It teaches the queue, evidence drawer, Approve, Correct, and Escalate without affecting campaign scores. The player may skip it after the first completion.

### Shift one: Understand the queue

Three cases, generous capacity, obvious evidence differences. The player learns that confidence can mislead priority.

### Shift two: Manage tradeoffs

Four cases, tighter capacity, mixed deadlines, one acceptable alternative, and an unnecessary-escalation trap.

### Shift three: Diagnose the system

Five cases, a repeated exception class, a late arrival, conflicting sources, and a policy-boundary case. The player must balance individual decisions with queue health.

### Debrief

The player sees Safety, Service, Capacity, raw metrics, a descriptive operator profile, decision trace, strongest decisions, improvement opportunity, repeated-system signal, and next actions.

## Routes

| Route | Purpose |
| --- | --- |
| `/exception-room` | Start screen and mode selection |
| `/exception-room/play` | Campaign run and optional practice |
| `/exception-room/daily` | Seeded daily run, enabled after campaign MVP |
| `/exception-room/about` | Research, framework, engine, scoring, ethics, and accessibility explanation |

## Domain model

```ts
export type ExceptionAction = 'approve' | 'correct' | 'escalate';
export type DecisionOutcome = 'preferred' | 'acceptable' | 'unsafe' | 'unnecessary';
export type ConsequenceTier = 'low' | 'medium' | 'high' | 'critical';
export type Reversibility = 'easy' | 'moderate' | 'difficult';
export type EvidenceStatus = 'supports' | 'conflicts' | 'missing' | 'context';
export type CaseStatus = 'queued' | 'resolved' | 'escalated' | 'expired';

export type RouteReason =
  | 'low-confidence'
  | 'conflicting-evidence'
  | 'missing-evidence'
  | 'policy-boundary'
  | 'unfamiliar-input'
  | 'random-quality-sample'
  | 'repeat-correction';

export interface EvidenceItem {
  id: string;
  title: string;
  sourceType: 'authoritative-record' | 'submitted-document' | 'policy' | 'history';
  observedAt: number;
  status: EvidenceStatus;
  summary: string;
}

export interface ExceptionCase {
  id: string;
  archetype: string;
  summary: string;
  recommendation: string;
  confidenceBand: 'low' | 'medium' | 'high';
  consequence: ConsequenceTier;
  reversibility: Reversibility;
  routeReasons: RouteReason[];
  evidence: EvidenceItem[];
  shift: 1 | 2 | 3;
  dueOffsetTicks: number;
  actionCosts: Record<ExceptionAction, number>;
  preferredAction: ExceptionAction;
  acceptableActions: ExceptionAction[];
  outcomeByAction: Record<ExceptionAction, DecisionOutcome>;
  detailOutcomeById?: {
    correct?: Record<string, DecisionOutcome>;
    escalate?: Record<string, DecisionOutcome>;
  };
  requiredEvidenceIds: string[];
  rationale: string;
  mishandlingConsequence: string;
  learningDestination: 'rule' | 'evaluation-set' | 'workflow' | 'policy' | 'none';
  contentNotes?: string[];
}

export interface ScheduledExceptionCase extends ExceptionCase {
  arrivesAtTick: number;
  dueAtTick: number;
}
```

At run start, the engine deterministically permutes each shift's cases across that shift's authored arrival slots. It derives `dueAtTick` as `arrivesAtTick + dueOffsetTicks`. A seed may change arrival order without invalidating deadlines. The implementation may refine names, but it must preserve the concepts and keep types free of React imports.

`outcomeByAction` is a total decision contract. It must classify all three actions for every case. Exactly one action is `preferred`; actions listed in `acceptableActions` are `acceptable`; a non-preferred action that causes the authored downstream harm is `unsafe`; and a non-harmful action that adds avoidable work is `unnecessary`. `detailOutcomeById` overrides the action-level default for an authored correction or escalation option. Content tests must reject any missing or contradictory action or detail mapping.

## Run state

```ts
export interface ExceptionRunState {
  seed: number;
  mode: 'campaign' | 'daily';
  shift: 1 | 2 | 3;
  tick: number;
  capacityRemaining: number;
  queuedCaseIds: string[];
  selectedCaseId: string | null;
  resolved: CaseResolution[];
  evidenceViewed: Record<string, string[]>;
  status: 'practice' | 'active' | 'complete';
  history: RunEvent[];
}
```

Every state transition must be reproducible from seed and action history.

## Shift configuration

The campaign uses global operational ticks and resets review capacity at each shift boundary:

| Shift | Cases | Global ticks | Arrival slots | Starting capacity | Learning emphasis |
| --- | ---: | --- | --- | ---: | --- |
| 1 | 3 | 0 through 3 | 0, 0, 0 | 8 | Confidence versus consequence |
| 2 | 4 | 4 through 7 | 4, 4, 5, 6 | 10 | Deadlines and unnecessary escalation |
| 3 | 5 | 8 through 12 | 8, 8, 9, 10, 11 | 12 | Repeated exceptions and operating-model diagnosis |

Default action costs are Approve 1, Correct 2, and Escalate 3. Individual cases may vary only when the content rationale explains the extra work and the invariant suite confirms that the preferred path remains affordable.

Time uses one global tick. A successful resolution is permitted while `tick <= shift.maxTick`; it records `resolvedAtTick` before time advances. `resolveCase` owns the full transaction and invokes one internal advance, so a successful resolution advances exactly one tick once. If that advance produces `tick > shift.maxTick`, the shift ends. On any earlier shift completion, the engine sets the tick to the next shift's opening tick, resets capacity, and records the transition before admitting new cases.

If the queue becomes empty while an authored case is scheduled later in the current or next shift, the engine advances to the next arrival tick without spending capacity and records a `time-advanced` event. A shift ends as capacity constrained when no harm-avoiding authored resolution is affordable for any queued case; an unsafe cheap action alone cannot keep the shift open or force the player to take it. All unresolved and never-arrived cases then follow an explicit carryover or expiration rule. Final expiration records a reason such as `capacity-constrained`, `shift-limit`, or `run-ended-before-arrival`.

## Queue behavior

- Admit cases when `arrivesAtTick <= current tick`.
- Age every unresolved case when an action advances the tick.
- Show warning state one tick before the due tick and breach state after it.
- Let the player open any visible queued case.
- Do not automatically sort by the correct answer.
- Default sort is arrival order. The player may toggle to consequence or due state after the first shift.
- Preserve selected case and evidence state when moving between queue and case review.
- End a shift when its required cases resolve, no harm-avoiding authored resolution is affordable, or a post-resolution advance crosses the maximum shift tick.
- Carry unresolved cases into the next shift when the content definition permits it.
- No case can disappear without a recorded resolution, escalation handoff, or explicit expired state.
- The authored schedule must have at least one full-clear path per shift that resolves every required case within the tick and capacity budgets.

## Action behavior

### Approve

- Lowest capacity cost.
- Completes the case if supported and within authority.
- Creates an unsafe-approval event when authored critical evidence is missing or conflicting.

### Correct

- Medium capacity cost.
- Opens a bounded correction choice when the case has more than one correctable field.
- Records the selected evidence and learning destination.
- Does not imply that the correction automatically trains a model.

### Escalate

- Highest local capacity cost.
- Requires a reason and named synthetic destination role.
- Counts as justified, acceptable, or unnecessary based on authored case rules.
- Adds escalation burden and reaches a clear handoff state.

## Scoring

### Consequence weights

| Tier | Weight |
| --- | ---: |
| low | 1 |
| medium | 3 |
| high | 8 |
| critical | 15 |

### Safety

```text
safety = round(100 * safely_handled_consequence_weight / total_consequence_weight)
```

Any resolution that avoids the authored downstream harm counts as safely handled, including a cautious but unnecessary escalation. Only an unsafe outcome receives zero case safety credit. The cost of an unnecessary action is charged to Service and Capacity, not Safety. Evidence views remain a separate process measure because opening a panel does not prove comprehension. The engine must never reward an unsafe critical approval because other metrics are high.

### Service

```text
service = round(100 * on_time_service_weight / total_service_weight)
```

Service weight uses consequence weight capped at 8 so a single critical case does not erase the rest of the shift. Unresolved, expired, and unnecessary outcomes receive zero service credit. Preferred or acceptable escalation counts as on time if the handoff occurs by the due tick.

### Capacity

```text
capacity = clamp(round(100 * safe_resolution_value / capacity_spent), 0, 100)
```

For each preferred or acceptable resolution, safe resolution value is the smaller of the actual action cost and that case's preferred-action cost. Unsafe and unnecessary resolutions contribute zero value while their cost remains in `capacity_spent`. This guarantees that safe resolution value cannot exceed capacity spent. If capacity spent is zero, Capacity is zero. Unnecessary escalation and avoidable rework therefore reduce the result without a hidden calibration constant.

### Profiles

Profiles communicate patterns, not competence:

- **Balanced Operator:** all three dimensions at least 80 and no unsafe high or critical approval.
- **Speed Over Evidence:** service or capacity at least 85 with safety below 70.
- **Escalation Heavy:** more than half of resolved cases escalated and at least two were unnecessary.
- **Backlog Bound:** unresolved or expired cases exceed one third of arrivals.
- **Safety First:** safety at least 90, service below 70, and escalation burden above the authored baseline.
- **Calibration in Progress:** fallback when no stronger pattern applies.

Profile precedence is first match wins: 1) Balanced Operator, 2) Speed Over Evidence, 3) Escalation Heavy, 4) Backlog Bound, 5) Safety First, 6) Calibration in Progress. The escalation baseline is the preferred-policy escalation count for the active seed. Safety First requires escalation burden above that baseline. This order and baseline definition must be published on the about page and unit tested with overlapping conditions.

## Content requirements

- Twelve campaign cases at MVP.
- At least two clean approvals.
- At least three corrections.
- At least three justified escalations.
- At least two cases with an acceptable alternative.
- At least one high-confidence error.
- At least one low-confidence clean case.
- At least one repeated exception class.
- At least one case whose priority changes because it ages.
- At least one late arrival.
- Every pre-evidence surface-cue signature at admission, defined as primary route reason, consequence tier, confidence band, reversibility, and due band, appears in at least two campaign cases with different preferred actions. The invariant suite must prove that queue-visible cues alone are not a deterministic answer key.
- No protected class stereotypes, real company names, or copied real forms.
- Text limits enforced through tests: summary 160 characters, recommendation 180, evidence summary 180, rationale 420.

## Visual and interaction direction

The final design is intentionally unresolved until the required three-option visual ideation gate. All options must preserve:

- mobile-sized canvas, maximum approximately 390 pixels inside desktop shell;
- visible queue and capacity state;
- progressive disclosure from queue to case evidence;
- tactile buttons and high contrast;
- no fake enterprise dashboard density;
- no swipe-only action;
- game-specific deep teal identity with restrained amber accent, measured against the actual shared Lab tokens;
- synthetic, humane case language.

## Feedback and motion

- Queue age changes use text and icon state, not color alone.
- Correct decisions receive brief confirmation and a rationale, not confetti on every case.
- Confetti is reserved for campaign completion and disabled under reduced motion.
- Unsafe approval may use a restrained card shake and consequence reveal, with a static equivalent.
- Capacity changes count down visually and through an accessible status message.
- Sound and haptics are optional and never carry unique information.

## Persistence

- Storage key: `pmlab:exception-room:v1`.
- Store campaign completion, practice completion, best profile, daily history, streak, and sound preference.
- Grant 200 XP once on first campaign completion and 50 XP once per completed local-date daily run. Persist a campaign reward flag and guard daily XP by `lastDailyDate` before addition.
- Do not store case evidence text or full event history beyond what the UI needs for local replay.
- Use key-suffix versioning through `pmlab:exception-room:v1` and the existing safe-storage behavior. Do not add a stored schema-version field or unused migration framework in v1. The game remains fully playable if storage is unavailable.
- Merge earned XP into `pmlab:profile:v1` through the existing lab profile function.

## Analytics

Permitted events:

- `game_start` with mode `exception-room-campaign` or `exception-room-daily`;
- `practice_complete`;
- `case_opened` with archetype and consequence tier;
- `evidence_opened` with evidence status only;
- `case_decision` with archetype, action, acceptable boolean, and tick band;
- `shift_complete` with shift and aggregate score bands;
- `run_complete` with profile, score bands, unresolved count, and duration band;
- `share_clicked`;
- `about_opened`.

Prohibited analytics:

- evidence or case text;
- free-form content;
- stable cross-product visitor identifiers;
- exact action history tied to a person;
- data implying professional assessment.

## Accessibility acceptance

- WCAG 2.2 AA target.
- Complete campaign with keyboard only.
- No keyboard trap in queue, drawer, reveal, or dialog states.
- Focus moves intentionally when opening and closing case review.
- Screen reader announces capacity, breach, resolution, and score changes without repeated noise.
- No required timer, drag, hover, sound, motion, or haptic feedback.
- Content and controls reflow at 320 CSS pixels and 200 percent zoom.
- Target size at least 24 by 24 CSS pixels, with primary actions at least 44 pixels high.
- Contrast meets AA for text, controls, focus, and status indicators.
- Reduced motion produces no shake, travel, count-up, or confetti.

## Performance and reliability

- Static or near-static delivery with no backend.
- No network request required after game assets load.
- Lighthouse performance, accessibility, best practices, and SEO each at least 95 on start and play routes.
- No cumulative layout shift above 0.1 during play.
- Engine transitions under 16 milliseconds in local profiling on representative hardware.
- Graceful fallback for storage, clipboard, analytics, sound, haptics, and reduced-motion APIs.

## Testing strategy

### Engine

- Determinism for seed and action history.
- Case arrivals, aging, warning, breach, shift transition, and completion.
- Action costs and capacity exhaustion.
- Preferred and acceptable actions.
- Score calculations and profile precedence.
- No negative capacity, duplicate resolution, vanished case, or unresolved terminal ambiguity.

### Content invariants

- Unique IDs and valid route reasons.
- Required evidence exists.
- Preferred action is not repeated in acceptable actions.
- Every case has a reachable resolution.
- Text limits.
- Campaign contains the required archetype distribution.
- Across simulated policies, each profile except the fallback is reachable.
- Random approval and escalation-only policies do not receive Balanced Operator.
- Queue-visible-cue-only and zero-evidence policies do not receive Balanced Operator across the launch case set.
- A resolve-only-cheap policy may score high on Capacity but must receive Backlog Bound and sub-80 Safety or Service.
- The preferred policy can fund and clear every shift within its authored tick schedule.

### Components

- Queue states, selection, evidence drawer, all actions, reveal, debrief, and errors.
- Keyboard focus and accessible names.
- Reduced motion and sound-off states.
- Storage and clipboard fallback.

### Manual QA

- 390 by 844 mobile canvas and 1440 by 1000 desktop shell.
- iOS Safari, Android Chrome, and desktop Chromium or Safari.
- 200 percent zoom, keyboard only, VoiceOver spot checks, reduced motion, and high contrast.
- Reload during queue, completed campaign, daily rollover, denied storage, and offline replay.

## Release model

1. Approve research, product spec, and scoring.
2. Build and verify the engine and content contract after owner plan approval.
3. Run three-option visual ideation in parallel and select one direction before UI work.
4. Build campaign and about page.
5. Conduct five moderated usability sessions.
6. Revise content, scoring, and interaction.
7. Add daily mode and portfolio integration.
8. Deploy and verify the real route before publishing outcome claims.

## Definition of done

- All campaign stories and acceptance criteria pass.
- Twelve cases satisfy content invariants and independent content review.
- Five representative usability tests complete with findings and decisions recorded.
- At least four of five testers can name two priority factors beyond confidence and one escalation cost.
- Full keyboard and reduced-motion flows pass.
- Determinism and score explanations are verified.
- About page publishes sources, formulas, synthetic-data statement, limitations, and no-assessment boundary.
- Real deployed routes, analytics, metadata, mobile layout, and portfolio link are verified.
- No public claim uses usability findings as proof of workplace performance or regulatory compliance.
