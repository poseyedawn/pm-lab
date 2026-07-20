# Product Lab Slice 2 browser QA inventory

## Slice goal

Make every Significant answer defensible from the evidence shown before the decision, then save the decision and its result before the reveal appears.

## Product claims

1. Ship means the visible evidence supports a meaningful release and the test is operationally safe to trust.
2. Kill means the visible evidence supports stopping the tested treatment or rejecting the current version.
3. Keep Running means the evidence remains unresolved, more data can realistically change the call, and continued exposure is acceptable.
4. The calibration teaches all three definitions through three short rounds, one for each correct action.
5. The Winner's Curse case grades Keep Running because the visible day 3 evidence rejects an early launch but does not justify abandoning the treatment.
6. Hidden simulated truth can explain a case after the decision, but it never changes which action the visible evidence supports.
7. A campaign decision records the call, attempt, stars, streak, XP, critical bonus, and reveal seed before the reveal renders.
8. Refreshing a reveal restores the same call, result, XP, critical bonus, and explanation without adding another attempt or rerolling a reward.
9. Continuing from a restored reveal clears only that pending reveal and does not duplicate progress.
10. A calibration URL query cannot select an answer, grant XP, or complete calibration.
11. Confetti exists only while a successful result is mounted. Navigation or a new result removes it.
12. Every experiment chart has an accessible description with the first and last control and variant rates, trend direction, daily uncertainty overlap, duration, and sample totals.

## Decision policy matrix

| Call | Player-facing definition | Calibration example | Campaign evidence contract |
| --- | --- | --- | --- |
| Ship | Release because the effect is meaningful and the experiment is safe to trust | Full-duration clean win | Positive effect, trustworthy run, and uncertainty clears the release threshold |
| Kill | Stop this version because the evidence supports harm or a treatment that should not continue | Full-duration clean loss | Harm, persistent decay, or valid evidence that this treatment should stop |
| Keep Running | Wait because more valid evidence or a corrected rerun can still change the decision | Underpowered result | Early, underpowered, contaminated, or invalid readout where continued testing or rerun is acceptable |

## State transition matrix

| Surface | Action | Required stored state before reveal | Refresh expectation | Continue expectation |
| --- | --- | --- | --- | --- |
| Calibration round 1 | Any decision | Current step and selected call | Same reveal returns | Advance to round 2 |
| Calibration round 2 | Any decision | Current step and selected call | Same reveal returns | Advance to round 3 |
| Calibration round 3 | Any decision | Current step and selected call | Same reveal returns | Complete calibration once |
| Campaign correct | Decision | Attempt, stars, streak, XP, call, critical bonus, seed | Same successful reveal returns | Clear reveal and return to path |
| Campaign miss | Decision | Attempt, zero XP, call, seed | Same review reveal returns | Clear reveal and return to retry path |
| Daily correct or miss | Decision | Date, streak result, XP, call, critical bonus, seed | Completed daily state remains stable | Open daily summary once |

## Functional walkthroughs

1. Start with empty storage and complete the Ship, Kill, and Keep Running calibration rounds. Confirm the progress label advances from 1 of 3 through 3 of 3 and each correct call grants 20 XP.
2. Replay calibration from a returning account. Confirm all three rounds run, replay XP is not granted, and campaign progress is unchanged.
3. Open campaign level 3. Read only the evidence shown before the call, choose Keep Running, and confirm the result says that the decision matches the evidence.
4. Make a wrong campaign decision, inspect saved state before using the result CTA, reload, and confirm the same review returns with the attempt already recorded.
5. Make a correct campaign decision, capture the saved XP and critical flag, reload twice, and confirm the result and totals remain identical.
6. Continue from a restored campaign reveal and confirm the pending reveal clears without changing attempt, stars, streak, or XP.
7. Open `/significant/calibration?call=ship`, `/significant/calibration?call=kill`, and `/significant/calibration?call=keep`. Each URL must show an undecided calibration round and leave storage unchanged.
8. Complete a successful result, navigate to a wrong result, and confirm no prior confetti canvas covers or accompanies the review state.
9. Inspect chart roles and accessible names on calibration, Winner's Curse, novelty, and Simpson's paradox readouts.

## Viewport and visual evidence

Capture and inspect these states at 390 x 844:

- calibration rounds 1, 2, and 3 before a decision;
- one correct and one review calibration reveal;
- Winner's Curse readout and correct reveal;
- campaign review reveal after refresh;
- campaign successful reveal after refresh;
- wrong reveal immediately after a previous successful result.

Repeat representative calibration, Winner's Curse, and review states at:

- 430 x 932 mobile large;
- 1200 x 900 desktop with a measured 390-pixel centered canvas;
- 195 x 422 zoom simulation with no horizontal overflow and the required action reachable by vertical scroll.

## Exploratory scenarios

1. Choose a campaign action and reload as soon as the reveal appears. Repeat with the browser Back and Forward controls. The attempt and reveal must remain coherent.
2. Dispatch two rapid clicks on different campaign decisions. Exactly one call, one attempt, one reward calculation, and one reveal may survive.
3. Open each production calibration query shortcut from empty storage, refresh, and navigate away. No answer or progress may be created.
4. Earn a correct result with confetti, continue, then deliberately miss the next case. Inspect the DOM and screenshot for stale canvases or celebratory particles.
5. Refresh each calibration reveal, then continue. The sequence must advance by one round and the stored per-call XP must not change.

## Accessibility checks

- Decision definitions are visible and identical in calibration and campaign guidance.
- Each chart role has a meaningful accessible name without relying on the later answer explanation.
- The chart description includes endpoints, direction, uncertainty overlap, day count, and sample totals.
- Dynamic result headings receive predictable focus after a decision and after a restored reveal.
- Correct and review results remain distinguishable without color, art, sound, haptics, or particles.

## Expected test evolution

- Remove the `SIG-STATE-01` expected-failure marker only after all three query values remain undecided in a production build.
- Remove the `SIG-STATE-02` expected-failure marker only after a refresh restores the committed reveal and the stored attempt cannot be bypassed.
- Add regression checks for the three-round calibration, Winner's Curse policy, stable restored rewards, chart descriptions, and confetti cleanup.
- Preserve unrelated expected failures for later slices.

## Local-only signoff boundary

- Chromium and the project-owned Playwright fallback provide the automated evidence for this slice.
- Browser screenshots must be opened and inspected. Numeric fit checks alone are not visual signoff.
- Safari, physical mobile devices, physical haptics, speaker output, and screen-reader speech remain outside this local pass.
- This slice does not authorize a commit, push, pull request, merge, deployment, or publication.
