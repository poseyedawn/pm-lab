# Ship It source review

These findings record the source-review stage. Fresh visual evidence and final browser outcomes are reconciled in `evidence-log.md` and `../FINDINGS-REGISTER.md`.

## Strengths

### SHIP-S01: The deterministic engine models real product tradeoffs

Runs are seeded, choices update four bounded meters, previous decisions set flags, overshoot cards punish single-metric optimization, and pending arcs can extend the quarter. This gives the game an explainable system rather than a cosmetic score.

### SHIP-S02: Buttons preserve the core loop when gesture motion is unavailable

Every dilemma has explicit left and right choice buttons. Swipe is an enhancement rather than the only way to act.

### SHIP-S03: Run-end rewards are guarded

The run-end effect fires once per mounted run, daily XP is guarded by the played date, and Run it back remounts with a fresh seed.

## Risks

### SHIP-P1-01: Active runs are not recoverable

Severity: `P1` completion and trust risk.

The complete run exists only in `useShipRun` component state. The free-run page creates a new random seed at mount, and neither the seed nor current run is saved. Refreshing, closing, or leaving a run discards every prior choice without warning.

Impact: a visitor can lose up to twelve or more decisions near the end of a quarter. This is especially damaging in a portfolio experience where interruptions and back navigation are common.

### SHIP-P1-02: Haptics and manual motion preferences are not wired into the game

Severity: `P1` accessibility failure.

See `cross-product/source-review.md` findings SRC-P1-01 and SRC-P1-02.

### SHIP-P2-01: Meter changes are not announced

Severity: `P2` accessibility risk.

The four bars have semantic meter roles and current values, but the animated delta text has no live region. After a choice, focus moves with the card while a screen-reader user receives no guaranteed announcement of which meters changed or by how much.

### SHIP-P2-02: Failure behaves like a modal without modal focus behavior

Severity: `P2` keyboard and screen-reader risk.

The full-screen failure layer uses `role="alertdialog"` but does not set `aria-modal`, move focus to its action, restore focus afterward, or prevent focus from reaching the obscured page.

### SHIP-P2-03: Low-meter audio checks the pre-choice state

Severity: `P2` feedback timing risk.

The choice handler calls the state update, then checks `run.meters` from the previous render. A choice that newly pushes a meter below 20 may not trigger the heartbeat until the next choice, while a choice that recovers a low meter may still trigger it once more.

### SHIP-P2-04: The entry page does not state an expected duration

Severity: `P2` portfolio conversion risk.

The page explains twelve weeks and four meters, but does not translate that into a likely time commitment. Significant says about 30 seconds and Exception Room says 8 minutes, so Ship It is the only game asking for a run without a comparable expectation.

### SHIP-P1-03: The score model does not encode hard integrity boundaries

Severity: `P1` product judgment and portfolio trust risk.

The deck includes consent, authentication, accessibility, dark-pattern, and prospect-integrity decisions. The engine treats them only as meter deltas, while the rating function checks survival, final balance, and resolved arcs. There is no integrity state that prevents an unsafe path from earning a top rating.

See `content-review.md` for the affected cards and learning impact. See `policy-simulation.md` for a production-engine diagnostic in which 1,926 of 9,699 runs containing classified integrity-risk choices received Promoted or CEO-in-waiting.

### SHIP-P2-05: Core visual identity depends on operating-system emoji

Severity: `P2` portfolio art-direction and cross-platform consistency risk.

All 51 authored cards use one of eleven emoji avatars. The four primary meters, failure state, review, daily streak, and shield also use emoji as recurring visual identifiers.

Impact: emoji glyphs change shape, color, weight, alignment, and sometimes meaning across Apple, Google, Microsoft, and browser rendering stacks. Ship It's most repeated character and meter imagery can therefore look different from the approved game world and less authored than the hub and Significant assets.

Browser verification required: compare the same entry, dilemma, failure, and review states in the user's browser and a second rendering engine before deciding whether the emoji feel intentional or placeholder-like.
