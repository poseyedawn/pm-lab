# Product Lab audit remediation, Slice 1

**Date:** 2026-07-20

**Branch:** `codex/product-lab-audit-remediation`
**Scope:** Repair the mobile canvas, repeated chrome, narrow reflow, and 200 percent zoom behavior without changing the approved game art.

## Outcome

Slice 1 is complete locally. The hub and all three games now use one canvas contract. Game routes show one shared navigation and settings layer, the desktop presentation stays centered at 390 pixels, and the narrow layout reflows at 195 by 422 without horizontal scrolling.

No commit, push, pull request, merge, preview deployment, or production deployment was performed.

## What changed

- `LabShell` hides the root header and footer whenever the hub or a game owns the canvas.
- `GameShell` now supplies the shared height and flex contract for game routes.
- `GameHeader` keeps Home, the active game name, and Settings usable at narrow widths. XP is hidden at 195 pixels so the full game name can remain visible.
- The settings popover uses the available canvas width instead of a fixed 256 pixel width.
- The hub keeps the approved artwork at 390 and 430 pixels. At 195 pixels, its navigation moves to two rows and the game cards scale as complete silhouettes with 44 pixel play controls.
- Significant uses the shared settings control. Its duplicate sound and motion row was removed.
- Significant entry, calibration, decision, and result content can grow vertically. Short viewports no longer remove the teaching steps or evidence details to force a fixed composition.
- Exception Room no longer places an 844 pixel shell under two existing headers. Its shell fills the remaining game canvas and gives the queue its own explicit scroll region.
- Exception Room shift progress moved into the capacity panel. The repeated title and sound row was removed.
- Exception Room case summaries are visible. Evidence descriptions use a larger type size and can wrap to two lines.
- Exception Room queue cards, capacity, evidence, decisions, reveal, and debrief reflow into single-column layouts where needed at 195 pixels.
- Shared preference updates no longer dispatch storage events from inside a React state updater. The final production check recorded no console error while toggling Sound, Haptics, and Motion.
- Both Exception Room progressbars now have accessible names. The old expected-failure marker for `EXC-A11Y-01` was removed.

## Measured shell repair

The desktop Exception Room entry exposed the stacking defect clearly.

| Measurement at 1200 by 900 | Before Slice 1 | After Slice 1 |
| --- | ---: | ---: |
| Lab canvas width | 390 px | 390 px |
| Lab canvas height | 844 px | 844 px |
| Visible header rows | 3 | 1 |
| Exception Room shell width | 342 px | 390 px |
| Exception Room shell height | 844 px below shared chrome | 783 px inside the remaining canvas |
| Lab canvas scroll height | 1094 px | 844 px |

At 195 by 422, the final Significant entry measured 195 pixels wide, its CTA ended at 187 pixels, and `.lab-frame` reported `scrollWidth === clientWidth === 195`.

## Browser coverage added

The Slice 1 regression file covers:

- full viewport fill at 390 by 844 and 430 by 932;
- exact 390 pixel centering at 1200 by 900;
- a full-width 390 pixel Exception Room shell on desktop;
- one visible shared game control layer;
- narrow shared settings and persistent preferences;
- complete active game names at 195 pixels;
- keyboard focus from the shared header into the Significant CTA;
- inner canvas scroll reset when a hub card opens a game;
- hub, Significant, Ship It, and Exception Room entry actions at 195 by 422;
- Significant decisions and wrong-result actions at 195 by 422;
- Exception Room summary, evidence, decisions, internal scrolling, resize continuity, and focus at 195 by 422;
- Ship It choice activation and week advancement at 195 by 422.

The visual suite now captures the hub, Significant, Ship It, and Exception Room at all four representative viewport contracts.

## Verification result

- Lint: 0 errors and 4 pre-existing warnings.
- Unit suite: 45 files and 242 tests passed.
- Production build: all 13 product routes compiled and generated successfully.
- Browser suite: 53 checks passed under Playwright's result model.
- Browser contracts: 43 healthy checks and 10 executable expected failures.
- Browser health: no unexpected console, page, or local request failures.
- Source copy scan: no em dash or en dash characters in `src`.
- Diff integrity: `git diff --check` passed.

The local Playwright report is available through `npm run test:e2e:report`.

## Visual review

The final screenshots were opened and checked at 195 by 422, 390 by 844, 430 by 932, and 1200 by 900.

The hub still uses the approved SVG lockups, full card silhouettes, floating artwork, game-specific play buttons, and world background. Significant keeps its pink entry world and hand-held experiment art. Exception Room keeps its dark operations world and full-width selected-direction art. Ship It remains inside the same mobile canvas.

At 195 pixels, each surface uses vertical scroll where needed. The screenshots do not show horizontal scrollbars, desktop gutters inside the game canvas, repeated settings rows, cropped play controls, or a reduced Exception Room shell.

## Executable expected failures after Slice 1

Ten expected failures remain for later slices:

- serious color contrast on the three game entry routes;
- inert keyboard stops around draggable hub cards;
- Significant calibration completion through `?call=`;
- Significant result state that commits only after the result CTA;
- Ship It ignoring the Haptics Off preference;
- Ship It active-run reset on refresh;
- Exception Room active-run reset on refresh;
- Exception Room rapid duplicate input showing a false availability error.

These assertions still execute. An unexpected pass fails the suite until the marker is reviewed and removed.

## Evidence limits

- Chromium is the only browser in this local pass.
- Physical haptics and speaker output were not verified.
- Screen-reader speech output was not verified.
- Safari, iPhone hardware, and Android hardware remain outside this slice.
- The 195 by 422 viewport is a browser reflow proxy for 200 percent zoom, not a physical-device substitute.

## Next boundary

Slice 2 owns Significant judgment integrity and result commit. It will reconcile the answer policy with the visible evidence, remove the production query shortcut, and persist a decision before rendering its result.
