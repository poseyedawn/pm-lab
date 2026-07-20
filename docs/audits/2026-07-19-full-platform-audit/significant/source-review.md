# Significant source review

These findings record the source-review stage. Fresh visual evidence and final browser outcomes are reconciled in `evidence-log.md` and `../FINDINGS-REGISTER.md`.

## Strengths

### SIG-S01: First-time onboarding is an intentional flow

The entry screen explains the three-step loop, identifies simulated data, estimates about 30 seconds, and sends first-time visitors into calibration before the campaign.

### SIG-S02: Correct and incorrect results are structurally different

The correct branch uses the medal, XP, optional critical insight, win sound, vibration, and confetti. The incorrect branch uses the separate review-signal asset, a Your call versus Better call comparison, a What to notice explanation, loss feedback, and no confetti.

### SIG-S03: Campaign and daily rewards are protected from duplicate continuation

The round component rejects duplicate decisions and guards its continuation callback. Calibration baseline XP and daily completion are idempotent in persistent state.

## Risks

### SIG-P2-01: The calibration query can bypass the intended first decision

Severity: `P2` onboarding and data-quality risk.

`/significant/calibration?call=ship`, `kill`, or `keep` renders a completed result, records decision analytics, and marks calibration complete without the visitor making a choice on screen.

### SIG-P2-02: Valid but malformed saved state can break campaign rendering

Severity: `P2` resilience risk.

The Significant state loader validates JSON syntax only. A stored `campaign` value with the wrong type, or non-numeric XP and streak values, can reach hooks that assume the full TypeScript shape.

### SIG-P2-03: The chart's accessible description is too generic for independent interpretation

Severity: `P2` accessibility risk.

The SVG is named only `Daily conversion rate, control vs variant`. The surrounding card exposes totals, lift, confidence interval, and p-value, which preserves the core decision data, but the chart itself does not summarize the trend or endpoints for a non-visual user.

Browser verification required: confirm the actual screen-reader reading order and whether the surrounding values make the decision equivalent without the line shape.

### SIG-P1-01: Winner's curse grades hidden truth instead of observable evidence

Severity: `P1` learning integrity and expert credibility risk.

The case shows day 3 of a planned 14-day test with a tiny sample and an inflated positive result. The correct answer is coded as Kill because the simulator knows true lift is zero. The player does not know that truth. The evidence supports not shipping yet, but it does not justify killing rather than continuing or replicating.

See `content-review.md` for the curriculum impact.

### SIG-P1-02: Calibration gives Kill the wrong decision definition

Severity: `P1` onboarding and learning-language risk.

The first decision labels Kill as `Not enough evidence`, while Keep Running says `More data could change it`. Those descriptions collapse the difference between rejecting a product decision and continuing an inconclusive test.

### SIG-P2-04: Dynamic result screens do not restore keyboard focus

Severity: `P2` keyboard and screen-reader risk.

After a call, the focused decision button is removed and replaced by a live result section. Neither the campaign nor calibration flow moves focus to the result heading or Continue action. The live region may announce the result, but a keyboard user can lose a predictable focus position.

Browser verification required: submit each call by keyboard and inspect active element, announcement order, and the next Tab target.
