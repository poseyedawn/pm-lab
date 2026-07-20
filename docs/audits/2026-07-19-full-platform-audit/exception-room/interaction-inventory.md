# Exception Room interaction inventory

All 40 cases were executed against the local production build at commit `d608c67` using Chromium through the user-approved Playwright fallback. Results are recorded in `evidence-log.md`.

| ID | Interaction or state | Required evidence |
| --- | --- | --- |
| EXC-01 | Entry at `/exception-room` | Operational goal, rules, stakes, synthetic-data disclosure |
| EXC-02 | Entry sound toggle | State, label, persistence, run-header consistency |
| EXC-03 | Start or rerun campaign | CTA state, transition, seed and progress behavior |
| EXC-04 | Locked daily queue card | Non-interactive semantics, expectation setting, visual affordance |
| EXC-05 | Initial shift header and capacity | Shift, capacity, due pressure, sound status comprehension |
| EXC-06 | Queue scan | Severity, route reason, due state, selected state, ordering |
| EXC-07 | Open each queue-card type | Selection feedback, scroll position, case-title continuity |
| EXC-08 | Read AI recommendation | Model-versus-human responsibility clarity |
| EXC-09 | Inspect supporting evidence | Reviewed counter, cost or time consequence, selected state |
| EXC-10 | Inspect conflicting evidence | Risk salience, explanation, reviewed counter |
| EXC-11 | Inspect missing evidence | Missing-state clarity, reviewed counter, decision impact |
| EXC-12 | Approve decision | Capacity cost, immediate submission, reveal transition |
| EXC-13 | Correct decision picker | Option meaning, Back action, selected detail, submission |
| EXC-14 | Escalate destination picker | Destination meaning, Back action, selected detail, submission |
| EXC-15 | Disabled decision due to capacity | Disabled semantics, reason, recovery path |
| EXC-16 | Preferred outcome reveal | Judgment explanation, protected outcome, learning signal |
| EXC-17 | Acceptable outcome reveal | Nuance, consequences, learning signal |
| EXC-18 | Unnecessary outcome reveal | Safe-but-costly framing, capacity lesson, emotional tone |
| EXC-19 | Unsafe outcome reveal | Clear failure framing, rationale, no celebratory leakage |
| EXC-20 | Continue after reveal | Queue mutation, capacity, tick, selection reset |
| EXC-21 | End shift early | Consequence, shift progression, capacity reset, unresolved cases |
| EXC-22 | Complete all three shifts | Debrief transition, no duplicate completion, XP persistence |
| EXC-23 | Debrief scorecard | Profile, Safety, Service, Capacity, evidence rate, credibility |
| EXC-24 | Run a new queue | Fresh seed, reset, progress state, analytics start event |
| EXC-25 | Back to briefing | Campaign-complete CTA, progress persistence |
| EXC-26 | Run-title back link mid-shift | Accidental loss, recovery expectation, route behavior |
| EXC-27 | Engine error state | Visible message, actionable recovery, no dead end |
| EXC-28 | Refresh during review and reveal | State loss or retention, duplicate decisions, seed behavior |
| EXC-29 | Keyboard-only queue and decision loop | Focus order, pressed states, picker focus, announcements |
| EXC-30 | 390 x 844 long-content behavior | Internal scroll, sticky controls, no hidden decision action |
| EXC-31 | First-time instruction or practice | Whether the three actions and evidence model are taught before scoring |
| EXC-32 | Multi-tick and same-tick deadlines | Accurate timing, case count, prioritization support |
| EXC-33 | Decision without opening evidence | Whether the action is allowed and how the debrief scores it |
| EXC-34 | Open one non-required evidence item | Whether inspection score overstates review quality |
| EXC-35 | Rapid duplicate decision | Single reveal, no false error, one analytics event |
| EXC-36 | Sound on and off through a complete case | Audible difference and control credibility |
| EXC-37 | Shift transition | New shift announcement, capacity reset, carryover explanation |
| EXC-38 | Long evidence and case-summary legibility | Full fact access, truncation, text size, zoom reflow, accessible name |
| EXC-39 | Reveal and debrief internal scrolling | Full content access, hidden scrollbar, preserved mobile-canvas presentation |
| EXC-40 | Evidence-free Balanced Operator path | Profile credibility, evidence-rate salience, assessment-model consistency |
