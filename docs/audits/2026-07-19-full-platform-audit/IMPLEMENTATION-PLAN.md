# Product Lab audit implementation plan

## Objective

Turn Product Lab into a portfolio-ready product whose visuals, mechanics, scoring, accessibility, state, and public claims all support the same story: Alvin can design accountable product systems under real tradeoffs.

This plan follows the completed 158-check audit at commit `d608c67`. It does not authorize implementation, commits, pushes, merges, previews, or production deployment.

## Delivery rules

1. Use a new remediation branch from the verified audited baseline. Keep one implementation slice per reviewable pull request.
2. Build the browser regression harness before changing the flows it must protect.
3. Close completion, assessment-integrity, and active-state P1 findings before adding new rewards or new games.
4. Preserve the approved hub assets and full-bleed mobile world. Repair geometry and behavior without replacing the art direction.
5. Keep the desktop experience as a centered mobile game canvas. Reflow content inside the canvas instead of scaling a desktop layout down.
6. Treat scoring and content changes as product-model changes. Update engine tests, UI explanations, About copy, analytics, and result labels together.
7. Use real assets or the existing icon library. Do not replace central game art with emoji, CSS drawings, or approximate inline SVG.
8. Every slice ends with production-build browser evidence at 390 x 844, 430 x 932, 1200 x 900, and simulated 200 percent zoom where relevant.
9. A Vercel preview may be created only when authorized. Production remains a separate approval gate.

## Research principles carried into implementation

The plan uses the existing [engagement research](../../research/2026-07-15-game-engagement-and-product-lab-research.md), [mobile hub research](../../research/2026-07-17-mobile-game-hub-research.md), and [Exception Room research](../../research/2026-07-16-exception-room-research.md).

- Build competence through understandable feedback and visible improvement, not XP alone.
- Keep goals clear, decisions immediate, and explanations causally tied to the action.
- Teach through action instead of adding a long passive tutorial.
- Preserve player autonomy while making non-negotiable safety and integrity boundaries explicit.
- Treat accessible reflow, focus, motion, sound, and haptics as part of game quality.
- Use visual authorship to support credibility, not to hide model weaknesses.

## Sequence overview

| Slice | Priority | Size | Outcome |
| --- | --- | --- | --- |
| 0. Regression harness | P1 foundation | M | The reproduced failures become automated release gates. |
| 1. Mobile canvas and zoom | P1 | L | Every route remains visible, scrollable, and completable. |
| 2. Significant judgment integrity | P1 | L | Decisions are graded from observable evidence and misses commit safely. |
| 3. Ship It integrity model | P1 | L | Leadership ratings cannot reward harmful product behavior. |
| 4. Exception Room oversight model | P1 | XL | Evidence, deadlines, practice, outcomes, and debrief measure accountable review. |
| 5. Active-run recovery and validation | P1 | L | Consequential progress survives refresh and route interruption. |
| 6. Accessibility and preferences | P1 and P2 | L | Focus, announcements, dialog behavior, motion, haptics, sound, and evidence legibility work coherently. |
| 7. Teaching, portfolio translation, and sharing | P2 | L | Every game explains what it trains and why the work matters. |
| 8. Visual and game-feel polish | P2 | M | Frequent feedback is authored, readable, and semantically correct. |
| 9. Platform hardening and release gate | P2 and P3 | M | Metadata, analytics, performance, headers, and deployment verification are production-ready. |

## Slice 0: Browser and accessibility regression harness

### Goal

Convert the audit's most expensive manual discoveries into repeatable checks before product behavior changes.

### Scope

- Add Playwright browser journeys for the hub, Significant calibration and one campaign case, Ship It choice and failure, and Exception Room evidence and decision flow.
- Add storage fixtures for fresh, returning, malformed, active-run, completed Daily, and completed campaign states.
- Add console-error, page-error, failed-request, and duplicate-reward assertions.
- Add accessibility-tree or axe checks for names, roles, values, focus, and dialog behavior.
- Capture approved 390, 430, desktop, and zoom screenshots for representative states.
- Keep deterministic seed fixtures so result screenshots do not depend on random branch selection.

