# Product Lab Slice 3 verification

- **Captured:** 2026-07-15 America/Los_Angeles
- **Baseline:** Slice 2 at `c7c0e6a`
- **Implementation branch:** `codex/product-lab-slice-3`
- **Local production origin:** `http://127.0.0.1:3103`
- **Browser:** Google Chrome through the approved Playwright fallback
- **Selected visual:** mobile Option 1, normalized to 390 × 844

## Scope delivered

Slice 3 turns the selected mobile mock into the Product Lab’s earned first-run calibration:

- a dedicated `/significant/calibration` route using the existing 390px mobile frame;
- a first-visit state that begins honestly at 0 XP instead of endowing progress on mount;
- a full real-data calibration screen with the selected field-test hierarchy, chart, lift, confidence interval, handwritten coaching, and Ship/Kill/Keep Running controls;
- a reveal that keeps evidence on screen, highlights the decisive interval, and awards the 50 XP baseline once;
- no accidental campaign star, campaign case completion, random critical bonus, or duplicate replay reward;
- a direct handoff into a still-open Case 1 with a dominant Continue campaign action;
- Skip coaching and reversible Show coaching behavior;
- Replay calibration in Significant settings;
- cold-entry protection for Significant home, campaign play, and daily play;
- canonical handling of the previous calibration query and validated landing calls;
- safe handling of malformed calls;
- non-gesture replay suppression for sound/haptics so preselected calls do not produce browser warnings; and
- short-height adaptation that keeps the evidence and decisions usable at 320 × 568.

## Automated verification

| Check | Result |
|---|---:|
| Unit/component tests | 134 passed in 26 files |
| TypeScript | `npx tsc --noEmit` passed |
| ESLint | 0 errors, the same 3 existing warnings |
| Production build | Passed; all 7 listed routes, including not-found, prerendered |
| Local Chrome verification | 46/46 checks passed |
| Browser diagnostics | 0 console errors, page errors, or failed requests |
| Design QA | `final result: passed` |

The three lint warnings remain the existing unused parameters/import in the scenario engine and its test. Node 26 test workers continue to print the known experimental `localStorage` warning; all storage, calibration, routing, and interaction tests pass.

## Rendered Chrome verification

| Behavior | Result |
|---|---:|
| 390 × 844 deciding overflow | 390 × 844 document; no horizontal or vertical overflow |
| 390 × 844 reveal overflow | 390 × 844 document; no horizontal or vertical overflow |
| Evidence card bounds | y=315–604 |
| Decision-control bounds | y=704–788 |
| Coaching-action bounds | y=796–840; 44px target |
| 320 × 568 overflow | 320 × 568 document; no horizontal or vertical overflow |
| Desktop mobile lock at 1440 × 900 | centered at x=525, width=390 |
| Visible 390px controls | all at least 44px |
| Visible 320px controls | all at least 44px |
| Ship/Kill/Keep reveals | matching reveal passed for all three |
| First completion | 50 XP, calibration complete, empty campaign record |
| Replay completion | remains 50 XP |
| Landing call handoff | `call=ship` preserved and revealed |
| Campaign handoff | Case 1 next, 0 campaign stars |
| Cold entry gate | home, play, and daily redirect to calibration |
| Legacy call route | canonicalized with valid call preserved |
| Malformed call input | ignored; all decisions remain available |
| Skip/Show coaching | reversible |
| Keyboard order and focus | primary controls reachable with visible outline |

The complete machine-readable run is stored in [`verification.json`](assets/2026-07-15-slice-3/verification.json).

## Design comparison

The selected source and final implementation were normalized to the same 390 × 844 viewport and reviewed together.

- [`comparison-full-390x844.png`](assets/2026-07-15-slice-3/comparison-full-390x844.png)
- [`comparison-evidence-card.png`](assets/2026-07-15-slice-3/comparison-evidence-card.png)
- [`comparison-coaching-and-decisions.png`](assets/2026-07-15-slice-3/comparison-coaching-and-decisions.png)
- [`design-qa.md`](../../design-qa.md)

The implementation intentionally uses the real deterministic clean-win scenario rather than traced chart data. It also keeps the source’s handwritten coaching treatment while converting the source’s answer-spoiling note into a decision prompt.

## Architecture and state notes

- `completeCalibration` is idempotent and owns the one-time 50 XP baseline.
- `useCalibration` owns dedicated calibration phase, analytics, preferences, feedback, and continuation behavior; campaign `Level1` is no longer overloaded as warmup state.
- `useCampaign` keeps a synchronous state ref so persistence and Lab-profile events occur outside React state updaters.
- Calibration analytics use an explicit `calibration` mode and level instead of masquerading as campaign play.
- The landing, direct game routes, daily route, replay link, and previous calibration query all converge on the dedicated route.

## Protected-work verification

The implementation was isolated in `/Users/Alvin/Al the Builder/portfolio-projects/pm-lab-slice-3`. The protected Ship It worktree was not edited. No push, merge, or deployment was performed.

## Dependency and security note

Slice 3 adds no runtime dependency. The approved Google Chrome Playwright fallback remains temporary QA tooling and is not saved to this app’s manifest or lockfile.

`npm audit --omit=dev` reports the same two moderate PostCSS findings nested under Next.js. The offered forced remediation would install breaking Next 9, so no forced dependency mutation was applied.
