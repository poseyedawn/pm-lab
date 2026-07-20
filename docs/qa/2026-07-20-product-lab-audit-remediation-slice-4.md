# Product Lab audit remediation: Slice 4

Date: 2026-07-20

Branch: `codex/product-lab-audit-remediation`

Commit boundary at start: `d608c67`

Status: complete locally, not committed, not pushed, not deployed

## Slice objective

Make Exception Room measure accountable AI oversight instead of correct guessing, then close the connected recovery, first-run learning, queue-accuracy, focus, feedback, and portfolio-translation gaps found in the full-platform audit.

## Outcome

Exception Room now treats evidence review as part of the assessment contract. Every case declares required evidence. The engine blocks a decision until those items are reviewed or the player explicitly accepts an evidence deficit. That deficit remains in the resolution, appears in the result, lowers Safety and Evidence quality, appears in the decision trace, and prevents the strongest operator profile.

The product also now includes a three-case unscored practice queue, exact deadline information, an End Shift forecast, deterministic active-run recovery, safe duplicate-input handling, working sound and haptic feedback, complete focus handoffs, visible state announcements, distinct outcome teaching, readable evidence, and an Exception Room case-study route.

## Product decisions

### Evidence is part of the decision, not optional metadata

- Required evidence is visually marked and programmatically named.
- The evidence counter reports required items, not arbitrary clicks.
- Missing required evidence opens a deliberate confirmation before engine submission.
- Continuing without evidence is allowed because real operators sometimes face incomplete inputs, but it is recorded as a review-quality deficit.
- Safety is consequence-weighted and evidence-weighted. A correct guess with zero evidence cannot receive Safety 100.
- Balanced Operator requires at least 80 Evidence quality and no evidence-deficit decisions.

### Practice teaches before the scored queue

- Three authored practice cases are now reachable.
- The cases arrive one at a time and cover Approve, Correct, and Escalate.
- Each case names the intended practice action after the player reviews the evidence.
- Practice awards no score and no XP.
- The scored campaign is locked until practice is complete, unless an active campaign or legacy completion already exists.
- The unfinished Daily mode is no longer promoted.

### Queue information must be trustworthy

- Every queue card shows an exact due label.
- The header reports the exact nearest interval and counts every case sharing it.
- Seed 6240 at tick 0 now reports two cases due in two ticks.
- End Shift shows how many cases expire and how many carry before anything changes.

### Results teach the quality of the decision

- Preferred is presented as the best supported call.
- Acceptable is presented as a defensible tradeoff, with the capacity difference explained.
- Unnecessary remains safe but costly.
- Unsafe remains visually and verbally distinct.
- A decision made with incomplete evidence becomes an unverified decision, even when the selected action would otherwise be preferred.

## Implementation summary

### Engine and scoring

- Added `evidence-required` as a typed engine error.
- Added explicit `acceptEvidenceDeficit` input.
- Stored required, missing, and accepted-deficit evidence facts in each resolution.
- Replaced click-based evidence inspection with required-evidence quality.
- Added complete-evidence case and evidence-deficit decision counts.
- Added practice mode scheduling and one-shift completion.
- Updated deterministic replay to reproduce evidence-deficit decisions.
- Added due-summary and shift-end forecast presentation policies.

### Persistence and input safety

- Added a versioned active-run record at `pmlab:exception-room:active:v1`.
- Persisted seed, mode, phase, last decision, and deterministic history.
- Replayed stored history before recovery and cleared malformed or tampered state.
- Restored selected cases, evidence, reveal state, and debrief state after refresh.
- Added a synchronous decision lock so rapid activation cannot create a second engine call, false error, or duplicate analytics event.

### First-run and portfolio experience

- Added a practice-first entry path.
- Removed the public Daily placeholder.
- Added a three-step explanation of Inspect, Decide, and Learn.
- Added `/exception-room/about` with the evidence, authority, queue, scoring, and implementation story.
- Gated deterministic preview state behind `NEXT_PUBLIC_ENABLE_EXCEPTION_PREVIEW`.

### Accessibility and feedback

- Moved focus into decision-detail pickers, result headings, shift confirmation, the next queue, and the debrief.
- Added a polite live region for evidence, result, queue, and shift updates.
- Kept both progressbars programmatically named.
- Removed text truncation from evidence summaries and increased decision-critical type sizes.
- Hid internal scrollbars consistently while preserving touch, wheel, and keyboard scrolling.
- Connected Exception Room to the shared Sound and Haptics preferences.
- Repaired the shared Field test kicker contrast and removed the Exception Room Axe expected-failure marker after a fresh passing scan.

## Interaction audit after remediation