### Likely files

- `package.json`
- `playwright.config.ts`
- `e2e/fixtures/`
- `e2e/hub.spec.ts`
- `e2e/significant.spec.ts`
- `e2e/ship-it.spec.ts`
- `e2e/exception-room.spec.ts`
- CI workflow or the repository's existing verification command

### Acceptance criteria

- One command builds the production app, starts it on an isolated port, runs all browser tests, and exits cleanly.
- Tests fail on console errors, uncaught page errors, broken local assets, and duplicate XP.
- Zoom tests prove the primary action is reachable, not only that a screenshot exists.
- Focus tests assert the intended target after a result, picker, dialog, Continue, and route return.
- Test fixtures use public service or state APIs, not production query shortcuts.
- The suite covers the current audit reproductions before those reproductions are fixed.

### Findings covered

`SRC-P2-05`, `EXC-P2-05`, all browser regression findings.

## Slice 1: Mobile canvas, shared chrome, and 200 percent zoom

### Goal

Keep the approved mobile-first presentation while allowing content to reflow and every required action to remain reachable.

### Scope

- Define one height and scrolling contract for `LabShell`, `GameShell`, standard chrome, immersive chrome, and route content.
- Remove fixed-height stacking that places an 844 pixel Exception Room shell below 114 pixels of shared headers.
- Choose one persistent header layer per game state. Do not show root, game, and route headers when they duplicate brand, XP, or controls.
- Use `100dvh`, safe-area insets, `min-height: 0`, and explicit internal overflow boundaries where appropriate.
- At zoom or narrow CSS width, allow vertical reflow rather than clipping a fixed 390 pixel composition.
- Keep desktop presentation centered at a true 390 pixel game width with no padding that shrinks the actual shell.
- Preserve full silhouettes, approved lockups, background art, and mobile immersion.

### Likely files

- `src/app/globals.css`
- `src/app/lab-hub.css`
- `src/app/significant/significant.css`
- `src/app/exception-room/exception-room.css`
- `src/components/lab/LabShell.tsx`
- `src/components/game/GameShell.tsx`
- `src/components/game/GameHeader.tsx`
- Exception Room entry and run components

### Acceptance criteria

- At 390 x 844 and 430 x 932, every entry disclosure, CTA, decision, and result action is reachable.
- At a 195 x 422 CSS viewport, hub game selection, Significant decisions, Ship It choices, and Exception Room decisions are reachable by scroll without horizontal clipping.
- Zoom does not hide the collection title, active heading, focus indicator, or required action.
- Exception Room has no unreachable bottom region and no conflicting nested viewport heights.
- At 1200 x 900, all four surfaces render in a centered 390 pixel canvas unless a route explicitly needs a taller scroll document.
- Screenshots match the approved art at the same viewport and state after geometry repair.

### Findings covered

`HUB-BP1-01`, `SIG-BP1-03`, `SHIP-BP1-01`, `SRC-P1-02`, `EXC-P1-07`, `ENG-12` through `ENG-15`, `ENG-27`.

## Slice 2: Significant judgment integrity and result commit

### Goal

Make every Significant answer defensible from the evidence on screen and prevent state manipulation at the result boundary.

### Product decisions

- Define Ship as evidence supporting a meaningful, operationally safe release decision.
- Define Kill as evidence supporting stopping the treatment, not merely missing evidence.
- Define Keep Running as unresolved evidence where more data can realistically change the decision and continued exposure is acceptable.
- Grade the player from observable evidence and declared decision policy. Hidden simulated truth may enrich the explanation but cannot make an unjustified operational action correct.
- Decide whether calibration is one round or three. The existing research and UI point to three short guided rounds, one for each action.

### Scope

- Rewrite the Winner's Curse answer policy and any other case that relies on hidden truth.
- Reconcile calibration definitions with campaign definitions.
- Implement the promised calibration sequence or remove the false 1 of 3 model.
- Commit attempts and the chosen result atomically when the decision is made, before rendering the reveal.
- Make refresh restore the committed reveal or return with the miss already recorded.
- Scope confetti to the mounted successful result and cancel it on route or state change.
- Remove the production `?call=` calibration bypass or gate it to a non-production test interface.
- Add meaningful chart descriptions with endpoints, direction, uncertainty, and sample context.

