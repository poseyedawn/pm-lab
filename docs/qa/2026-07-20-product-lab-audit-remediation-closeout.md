# Product Lab audit remediation closeout

Date: 2026-07-20

Branch: `codex/product-lab-audit-remediation`

Starting commit: `d608c67`

Status: complete locally, not committed, not pushed, not deployed

## Outcome

The original audit baseline remains preserved in `docs/audits/2026-07-19-full-platform-audit/`. This closeout reconciles every one of its 61 findings against the current local product and executable evidence.

- 21 of 21 P1 findings are closed locally.
- 37 of 38 P2 findings are closed locally.
- `SRC-P2-07` is an accepted, disclosed local-only constraint. Product Lab no longer promises a shared server day.
- 1 of 2 P3 findings is closed locally.
- `SRC-P3-01` is a reviewed upstream dependency advisory with no forced downgrade applied.
- No executable `test.fail()` marker remains.
- The final local gate passes 268 unit and component tests plus 103 Chromium browser checks.

## Hub and shared shell findings

| ID | Status | Local resolution | Primary proof |
| --- | --- | --- | --- |
| `HUB-BP1-01` | Closed | The hub scrolls at the 195 by 422 zoom proxy and every game remains reachable. | `e2e/slice-1-responsive.spec.ts`, `e2e/hub.spec.ts` |
| `HUB-P2-01` | Closed | Significant names experiment evidence and statistical judgment before entry. | Hub catalog assertion and Slice 5 screenshots |
| `HUB-P2-02` | Closed | The hub now frames the collection as playable proof of product and AI judgment. | `LabHub.test.tsx`, Slice 6 hub screenshot |
| `HUB-P2-03` | Closed | Card drag preserves vertical browsing through `touch-action: pan-y`. | `e2e/hub.spec.ts` |
| `HUB-BP2-01` | Closed | Each card has one keyboard stop, its game link. | `e2e/hub.spec.ts` |
| `HUB-BP2-02` | Closed | Settings closes on its trigger, outside click, or Escape and returns focus. | `e2e/hub.spec.ts` |
| `SRC-P1-02` | Closed | Every game uses one shared mobile canvas and one control layer. | `e2e/slice-1-responsive.spec.ts` |

## Significant findings

| ID | Status | Local resolution | Primary proof |
| --- | --- | --- | --- |
| `SIG-P1-01` | Closed | Winner's Curse is graded from the visible day 3 evidence. | `e2e/significant.spec.ts` |
| `SIG-P1-02` | Closed | Ship, Kill, and Keep Running have stable operational meanings across calibration and play. | Calibration tests and Slice 2 report |
| `SIG-BP1-01` | Closed | Confetti is scoped to a mounted successful result and removed before a review result. | `e2e/significant.spec.ts` |
| `SIG-BP1-02` | Closed | Decisions and rewards commit before reveal and restore exactly after refresh. | `e2e/significant.spec.ts` |
| `SIG-BP1-03` | Closed | Campaign decisions and review actions reflow and remain reachable at the zoom proxy. | `e2e/slice-1-responsive.spec.ts` |
| `SIG-P2-01` | Closed | Answer query parameters no longer select or advance calibration. | `e2e/significant.spec.ts` |
| `SIG-P2-02` | Closed | Saved progress is runtime validated and malformed data recovers safely. | `src/lib/progress.ts` and progress tests |
| `SIG-P2-03` | Closed | Chart names include endpoints, trends, uncertainty overlap, and sample totals. | `e2e/significant.spec.ts` |
| `SIG-P2-04` | Closed | Correct and review headings receive focus when a reveal mounts or restores. | Slice 2 components and browser flow |
| `SIG-P2-05` | Closed | Keep Running is distinct from rejection, and unresolved cases no longer teach reflexive Kill behavior. | Archetype tests and Slice 2 decision policy |
| `SIG-BP2-01` | Closed | Review calls earn zero XP while correct first-run calibration calls earn 20 XP. | Calibration unit and browser tests |
| `SIG-BP2-02` | Closed | Clipboard denial now exposes the complete result in a selectable textarea. | `ShareControl.test.tsx` and the shared Ship It browser path |
| `SIG-BP2-03` | Closed | Calibration contains three real rounds and completes after the third reveal. | `e2e/significant.spec.ts` |