| Step | Description | Health | Evidence |
| --- | --- | --- | --- |
| 1 | Understand the premise and three-step loop | Healthy | Entry assertions and screenshot 01 |
| 2 | Start or resume practice | Healthy | Practice browser test |
| 3 | Complete Approve, Correct, and Escalate practice cases | Healthy | Three-case browser path and no-XP assertion |
| 4 | Unlock or resume the scored campaign | Healthy | Entry state and active-run tests |
| 5 | Read exact queue deadlines | Healthy | Seed 6240 unit and browser assertions |
| 6 | Open a case and retain selection | Healthy | Refresh recovery test |
| 7 | Read the case summary and AI recommendation | Healthy | Responsive test and screenshot 02 |
| 8 | Inspect complete required evidence | Healthy | Engine, component, and browser assertions |
| 9 | Decide with missing evidence | Healthy | Confirmation, engine rejection, and screenshot 03 |
| 10 | Compare preferred, acceptable, unnecessary, unsafe, and unverified feedback | Healthy | Component assertions and screenshots 04 to 06 |
| 11 | Continue to the changed queue | Healthy | Focus and live-region browser assertions |
| 12 | End a shift intentionally | Healthy | Forecast policy, dialog assertion, and screenshot 07 |
| 13 | Refresh an active review or reveal | Healthy | Deterministic replay and browser refresh assertions |
| 14 | Use Sound and Haptics preferences | Healthy | Instrumented browser feedback assertion |
| 15 | Review profile, scores, guidance, and decision trace | Healthy | Scoring tests and screenshots 08 and 09 |
| 16 | Understand the product and engineering rationale | Healthy | About route health and screenshot 10 |
| 17 | Use the flow at narrow zoom and centered desktop presentation | Healthy with long internal scroll | Screenshots 11 and 12 plus responsive suite |

## Automated evidence

### Unit and component suite

Command: `npm test -- --run`

Result: 49 files passed, 266 tests passed.

Coverage in this slice includes:

- evidence enforcement and explicit deficit acceptance
- zero-evidence profile and Safety protection
- one-item evidence-quality protection
- practice sequencing and all three action families
- seed 6240 deadline count
- shift-end forecast
- deterministic active-run replay and corrupt-state recovery
- duplicate-decision lock
- evidence confirmation UI
- focus entry into the correction picker
- distinct preferred and acceptable presentation
- unverified result presentation
- debrief evidence impact and decision trace

### Static and production gates

- `npm run lint`: passed with no errors or warnings.
- `npm run build`: passed.
- Next.js generated the full 16-page build set, including `/exception-room/about` and the dynamic `/exception-room/play` route.
- `git diff --check`: passed.
- The source and QA copy scan found no em dash or en dash characters.

### Full browser suite

Command: `npm run test:e2e -- --workers=2`

Result: 94 tests passed under the Playwright result model.

- 91 healthy contracts passed directly.
- 3 unrelated expected failures remain executable.
- Exception Room entry Axe scan passed with no serious or critical violations.
- Exception Room active review and reveal recovery passed.
- Exception Room rapid duplicate input passed with one reveal and no false error.
- Browser console, page error, and failed-request fixtures remained clean.

Remaining expected failures:

1. Significant entry contrast
2. Ship It entry contrast
3. Hub drag-wrapper keyboard stop

## Rendered evidence

All screenshots were captured from the rebuilt production server and opened for visual inspection.

1. `docs/qa/evidence/slice-4/01-entry-practice-first-390x844.png`
2. `docs/qa/evidence/slice-4/02-selected-case-evidence-390x844.png`
3. `docs/qa/evidence/slice-4/03-evidence-deficit-confirmation-390x844.png`
4. `docs/qa/evidence/slice-4/04-unverified-result-390x844.png`
5. `docs/qa/evidence/slice-4/05-preferred-result-390x844.png`
6. `docs/qa/evidence/slice-4/06-acceptable-result-390x844.png`
7. `docs/qa/evidence/slice-4/07-end-shift-forecast-390x844.png`
8. `docs/qa/evidence/slice-4/08-debrief-top-390x844.png`
9. `docs/qa/evidence/slice-4/09-decision-trace-390x844.png`
10. `docs/qa/evidence/slice-4/10-about-390x844.png`
11. `docs/qa/evidence/slice-4/11-selected-case-195x422.png`
12. `docs/qa/evidence/slice-4/12-entry-desktop-1200x900.png`

The first rendered pass exposed two defects that the assertions did not: confirmation actions could land below the fold, and the programmatically focused debrief heading showed a browser outline. Both were corrected before the evidence set was accepted and recaptured.

## Evidence limits

- Automated accessibility coverage used Axe on the public entry. Keyboard focus was exercised through the core loop, but this slice did not include a manual VoiceOver session.
- Sound was verified through an instrumented browser `AudioContext`, not physical speakers.
- Haptics were verified through an instrumented `navigator.vibrate`, not physical phone hardware.
- At the 195 by 422 zoom proxy, the flow remains operable through one internal scroll region, but it requires substantial vertical scrolling. This is recorded as a reflow cost, not a blocked interaction.

## Boundary

No commit, push, pull request, merge, deployment, or publication occurred. The branch remains local and dirty with the cumulative Slice 0 through Slice 4 work.

The next remediation boundary is the hub and remaining shared issues: remove the inert drag-wrapper keyboard stop, repair Significant and Ship It entry contrast, and finish the cross-product metadata and portfolio-return audit.