### Likely files

- `src/lib/engine/archetypes.ts`
- `src/lib/engine/types.ts`
- `src/lib/engine/scenario.ts`
- `src/hooks/useGameRound.ts`
- `src/hooks/significant/useCalibration.ts`
- `src/components/significant/CalibrationRound.tsx`
- `src/components/significant/CalibrationReveal.tsx`
- `src/components/significant/GameRound.tsx`
- `src/components/significant/RevealPanel.tsx`
- `src/components/significant/Sparkline.tsx`
- `src/lib/progress.ts`

### Acceptance criteria

- A reviewer can explain the difference among Ship, Kill, and Keep Running from one stable definition.
- No case requires hidden ground truth to justify its scored answer.
- The Winner's Curse case accepts only decisions justified by visible evidence, with any hidden truth clearly labeled as retrospective simulation detail.
- Calibration progress matches the actual number of rounds.
- Refresh on a result cannot erase an attempt, change first-try stars, or reroll XP.
- A wrong result never contains a confetti canvas from a prior state.
- Direct production URLs cannot complete calibration without a user decision.
- The chart's accessible name contains the evidence required to make the call independently.

### Findings covered

`SIG-P1-01`, `SIG-P1-02`, `SIG-BP1-01`, `SIG-BP1-02`, `SIG-P2-01`, `SIG-P2-03`, `SIG-BP2-01`, `SIG-BP2-03`.

## Slice 3: Ship It integrity model and causal feedback

### Goal

Keep the fast tradeoff loop while preventing the game from framing harmful practices as acceptable leadership choices.

### Product decisions

- Add an Integrity constraint that is separate from the four operating meters.
- Classify accessibility, privacy, security, truthful marketing, dark patterns, and legal compliance as hard or review-required boundaries.
- Do not let a balanced meter portfolio erase an integrity breach.
- Keep genuinely ambiguous prioritization choices as tradeoffs.
- Decide whether the Users meter remains one concept. If it does, rename and define it so adoption cannot stand in for user welfare.

### Scope

- Add integrity metadata to authored cards and decision effects.
- Update result calculation so CEO-in-waiting and Promoted require no unresolved integrity breaches.
- Give integrity-risk choices immediate, plain-language feedback without moralizing.
- Add a causal explanation after every choice: what changed, why it changed, and which assumption drove the effect.
- Explain overshoot backlash when it happens and name the earlier choice that triggers an authored continuation.
- Delay XP award until the review is committed. A failed run must not show a reward behind the failure surface.
- Add the expected run duration to the entry.
- Correct ambiguous share labels such as `P62`.

### Likely files

- `src/lib/ship-it/types.ts`
- `src/lib/ship-it/cards.ts`
- `src/lib/ship-it/engine.ts`
- `src/lib/ship-it/review.ts`
- `src/hooks/ship-it/useShipRun.ts`
- `src/components/ship-it/DilemmaCard.tsx`
- `src/components/ship-it/MetersHud.tsx`
- `src/components/ship-it/FailureScreen.tsx`
- `src/components/ship-it/ReviewCard.tsx`
- Ship It entry page

### Acceptance criteria

- The audited four-choice integrity-risk path cannot earn CEO-in-waiting or Promoted.
- A top rating requires the declared integrity conditions in addition to meter survival and balance.
- Each integrity card identifies the non-negotiable boundary or required review step.
- Each ordinary tradeoff card explains the meter effects causally.
- Overshoot and arc continuations name the state or prior choice that caused them.
- Failure shows no newly awarded XP before the review is accepted.
- Entry states expected duration and failure condition.
- Review copy distinguishes performance, integrity, and operating balance.

### Findings covered

`SHIP-P1-03`, `SHIP-P1-04`, `SHIP-P1-05`, `SHIP-P2-04`, `SHIP-P2-06`, `SHIP-BP2-02`, SHIP-11, SHIP-12, SHIP-28 through SHIP-30.

