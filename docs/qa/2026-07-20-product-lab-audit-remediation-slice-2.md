# Product Lab audit remediation, Slice 2

**Date:** 2026-07-20

**Branch:** `codex/product-lab-audit-remediation`
**Scope:** Repair Significant's decision policy, calibration sequence, result persistence, chart descriptions, and result effects.

## Outcome

Slice 2 is complete locally. Significant now scores the evidence available before a decision, teaches one stable meaning for each call, stores each result before the reveal appears, and restores that exact result after refresh.

No commit, push, pull request, merge, preview deployment, or production deployment was performed.

## Decision policy

| Call | Stable meaning |
| --- | --- |
| Ship | The visible evidence supports a meaningful release, and the experiment is safe to trust. |
| Kill | The visible evidence supports stopping the tested treatment or rejecting the current version. |
| Keep Running | The evidence remains unresolved, more valid evidence can change the call, and continued exposure is acceptable. |

The calibration and campaign now use the same definitions. Hidden simulator values still generate realistic cases, but they do not override the action justified by the visible readout.

## Learning-content repair

- Calibration now contains three real rounds. A clean win teaches Ship, a clean loss teaches Kill, and an underpowered result teaches Keep Running.
- The progress indicator advances from 1 of 3 through 3 of 3 and completes only after the third reveal.
- Correct calibration calls earn 20 XP each. Review calls earn zero XP. Replaying calibration earns zero XP, so the sequence cannot be farmed.
- Winner's Curse now grades Keep Running. The day 3 readout rejects an early launch but does not justify abandoning the treatment.
- Multiple comparisons now grades Keep Running. An unregistered significant metric makes the current readout unresolved, not evidence that the treatment should stop.
- Scored explanations no longer cite hidden true lift or hidden effect values.
- The case-study page now says that Significant scores visible evidence and explains the operational meaning of all three calls.

## Result commit and recovery

Campaign and daily decisions now save a complete result record before React renders the reveal. The stored record contains:

- the selected call;
- whether the call was correct;
- the scenario seed;
- the XP amount;
- the critical insight flag;
- the campaign level or daily date.

Campaign attempts, stars, streak, XP, and the pending reveal are written in one state transition. Refresh restores the same scenario, call, explanation, critical flag, and XP amount. Continuing clears only the pending reveal, so it cannot add another attempt or reward.

Daily play uses the same boundary. A new day replaces any stale pending daily reveal before it records the new result.

Calibration stores the selected call for the active step. Refresh restores the review or correct reveal, and Continue advances exactly one step.

## Query and effect safety

- `/significant/calibration?call=ship`, `kill`, or `keep` no longer selects an answer or changes progress.
- The legacy campaign calibration redirect drops any answer query before it opens calibration.
- Confetti is created inside the mounted successful result. Its cleanup cancels the animation and removes the canvas when the result unmounts.
- A later review result contains no stale confetti canvas.
- Correct and review headings receive focus when their reveal mounts or restores.

## Chart accessibility

Each chart's accessible name now includes:

- the metric name and day count;
- the first and last variant rates;
- the first and last control rates;
- whether each line rose, fell, or stayed near its starting value;
- the number of days where daily 95 percent confidence bands overlap;
- variant and control sample totals.

This evidence is available before the player opens the answer explanation.

## Browser coverage

The Slice 2 functional suite covers:

- all three calibration rounds and one-time progress completion;
- zero XP for review calls and 20 XP for each correct first-run calibration call;
- no XP on calibration replay;
- all three production query values;
- calibration reveal refresh and one-step advancement;
- wrong campaign decision commit before continuation;
- successful reward restoration across repeated refreshes;
- Winner's Curse grading from day 3 evidence;
- chart names with endpoints, trend, uncertainty, and samples;
- confetti cleanup before a later review result;
- daily result commit and refresh recovery;
- rapid duplicate campaign input;
- decision reachability at the 195 by 422 zoom proxy.

The visual suite captures calibration and Winner's Curse at:

- 195 by 422;
- 390 by 844;
- 430 by 932;
- 1200 by 900 with a centered 390-pixel game canvas.

The screenshots were opened and inspected. Calibration stacks its three decisions at 195 pixels, the 390 and 430 mobile layouts preserve the pink game world and full evidence card, and desktop keeps the exact mobile canvas without internal desktop gutters.

## Verification result

- TypeScript: clean.
- Lint: 0 errors and 1 unrelated existing warning in Ship It.
- Unit suite: 46 files and 241 tests passed.
- Production build: all 13 listed app routes compiled and generated.
- Browser suite: 66 checks passed under Playwright's result model.
- Browser contracts: 58 healthy checks and 8 executable expected failures.
- Browser health: no unexpected console, page, or local request failures.
- Source and Slice 2 QA copy: no em dash or en dash characters.
- Diff integrity: `git diff --check` passed.

## Findings closed by this slice

- `SIG-P1-01`: Winner's Curse used hidden truth as the grading authority.
- `SIG-P1-02`: calibration gave Kill the meaning of insufficient evidence.
- `SIG-BP1-01`: successful confetti could survive into a later review.
- `SIG-BP1-02`: refresh could erase a miss and preserve first-try credit.
- `SIG-P2-01`: an answer query could complete calibration.
- `SIG-P2-03`: chart names omitted the evidence needed for an independent call.
- `SIG-BP2-01`: correct and incorrect calibration outcomes showed the same reward.
- `SIG-BP2-03`: calibration promised three rounds but completed after one.

The two corresponding `SIG-STATE-01` and `SIG-STATE-02` expected-failure markers were removed only after the production browser assertions passed.

## Executable expected failures after Slice 2

Eight expected failures remain for later slices:

- serious color contrast on the three game entry routes;
- inert keyboard stops around draggable hub cards;
- Ship It ignoring the Haptics Off preference;
- Ship It active-run reset on refresh;
- Exception Room active-run reset on refresh;
- Exception Room rapid duplicate input showing a false availability error.

The three color-contrast checks run separately, which brings the executable expected-failure total to eight.

## Evidence limits

- Chromium is the only browser in this local pass.
- Physical haptics and speaker output were not verified.
- Screen-reader speech output was not verified.
- Safari, iPhone hardware, and Android hardware remain outside this slice.
- The 195 by 422 viewport is a browser reflow proxy for 200 percent zoom.

## Next boundary

Slice 3 owns Ship It integrity rules and causal feedback. It will separate hard integrity constraints from operating-meter balance and prevent unsafe choices from being framed as acceptable leadership tradeoffs.
