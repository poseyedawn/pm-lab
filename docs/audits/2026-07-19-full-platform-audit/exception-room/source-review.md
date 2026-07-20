# Exception Room source review

These findings record the source-review stage. Fresh visual evidence and final browser outcomes are reconciled in `evidence-log.md` and `../FINDINGS-REGISTER.md`.

## Strengths

### EXC-S01: The landing page communicates operational stakes

The entry names the AI-operations context, makes the operator responsible for the outcome, states the 8-minute and 12-case commitment, explains three shifts and finite capacity, and discloses that all cases are synthetic.

### EXC-S02: The decision engine has meaningful consequence mechanics

Evidence inspection is tracked separately, actions have different capacity costs, correction and escalation can require a detail choice, time advances after resolution, unresolved work can expire, and the final profile balances Safety, Service, and Capacity.

### EXC-S03: Disabled decisions are backed by engine validation

The UI disables actions that cost more capacity than remains, while the engine independently rejects the same invalid decision. This is good defense in depth.

## Risks

### EXC-P1-01: The advertised 8-minute campaign is not recoverable

Severity: `P1` completion and trust risk.

The random seed and entire run live only in client component state. Refreshing, closing, or navigating back mid-campaign creates a new run. There is no resume, warning, draft, or recovery state.

### EXC-P1-02: The landing page visibly advertises an unfinished mode

Severity: `P1` portfolio completeness risk.

The Daily queue card says `SOON` and `A shared case mix is coming next.` On a portfolio surface presented as three built games, this reads as an unfinished product rather than deliberate scope unless the surrounding explanation reframes it.

### EXC-P2-01: Exception Room has no design or case-study route

Severity: `P2` portfolio credibility gap.

Significant and Ship It each include a How this game was designed page. Exception Room has no equivalent route, despite being the game with the strongest AI-operations and human-in-the-loop story for an experienced PM or engineer.

### EXC-P2-02: Ending a shift is consequential but has no explanation or confirmation

Severity: `P2` decision clarity risk.

The End Shift action immediately expires or carries over unresolved work through the engine. The button does not state the consequence, summarize remaining cases, or ask for confirmation.

### EXC-P2-03: Decision-detail transitions do not manage focus or announce context

Severity: `P2` keyboard and screen-reader risk.

Choosing Correct or Escalate can replace the three decision buttons with a detail picker. The implementation does not move focus into the picker, announce its new heading, or restore focus after Back.

### EXC-P2-04: Resolution and queue changes lack explicit live announcements

Severity: `P2` screen-reader risk.

The reveal screen has no status or live-region semantics. Continuing replaces it with a changed queue, capacity value, and tick without an explicit summary announcement.

### EXC-P2-05: The capacity progressbar has no programmatic name

Severity: `P2` accessibility risk.

The parent section is labeled for the shift, but the nested progressbar itself exposes min, max, and current values without an `aria-label` or `aria-labelledby` relationship.

### EXC-P1-03: Required evidence is not required by the engine

Severity: `P1` core-mechanic and assessment-validity risk.

Every case declares `requiredEvidenceIds`, but `resolveCase()` checks only availability, action detail, and remaining capacity. A case can be resolved without opening any evidence. The final evidence inspection rate counts any one opened item rather than required or complete evidence.

See `content-review.md` for the product-learning impact.

### EXC-P1-07: Balanced Operator can be awarded with zero evidence review

Severity: `P1` assessment-validity and AI-oversight credibility risk.

`scoreRun()` calculates an evidence inspection rate for the debrief, but `profileForFacts()` does not receive or use it. The strongest balanced profile depends on Safety, Service, Capacity, and one unsafe-approval flag only.

A production-engine diagnostic found nine evidence-free random-policy runs that received Balanced Operator across 10,000 seeds. Seed 6,240 received Safety 100, Service 100, Capacity 96, resolved all 12 cases, and received Balanced Operator with an evidence inspection rate of 0 percent.

See `policy-simulation.md` for method, caveats, and reproduction seeds.

### EXC-P1-04: Deadline status can state the wrong timing and count

Severity: `P1` core information-accuracy risk.

`CapacityHeader` receives the nearest due interval but renders `1 CASE DUE NEXT TICK` for every positive value. A case due in three ticks is therefore announced as due next tick. The header also hardcodes a single case and does not count cases sharing that deadline.

The queue and case-review components do not display each case's actual due tick, even though the scheduled case data contains it and `dueLabel()` already supports accurate copy.

### EXC-P1-05: Authored practice cases are disconnected from the application

Severity: `P1` first-time usability risk.

`PRACTICE_CASES` defines a clean example for each decision family, but no production route or component imports it. The campaign starts with three live cases and no interactive tutorial.

### EXC-P2-06: Rapid duplicate decisions can produce a false error and duplicate analytics

Severity: `P2` input-race and data-quality risk.

The decision handler gates on React phase state rather than a synchronous ref. Two taps before the reveal render can attempt two resolutions. The engine safely rejects the second, but the UI can surface a `case unavailable` error after a valid first decision, and the wrapper records both analytics submissions.

Browser verification required: double-tap Approve and a detail choice on a throttled mobile session.

### EXC-P2-07: The sound control has no game feedback to control

Severity: `P2` setting-promise and completeness risk.

Exception Room reads and displays the Sound preference, but no Exception Room interaction calls the sound service. Toggling sound changes the icon and stored preference without changing the campaign experience.

### EXC-P1-06: The primary evidence is visually compressed below a credible reading threshold

Severity: `P1` comprehension and accessibility risk.

Evidence:

- `src/app/exception-room/exception-room.css:172` hides the case summary entirely.
- `src/app/exception-room/exception-room.css:175-187` renders the AI label, evidence heading, evidence summary, and related status copy at 8 to 10 pixels.
- The evidence summary is clamped to one line even though authored summaries can contain the detail that distinguishes a safe approval from a correction or escalation.
- `src/components/exception-room/CaseReview.tsx:64-89` confirms that the hidden case summary and clamped evidence summaries are the primary written evidence available before a scored decision.

Impact: the central activity is evidence-based exception triage, but the evidence is the smallest and most truncated content in the decision surface. A player may be pushed toward reading the AI recommendation and guessing instead of inspecting the operational facts. This also creates a material text-resizing and low-vision risk.

Browser verification required: capture the longest evidence titles and summaries at 390 x 844, 200 percent zoom, and increased browser text size. Confirm whether the full evidence can be reached by any interaction or accessible name.

### EXC-P2-08: Reveal and debrief scrolling omit the game's scrollbar treatment

Severity: `P2` mobile presentation consistency risk.

Evidence:

- `src/app/exception-room/exception-room.css:62-64` hides scrollbars for the entry and run scroll regions.
- `src/app/exception-room/exception-room.css:216-217` creates separate overflow containers for reveal and debrief without the same Firefox or WebKit scrollbar rules.

Impact: the two longest result states can expose an internal scrollbar even though the mobile-first platform deliberately hides scrollbars elsewhere. This is especially likely inside the fixed-height desktop mobile canvas.

Browser verification required: force a long consequence and a complete debrief at 390 x 844 and 1200 x 900, then inspect both WebKit and Firefox behavior.