## Slice 4: Exception Room evidence, deadlines, practice, and debrief validity

### Goal

Make the flagship AI-operations game measure accountable oversight rather than correct guessing.

### Product decisions

- A decision is defensible only when the player inspected the evidence required by that case or explicitly accepts a visible evidence deficit.
- Evidence quality matters more than evidence click count.
- Balanced Operator requires both safe outcomes and a declared review-quality threshold.
- Preferred, acceptable, unnecessary, and unsafe outcomes need different learning signals.
- Practice is unscored and teaches Approve, Correct, and Escalate through action.

### Scope

- Connect the authored practice cases to the entry before the first scored campaign.
- Enforce `requiredEvidenceIds` in the engine or require an explicit proceed-without-evidence confirmation that affects outcome and debrief.
- Replace evidenceInspectionRate with a defensible metric based on required or decisive evidence reviewed.
- Rework profile thresholds and precedence so zero evidence cannot produce Balanced Operator.
- Show decision trace and evidence behavior in the final debrief.
- Render exact deadline language from `dueAtTick - tick`, including correct counts when multiple cases share the nearest deadline.
- Add exact due information or an accessible relative label on each queue card.
- Show the case summary and render evidence at a readable size without one-line truncation.
- Give preferred and acceptable outcomes different labels, icon treatment, explanation, and next-step lesson.
- Add a consequence summary and confirmation to End Shift.
- Remove or hide the unfinished Daily card until the mode exists.
- Remove or environment-gate `?preview=` production shortcuts.

### Likely files

- `src/lib/exception-room/content/practice.ts`
- `src/lib/exception-room/types.ts`
- `src/lib/exception-room/engine.ts`
- `src/lib/exception-room/scoring.ts`
- `src/lib/exception-room/presentation.ts`
- `src/lib/exception-room/review.ts`
- `src/hooks/useExceptionRun.ts`
- `src/components/exception-room/CapacityHeader.tsx`
- `src/components/exception-room/QueueList.tsx`
- `src/components/exception-room/CaseReview.tsx`
- `src/components/exception-room/ResolutionReveal.tsx`
- `src/components/exception-room/ShiftSummary.tsx`
- `src/components/exception-room/ExceptionPlayClient.tsx`

### Acceptance criteria

- A zero-evidence campaign cannot earn Balanced Operator, Safety 100, or a complete evidence score.
- Opening one arbitrary item per case cannot produce Evidence inspected 100 percent.
- Required or decisive evidence is visible, readable, and programmatically associated with its control.
- Seed 6240 at tick 0 reports the nearest deadline as two ticks and the correct number of cases sharing it.
- Preferred and acceptable screenshots are distinguishable without reading the full paragraph.
- Practice demonstrates all three actions before the first scored campaign and grants no campaign XP.
- End Shift tells the player which cases will expire or carry over before confirmation.
- The debrief includes a decision trace and explains how evidence behavior affected the profile.
- Daily is either functional or absent from the promoted entry.

### Findings covered

`EXC-P1-02` through `EXC-P1-07`, `EXC-P2-02`, `EXC-BP2-01`, `EXC-BP1-02` through `EXC-BP1-04`, EXC-31 through EXC-40.

## Slice 5: Active-run recovery and runtime state validation

### Goal

Protect the player's highest-cost progress and make invalid stored state recover safely.

### Scope

- Define versioned, strict Zod schemas for Significant and Ship It progress, matching the existing shared-service standard.
- Persist active Ship It state after each accepted decision.
- Persist active Exception Room state after case selection, evidence review, decision, Continue, and shift transition.
- Persist Significant reveal state atomically with the attempt.
- Store seed, mode, content version, run version, current phase, and enough event history to restore deterministically.
- On incompatible content or schema version, explain the reset and preserve completed rewards where safe.
- Add explicit Restart run actions. Do not use route navigation as the only reset mechanism.
- Decide Back behavior before implementation: save and exit, or require confirmation when uncommitted progress exists.

### Likely files