## Ship It findings

| ID | Status | Local resolution | Primary proof |
| --- | --- | --- | --- |
| `SHIP-P1-01` | Closed | Free and Daily quarters persist strict active-run snapshots and restore across reload and history navigation. | `e2e/ship-it.spec.ts` |
| `SHIP-P1-02` | Closed | Shared Haptics and manual Motion preferences control active play without resetting the run. | `e2e/ship-it.spec.ts` |
| `SHIP-P1-03` | Closed | Accessibility, trust, evidence, legal, privacy, security, and truthfulness are integrity boundaries, not ordinary meter trades. | Ship It policy simulation and Slice 3 report |
| `SHIP-P1-04` | Closed | Users became Customer and manipulative growth lowers customer health. | Engine tests and the dark-pattern browser path |
| `SHIP-P1-05` | Closed | Integrity-affected runs cannot earn a top leadership rating. | 10,000-seed diagnostic and audited browser path |
| `SHIP-BP1-01` | Closed | Both choices remain reachable at the zoom proxy. | `e2e/ship-it.spec.ts` |
| `SHIP-P2-01` | Closed | Decision receipts announce exact post-choice meter changes. | `e2e/ship-it.spec.ts` |
| `SHIP-P2-02` | Closed | Failure is an alert dialog with entry focus, focus containment, and one recovery action. | `e2e/ship-it.spec.ts` |
| `SHIP-P2-03` | Closed | Low-meter sound checks the post-choice value and names the endangered meter. | Ship It browser instrumentation |
| `SHIP-P2-04` | Closed | Entry copy states the three-minute duration, normal decision count, and extension rule. | `e2e/ship-it.spec.ts` |
| `SHIP-P2-05` | Closed | Speaker roles, meters, failure, review, streak, and shield use source-controlled vector icons. | `e2e/slice-6-visual.spec.ts` |
| `SHIP-P2-06` | Closed | All 51 cards have choice-specific causes, assumptions, and integrity context. | Guidance completeness tests and browser receipts |
| `SHIP-BP2-01` | Closed | Deltas and causal receipts remain inside game content instead of overlapping shared chrome. | Slice 3 visual evidence |
| `SHIP-BP2-02` | Closed | Failed-run XP is held until the player accepts the failure and remains idempotent. | `e2e/ship-it.spec.ts` |
| `SHIP-BP2-03` | Closed | Clipboard permission denial exposes the complete result in a selectable textarea. | `e2e/ship-it.spec.ts` |
| `SHIP-BP2-04` | Closed | Confetti is limited to clean successful reviews and remains behind evidence. | Slice 3 visual and browser evidence |

## Exception Room findings

| ID | Status | Local resolution | Primary proof |
| --- | --- | --- | --- |
| `EXC-P1-01` | Closed | Practice and campaign states persist and replay deterministically across refresh. | `e2e/exception-room.spec.ts` |
| `EXC-P1-02` | Closed | The unfinished Daily mode is not promoted. Practice is the first-run path. | Exception Room entry browser test |
| `EXC-P1-03` | Closed | Required evidence must be reviewed or the player must explicitly accept a recorded deficit. | Engine, component, and browser tests |
| `EXC-P1-04` | Closed | Evidence-free play cannot earn Safety 100 or Balanced Operator. | `e2e/exception-room.spec.ts` |
| `EXC-P1-05` | Closed | Queue cards and the header report exact nearest deadlines and counts. | Seed 6240 unit and browser assertions |
| `EXC-P1-06` | Closed | Three unscored cases teach Approve, Correct, and Escalate before campaign play. | Practice browser path |
| `EXC-P1-07` | Closed | Case summaries are visible, evidence wraps, and decision-critical type is readable at narrow zoom. | Slice 1 and Slice 4 visual evidence |
| `EXC-P2-01` | Closed | `/exception-room/about` explains the product model, constraints, scoring, and engineering choices. | Route health and Slice 4 screenshot 10 |
| `EXC-P2-02` | Closed | End Shift previews expiration and carryover in a confirmation dialog. | `e2e/exception-room.spec.ts` |
| `EXC-P2-03` | Closed | Focus and live announcements cover pickers, reveals, queue changes, shift confirmation, and debrief. | Exception Room browser path |
| `EXC-P2-04` | Closed | Capacity and shift progressbars have programmatic names. | Browser assertions and Axe entry gate |
| `EXC-P2-05` | Closed | A synchronous decision lock prevents duplicate resolution, errors, and analytics. | `e2e/exploratory.spec.ts` |
| `EXC-P2-06` | Closed | Sound and Haptics now control actual decision feedback. | Instrumented browser test |
| `EXC-P2-07` | Closed | Review, reveal, and debrief keep scrolling while visually hiding internal scrollbars. | Narrow responsive and Slice 4 visual evidence |
| `EXC-BP2-01` | Closed | Preferred, acceptable, unnecessary, unsafe, and unverified outcomes use distinct teaching. | Resolution component tests and Slice 4 screenshots 04 to 06 |

