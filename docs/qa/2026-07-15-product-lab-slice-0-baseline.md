# Product Lab Slice 0 baseline and verification

- **Captured:** 2026-07-15 America/Los_Angeles
- **Production baseline:** `main` at `dbd8362`
- **Live origin:** `https://alvns-productlab.vercel.app`
- **Audit evidence branch:** `codex/product-lab-audit-plan` at `6dde615`
- **Implementation branch:** `codex/product-lab-slice-0`

## Pre-change quality baseline

| Check | Result | Notes |
|---|---:|---|
| Unit/component tests | 56 passed in 12 files | Production-aligned source before Slice 0 |
| ESLint | 0 errors, 3 warnings | All three warnings were existing unused variables |
| Production build | Not accepted in the audit worktree | A temporary out-of-root `node_modules` symlink was rejected before compilation; this was an audit setup limitation |
| Live interaction run | 32/32 checks passed | Chrome run covered entry, keyboard use, preferences, campaign and daily outcomes, share success/fallback, invalid routing, and return paths |
| Visual evidence | 18/18 screenshots accepted | Individually inspected at 320px, 390px, and 1600px widths |

## Live performance baseline

Lighthouse 13.0.3 was run in mobile mode against the unchanged production deployment on 2026-07-15. These are synthetic lab measurements, not field Core Web Vitals.

| Route | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Speed Index |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 99 | 100 | 100 | 100 | 0.8s | 1.9s | 30ms | 0 | 2.1s |
| `/significant` | 99 | 100 | 100 | 100 | 1.1s | 2.0s | 30ms | 0 | 2.4s |

Lighthouse found no scored accessibility failures on those two initial routes. This does not supersede the manual findings below or establish performance for reveal, daily-complete, and case-study states.

## Manual accessibility and responsive baseline

- The 320px decision surface had no horizontal overflow and kept all three decisions available, but its 583px document required 15px of scrolling in a 568px viewport.
- The 390px campaign path had repeatable 5px horizontal overflow (`scrollWidth: 395`, `clientWidth: 390`).
- Segment comparison rendered as a table without a caption or headers, and the chart did not expose equivalent nonvisual values.
- Keyboard order and state persistence worked. Link focus used the browser-default 1px outline while game buttons used the stronger authored treatment.
- Correct and incorrect outcomes remained understandable without color.
- Hardware sound/haptic character, 200% zoom, 375px, 768px, safe areas, and production field Core Web Vitals were not established by this baseline.

## Funnel and trust baseline

Production event counts were not available, so no conversion percentage is asserted. The baseline instead records whether each required signal could be measured truthfully.

| Funnel signal | Pre-change status |
|---|---|
| Lab view and game selection | Not measured with typed custom events |
| First/returning intro | Not measured |
| First-run calibration | No explicit event |
| Decision and reveal | Collapsed into ambiguous `round_complete` |
| Round continuation | Not measured |
| Campaign depth | `campaign_complete` existed, but level completions were not measured |
| Daily view/completion | `game_start` and `daily_played` existed without a stable typed contract |
| Share attempt/success rate | `share_clicked` fired only after clipboard success; attempts and failures were invisible |
| Case-study view | Not measured |
| Portfolio return | No return route existed; implementation remains in a later slice |

Trust gaps on the baseline:

- The About page said “No data collected” and “nothing you do here is tracked to you” while Vercel Analytics and custom events were active.
- Analytics accepted arbitrary event names and property bags at compile time and did not runtime-validate payloads.
- `?level=999` rendered level 1 content under a level 999 header, then persisted progress under the invalid ID.
- Clipboard rejection was silently swallowed, leaving the player without feedback.

## Slice 0 exit verification

| Check | Result |
|---|---:|
| Unit/component tests | 93 passed in 16 files |
| TypeScript | `npx tsc --noEmit` passed |
| ESLint | 0 errors, the same 3 existing warnings |
| Production build | Passed; all 6 app routes prerendered |
| Local Chrome verification | 18/18 checks passed at 390x844 |

The event contract now permits only named, runtime-validated aggregate properties. It has no fields for hypothesis/scenario text, scenario seeds, clipboard contents, stable personal identifiers, raw XP, or the full local profile. Share errors are reduced to `unavailable`, `permission`, or `unknown`; streaks and campaign performance are reduced to bands.

The Node 26 test workers currently emit an experimental `localStorage` warning. A test-only in-memory Storage implementation keeps the existing denial/fallback coverage deterministic, and all storage tests pass.

Rendered verification covered the Lab disclosure, About disclosure and removal of the old absolute claims, missing/empty/decimal/negative/`NaN`/zero/out-of-range level redirects, valid level-only persistence, clipboard success, clipboard permission failure, and the no-clipboard text fallback. Evidence is stored in [`assets/2026-07-15-slice-0/`](assets/2026-07-15-slice-0/).

Exploratory QA also found that correct-answer confetti can remain over the next route when a player moves rapidly from the reveal to the campaign and then the case study. The disclosure screenshot was reloaded to isolate its settled state. Confetti lifecycle and reduced-motion behavior remain a named follow-up for the shared preference/motion slice rather than being silently folded into this instrumentation slice.

## Dependency and security note

Zod 4.4.3 was promoted from a transitive package to a direct runtime dependency because URL parameters and analytics payloads are runtime trust boundaries. `npm audit --omit=dev` reports two moderate findings for PostCSS nested under Next.js. The offered forced remediation would install a breaking, older Next.js line, so no forced audit mutation was applied in this slice.