- `src/lib/progress.ts`
- `src/lib/ship-it/state.ts`
- `src/lib/exception-room/state.ts`
- `src/services/labProfileService.ts`
- `src/hooks/ship-it/useShipRun.ts`
- `src/hooks/useExceptionRun.ts`
- game entry and play clients

### Acceptance criteria

- Refresh after any completed decision restores the exact card, meters, capacity, evidence, shift, and reveal phase.
- Browser Back and Forward either restore the run or present a clear saved-progress resume path.
- Refresh cannot duplicate analytics, XP, Daily rewards, or completion.
- Valid JSON with invalid shapes never crashes or displays impossible values.
- Migration and reset outcomes are unit tested for current, legacy, future, malformed, and partially written records.
- Completed rewards remain authoritative when an active run is discarded.

### Findings covered

`SIG-BP1-02`, `SHIP-P1-01`, `EXC-P1-01`, `SIG-P2-02`, `SRC-P2-01`, `ENG-05` through `ENG-11`.

## Slice 6: Focus, announcements, dialogs, and shared preferences

### Goal

Make every core loop understandable and operable through keyboard and assistive technology while honoring the user's explicit settings.

### Scope

- Remove unnamed keyboard stops from draggable hub wrappers. Keep one focusable link per card.
- Add outside-click and Escape dismissal to Settings, restore focus to the trigger, and expose expanded state.
- On Significant result, focus the result heading or result container and announce the outcome once.
- Make Ship It failure a complete modal or a normal in-flow failure state. If modal, add `aria-modal`, focus entry, focus containment, Escape policy, and focus restoration.
- Announce Ship It meter name, old value, delta, new value, and warning state after a choice.
- Move Exception Room focus to picker heading or first option, restore it on Back, focus outcome on reveal, and focus the new queue context on Continue.
- Name Exception Room shift and capacity progressbars.
- Associate each evidence control with its full summary and status.
- Pass shared Haptics and Motion preferences into Ship It JavaScript behavior.
- Either implement meaningful Exception Room sound feedback or remove the control until sound exists.
- Ensure manual Full does not override an operating-system reduced-motion safety choice without an explicit and defensible policy.

### Likely files

- `src/components/lab/FloatingGameCard.tsx`
- `src/components/game/GameSettings.tsx`
- `src/components/significant/GameRound.tsx`
- `src/components/significant/CalibrationRound.tsx`
- `src/components/ship-it/RunScreen.tsx`
- `src/components/ship-it/FailureScreen.tsx`
- `src/components/ship-it/MeterBar.tsx`
- `src/components/exception-room/CapacityHeader.tsx`
- `src/components/exception-room/CaseReview.tsx`
- `src/components/exception-room/ExceptionRunScreen.tsx`
- `src/components/exception-room/ResolutionReveal.tsx`
- shared preference hooks and juice utilities

### Acceptance criteria

- One Tab reaches each hub game link. No inert draggable wrapper receives focus.
- Escape and outside click dismiss Settings and return focus to the trigger.
- Every dynamic replacement puts focus on a meaningful new context.
- Ship It failure exposes only the intended dialog controls while active.
- Meter and queue changes are announced without repeating the whole page.
- Both Exception Room progressbars have unique accessible names.
- Haptics Off produces zero vibration calls.
- Manual Reduced disables nonessential drag, confetti, pulse, shake, and large travel across all games.
- Sound controls create an audible distinction or are not shown.
- A complete keyboard run passes for every game.

### Findings covered

`HUB-BP2-01`, `HUB-BP2-02`, `SIG-P2-03`, `SIG-P2-04`, `SHIP-P1-02`, `SHIP-P2-01` through `SHIP-P2-03`, `EXC-P2-03`, `EXC-P2-04`, `EXC-P2-06`, `ENG-16` through `ENG-22`.

## Slice 7: Teaching, portfolio translation, About routes, and sharing

### Goal

Help a first-time visitor understand what each game trains, what Alvin designed, and what the result means without turning the entry into a resume page.

### Scope