## Remaining shared platform findings

| ID | Status | Local resolution or disposition | Primary proof |
| --- | --- | --- | --- |
| `SRC-P1-01` | Closed | Analytics disclosure states that Exception Room start events include the reproducibility seed. | About copy and analytics schema review |
| `SRC-P2-01` | Closed | A storage write failure keeps the preference for the visit and shows a visible session-only warning. | `GameSettings.test.tsx`, `e2e/hub.spec.ts`, Slice 6 screenshot 08 |
| `SRC-P2-02` | Closed | Significant answer queries are inert and deterministic Exception Room previews require an explicit build-time QA flag. | Route browser tests and preview gate |
| `SRC-P2-03` | Closed | The hub title SVG fell from 448,109 to 196,619 bytes with no visible title change. | Slice 6 same-frame comparison |
| `SRC-P2-04` | Closed | Every game has specific canonical, Open Graph, Twitter, and share-image metadata. | `e2e/platform.spec.ts` |
| `SRC-P2-05` | Closed | Complete browser journeys, accessibility entry scans, responsive checks, persistence, and failure paths now run in Playwright. | 103 passing Chromium checks |
| `SRC-P2-06` | Closed | Direct game responses contain branded headings and loading explanations before hydration. | `e2e/platform.spec.ts` |
| `SRC-P2-07` | Accepted constraint | Daily identity remains device-local in this static client-only product. Copy now states that boundary and makes no cross-device or globally synchronized day promise. Server-authoritative time would be a separate architecture scope. | Ship It Daily copy and release checklist |
| `SRC-P3-01` | Monitored upstream | The moderate PostCSS advisory remains through Next.js. Product Lab does not accept or stringify user CSS, and npm's forced repair proposes an invalid breaking downgrade. Re-audit the release commit. | `npm audit --omit=dev` and release checklist |
| `SRC-P3-02` | Closed | Responses define content security, framing, referrer, content type, and unused-capability policies. | `e2e/platform.spec.ts` |

## Additional defect found during closure

The final browser gate found that restoring an Exception Room reveal replayed vibration without a fresh player gesture. Feedback is now armed only by an accepted decision and is not replayed during refresh recovery. The original failed browser case passes, and the full suite remains clean.

## Final verification

- `npm test -- --run`: 49 files passed, 268 tests passed.
- `npm run lint`: passed with no errors or warnings.
- `npm run build`: passed on Next.js 16.2.10 with 19 generated page entries.
- Full Chromium production run: 103 passed.
- Automated Axe entry gate: no serious or critical findings on the hub or three game entries.
- Executable expected-failure scan: zero `test.fail()` calls.
- `git diff --check`: passed.
- Active source, browser, and remediation copy scan: no em dash or en dash found.

## Evidence limits

- Chromium is the verified browser.
- The 195 by 422 viewport is a browser proxy for 200 percent zoom.
- Screen-reader speech, Safari, physical phones, physical speaker output, and real vibration remain unverified.
- Vercel project identity, deployment logs, public URLs, mobile-throttled preview performance, and production behavior are unverified because no deployment was authorized.
- The local release checklist requires separate approval for a preview and for any later production promotion.

## Release boundary

No commit, push, pull request, merge, Vercel preview, production deployment, or publication was performed.
