# Ship It interaction inventory

All 31 cases were executed against the local production build at commit `d608c67` using Chromium through the user-approved Playwright fallback. Results are recorded in `evidence-log.md`.

| ID | Interaction or state | Required evidence |
| --- | --- | --- |
| SHIP-01 | Entry at `/ship-it` | Goal, rules, meter meaning, death condition, time expectation |
| SHIP-02 | Free run card | CTA clarity, prior-best state, transition |
| SHIP-03 | Daily run card | Shared-seed explanation, streak, prior-best state |
| SHIP-04 | About page and return | Product rationale, technical credibility, route clarity |
| SHIP-05 | Free-run initial card | Week, product, meter, dilemma, and choice comprehension |
| SHIP-06 | Left choice button | Feedback, meter deltas, next-card transition, sound and haptics |
| SHIP-07 | Right choice button | Feedback, meter deltas, next-card transition, sound and haptics |
| SHIP-08 | Swipe or drag left | Threshold, affordance, cancellation, consistency with button |
| SHIP-09 | Swipe or drag right | Threshold, affordance, cancellation, consistency with button |
| SHIP-10 | Low-meter warning | Perceptibility, urgency, non-color signal, heartbeat preference |
| SHIP-11 | Overshoot above 85 | Backlash explanation, fairness, meter causality |
| SHIP-12 | Authored arc continuation | Earlier-choice recall, consequence clarity, narrative continuity |
| SHIP-13 | Users meter failure | Failure dialog, cause, route to review |
| SHIP-14 | Business meter failure | Failure dialog, cause, route to review |
| SHIP-15 | Team meter failure | Failure dialog, cause, route to review |
| SHIP-16 | Tech meter failure | Failure dialog, cause, route to review |
| SHIP-17 | Complete twelve-week quarter | End transition, reward tone, no duplicate completion |
| SHIP-18 | Quarterly review | Rating explanation, prose credibility, meters, XP |
| SHIP-19 | Share success and failure | Clipboard content, feedback, fallback behavior |
| SHIP-20 | Run it back | Fresh seed, state reset, best rating and XP persistence |
| SHIP-21 | Daily first run | Deterministic seed, complete loop, streak update |
| SHIP-22 | Daily completion during same visit | Review remains visible, share remains available |
| SHIP-23 | Daily already completed | Countdown, free-run escape, home return |
| SHIP-24 | Refresh during active run | State loss or retention, explanation, analytics duplication |
| SHIP-25 | Back navigation during active run | Accidental loss, confirmation expectations, recovery |
| SHIP-26 | Keyboard-only complete loop | Focus order, button parity, meter announcements |
| SHIP-27 | Reduced-motion complete loop | Card transitions, review animation, failure animation |
| SHIP-28 | Choice-effect comprehension | Whether meter direction, magnitude, and rationale are learnable |
| SHIP-29 | Legal, ethical, accessibility, and security cards | Whether hard boundaries are framed as constraints or ordinary trades |
| SHIP-30 | High rating after integrity-risk choices | Rating credibility and model explanation |
| SHIP-31 | Emoji avatar and meter rendering | Cohesive art direction, alignment, cross-platform consistency, non-placeholder feel |