- Rewrite hub card promises so each names its mechanism and product capability.
- Add compact time and mode metadata to all three cards.
- Keep all three games immediately visible or reachable. Do not add search, filters, carousel onboarding, or dashboard density.
- Add an Exception Room About route covering the queue contract, engine, score, limitations, accessibility, analytics, and source-backed research.
- Correct the Significant analytics statement or remove Exception Room seed tracking.
- Add game-specific metadata, canonical URLs, Open Graph images, Twitter cards, robots, sitemap, and manifest as appropriate.
- Add a selectable-text fallback when clipboard permission fails in Significant and Ship It.
- Make result copy explain what the profile measures and what it does not measure.
- Keep claims disclosure-safe: simulated data, no validated hiring assessment, no real user or business impact unless measured later.

### Likely files

- `src/lib/gameCatalog.ts`
- hub card component and styles
- `src/app/significant/layout.tsx`
- `src/app/ship-it/layout.tsx`
- `src/app/exception-room/layout.tsx`
- new Exception Room About route
- `src/components/significant/ShareControl.tsx`
- `src/components/ship-it/ReviewCard.tsx`
- `src/services/shareService.ts`
- metadata and generated image files under `src/app`

### Acceptance criteria

- A first-time reviewer can distinguish experiment judgment, product tradeoff management, and AI exception operations from the hub cards alone.
- Each entry states goal, stakes, expected duration, data boundary, and primary CTA before the first scored choice.
- Exception Room links to a source-backed case study from entry and debrief.
- Significant and Ship It direct links show game-specific titles, descriptions, and share images.
- Clipboard denial always exposes selectable result text.
- Public analytics copy matches the actual allowlisted payload.
- No page claims validated assessment, business impact, real operational data, or user research that does not exist.

### Findings covered

`HUB-P2-01`, `HUB-P2-02`, `SHIP-P2-04`, `EXC-P2-01`, `SRC-P1-01`, `SRC-P2-04`, `SIG-BP2-02`, `SHIP-BP2-03`, `ENG-23`, `ENG-29`.

## Slice 8: Visual feedback and authored game feel

### Goal

Make frequent interaction feedback as intentional as the approved hub and Exception Room art while preserving semantic meaning.

### Scope

- Move Ship It delta feedback inside the game content layer so it never overlaps global chrome.
- Replace Ship It operating-system emoji with authored assets sized for the exact card and meter slots.
- Scope all confetti to successful states, reduce obstruction, and stop it before key review content becomes readable.
- Give Ship It low-meter warning a text and icon signal in addition to color and pulse.
- Distinguish Exception Room preferred and acceptable outcomes visually and verbally.
- Resolve the run-it-back transition frame and add a visual regression capture.
- Keep decorative ambient motion subtle and nonessential.
- Do not redesign the approved hub card silhouettes, title lockup, or full-bleed world unless a measured mismatch remains after layout repair.

### Likely files

- Ship It components and styles
- `src/components/juice/confetti.ts`
- `src/components/exception-room/ResolutionReveal.tsx`
- game asset folders and image metadata
- visual regression snapshots

### Acceptance criteria

- Choice deltas never overlap Product Lab or game navigation.
- Ship It central art is stable across platforms and uses source-controlled assets.
- Wrong and failure states never render celebratory particles.
- Success confetti does not cover the result heading, rating, score, explanation, or CTA.
- Low-meter warning is understandable in grayscale and with motion disabled.
- Preferred, acceptable, unnecessary, and unsafe Exception Room outcomes are identifiable without color alone.
- Run it back settles to a visually complete week 1 state in the captured production frame.

### Findings covered

`SHIP-P2-05`, `SHIP-BP2-01`, `SHIP-BP2-04`, `EXC-BP2-01`, `SIG-BP1-01`, SHIP-10, SHIP-18, SHIP-20, SHIP-31.

## Slice 9: Performance, metadata, security, and release verification

### Goal

Close the gap between a strong local build and a production release that is inspectable, discoverable, and regression-resistant.

### Scope

