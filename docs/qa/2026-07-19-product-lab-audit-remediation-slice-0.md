# Product Lab Audit Remediation Slice 0

**Date:** 2026-07-19

**Branch:** `codex/product-lab-audit-remediation`
**Scope:** Establish a persistent browser regression gate before product remediation begins.

## Outcome

Slice 0 is complete locally. Product source behavior was not changed. The branch now has a project-owned Playwright suite, automated accessibility checks, production-server orchestration, representative screenshot capture, and a GitHub Actions quality gate.

## Coverage delivered

- All twelve public routes settle into product content without browser console, page, or local request failures.
- The hub verifies all three game links, play affordances, portfolio exit safety, shared settings persistence, keyboard stops, zoom reachability, and desktop canvas geometry.
- Significant verifies first entry, calibration, wrong-result semantics, query-state integrity, campaign result persistence, rapid duplicate input, and zoom reachability.
- Ship It verifies explicit choice controls, one-week advancement, haptics preference compliance, active-run recovery, and zoom reachability.
- Exception Room verifies queue selection, evidence review, all three decision types, resolution, progressbar names, active-run recovery, entry reachability, and rapid duplicate input.
- Axe scans the hub and every game entry for serious and critical WCAG violations.
- Visual evidence covers 390 by 844, 430 by 932, and the centered 390-pixel canvas at 1200 by 900.

## Verification result

`npm run test:all` passed.

- Lint: 0 errors and 4 pre-existing warnings.
- Unit suite: 45 files and 242 tests passed.
- Production build: all 13 product routes compiled and generated successfully.
- Browser suite: 40 checks passed under Playwright's result model.
- Browser contracts: 29 healthy checks and 11 executable expected failures.
- Browser health: no unexpected console, page, or local request failures.

The generated local report is available through `npm run test:e2e:report`.

## Executable expected failures

| Defect | Regression coverage |
| --- | --- |
| Serious entry contrast violations | Significant, Ship It, and Exception Room axe scans |
| Inert focus stop on each draggable hub card | Hub keyboard contract |
| Calibration state can be entered through `?call=` | Significant query integrity |
| Campaign decision is not committed until the result CTA | Significant result recovery |
| Haptics Off is ignored during Ship It choices | Ship It preference contract |
| Ship It active runs reset on refresh | Ship It recovery contract |
| Exception Room progressbars lack names | Exception Room accessibility contract |
| Exception Room selection and evidence reset on refresh | Exception Room recovery contract |
| Rapid duplicate Exception Room input shows a false error | Focused exploratory regression |

Each expected failure executes its desired assertion. If a future change fixes the defect without removing the marker, Playwright reports an unexpected pass and fails the suite. This forces explicit evidence review before closing an audit item.

## Audit evidence refinement

The persistent harness did not reproduce the earlier claim that simulated 200 percent zoom creates a hard interaction dead end for the hub, Significant, or Ship It. At a 195 by 422 CSS viewport, the inner `.lab-frame` has real vertical scroll range and can bring each required action into view. Those regression checks now pass.

Slice 1 still owns the visual quality problem: fixed compositions, repeated chrome, and long inner-frame scrolling do not provide good zoom reflow. This refinement changes the issue from unreachable interaction to poor responsive composition based on the current production build.

## Visual review

The final Playwright report screenshots were opened and inspected for:

- hub at 390 by 844;
- hub at 430 by 932;
- centered mobile canvas at 1200 by 900;
- Significant calibration success;
- Significant incorrect-result review;
- Ship It after one decision;
- shared settings with Sound and Haptics Off and Motion Reduced;
- Exception Room with one evidence item reviewed.

The approved hub art, full card silhouettes, play controls, mobile canvas, and distinct game worlds remain intact. No screenshot exposed broken local assets or unintended desktop expansion.

## Evidence limits

- Chromium is the only browser in this local suite.
- Physical haptics and speaker output are not verified.
- Screen-reader speech output is not verified.
- Safari, iPhone hardware, and Android hardware remain outside this slice.
- The report and trace folders are generated artifacts and are excluded from Git and ESLint.

## Next implementation boundary

Slice 1 can now change canvas and shared chrome behavior against an executable baseline. No commit, push, pull request, merge, deployment, or publication was performed in Slice 0.
