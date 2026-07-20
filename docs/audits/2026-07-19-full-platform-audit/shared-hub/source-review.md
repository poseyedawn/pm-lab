# Shared hub source review

These findings record the source-review stage. Fresh visual evidence and final browser outcomes are reconciled in `evidence-log.md` and `../FINDINGS-REGISTER.md`.

## Strengths

### HUB-S01: The hub is a real collection surface, not a list of links

The hub uses approved game artwork, a dedicated Product Lab lockup, individual play controls, per-game XP, ambient motion, and bounded card drag. The three entries are exposed as an ordered game navigation rather than generic marketing cards.

### HUB-S02: Motion is decorative and has a non-motion path

Each game card remains a normal link. The manual and system reduced-motion result is passed into the hub, which disables idle floating and drag without removing navigation.

### HUB-S03: Drag and tap are intentionally separated

The card records a drag start, prevents the following click from navigating, snaps to its origin, and restores normal tapping after a short guard window. This is a useful mobile input safeguard.

## Risks

### HUB-P1-01: The card interaction can block vertical touch scrolling

Severity: `P1` mobile navigation and accessibility risk.

The drag wrapper uses two-axis drag and `touch-action: none`. Because most of the hub is covered by three large cards, a visitor who starts a vertical gesture on a card may move the card instead of scrolling the collection.

Impact: short viewports, browser chrome, large text, and zoom can make lower content unreachable or unusually difficult to reach even though the frame itself is scrollable.

Browser verification required: start vertical scrolling from the center, copy area, and play control of each card at 390 x 844, 430 x 932, and 200 percent zoom.

### HUB-P2-01: The Significant card does not describe its actual mechanic

Severity: `P2` first-time comprehension risk.

`Trust your product instinct` is inviting, but it does not tell a first-time portfolio visitor that the game is about interpreting experiment readouts and statistical traps. Ship It and Exception Room communicate more of their setting and decision model in the card copy.

Browser verification required: judge whether the art and title supply enough missing context before changing the tagline.

### HUB-P2-02: Product value is visible, but portfolio evidence is deferred

Severity: `P2` portfolio conversion risk.

The hub explains that the collection makes product judgment visible, but it does not preview the specific capability each game demonstrates. A reviewer must enter a game and, for two games, find a secondary design page before seeing the system rationale.

Impact: a time-limited hiring reviewer may interpret the work as polished entertainment without reaching the evidence of experiment design, deterministic systems, or AI operations judgment.