- Optimize the 448 KB hub title SVG without changing its approved appearance.
- Measure LCP, INP, CLS, asset transfer, and main-thread work on a mobile-throttled Vercel preview.
- Replace empty pre-hydration game main regions with meaningful server-rendered entry content or an accessible branded loading state.
- Resolve the PostCSS advisory through a valid upstream or dependency strategy. Do not accept npm's invalid Next 9 downgrade.
- Define CSP, frame, referrer, permissions, and content-type policies against actual analytics, image, sound, vibration, and font requirements.
- Decide whether Daily is device-local by design. If yes, state that clearly. If no, introduce a shared server-authoritative date and reward boundary.
- Add a release checklist that verifies branch, commit, Vercel project, preview URL, production alias, critical asset hashes, and complete browser suite.

### Likely files

- `public/assets/lab/pick-field-test-logo.svg`
- game entry pages and loading boundaries
- `next.config.ts`
- metadata files under `src/app`
- package and lock files
- CI and release documentation

### Acceptance criteria

- Optimized title asset is visually indistinguishable at the approved 390 and desktop viewports and materially smaller on disk.
- Mobile-throttled preview meets declared performance budgets or records an explicit exception with evidence.
- A direct game route contains a meaningful heading and next action or loading explanation before client storage hydration.
- Production headers are intentional and tested, not copied from a generic checklist.
- Dependency audit has no unreviewed high or critical advisory and documents the remaining moderate path.
- Daily wording matches the chosen clock authority.
- Release evidence proves the exact commit and Vercel project behind the tested preview and any later production alias.

### Findings covered

`SRC-P2-03`, `SRC-P2-06`, `SRC-P2-07`, `SRC-P3-01`, `SRC-P3-02`, `ENG-25`, `ENG-28`, `ENG-31` through `ENG-34`.

## Required verification matrix for every affected slice

| Dimension | Required proof |
| --- | --- |
| Functional | Supported path completes from a fresh context and a returning context. |
| State | Refresh, Back, Forward, duplicate input, and completion persistence behave as specified. |
| Mobile | 390 x 844 and 430 x 932 screenshots with every required action reachable. |
| Desktop | 1200 x 900 screenshot with a centered, complete mobile canvas. |
| Zoom | 195 x 422 CSS viewport with keyboard and touch access to the next required action. |
| Keyboard | Visible focus, logical order, native activation, no inert stops, no traps. |
| Semantics | Correct names, roles, values, expanded state, modal state, and live announcements. |
| Preferences | System and manual motion, Sound, and Haptics produce the promised behavior. |
| Visual | Same-state comparison against approved reference or prior accepted screenshot. |
| Runtime | No console errors, page errors, failed local assets, or rejected promises. |
| Automated | Unit, integration, browser, accessibility, build, and lint checks pass. |
| Deployment | Preview project and exact commit are verified before sharing. Production requires separate approval. |

## Product acceptance test after all slices

Recruit five representative reviewers only after the P1 implementation work is stable: a product leader, an AI product practitioner, an engineer, a recruiter or hiring manager, and a keyboard or assistive-technology user where feasible.

Use predeclared tasks:

1. Explain Product Lab and the difference among the three games from the hub.
2. Start the game most relevant to AI product leadership.
3. Complete one meaningful decision without facilitator help.
4. Explain why the outcome occurred and what skill the game is trying to show.
5. Find how the product was designed and what its limitations are.

Do not claim usability success from traffic or completion data alone. Combine behavioral analytics with moderated explanation. Publish only findings and outcomes that the evidence supports.

## Definition of portfolio-ready

Product Lab is ready for prominent portfolio promotion when:

- all P1 findings in `FINDINGS-REGISTER.md` are closed with fresh browser evidence;
- every core action remains reachable at the required mobile, desktop, and zoom viewports;
- Significant grades observable judgment, Ship It separates integrity from meter balance, and Exception Room requires defensible evidence behavior;
- active runs survive expected interruption or clearly checkpoint and recover;
- complete keyboard loops and preference checks pass across all games;
- every entry and result explains the product capability without unsupported claims;
- game-specific link metadata and About routes are live;
- the automated browser suite covers the audit's confirmed regressions;
- the exact Vercel preview commit is verified before production approval.
