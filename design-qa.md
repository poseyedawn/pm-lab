# Product Lab hub design QA

## Target

- Approved Pocket Arcade direction: `/Users/Alvin/.codex/generated_images/019f6652-7ba0-73f3-946d-b60caabafd9f/exec-3b985fb1-8c88-426f-91f9-1a29018a3864.png`
- Mobile-first game hub with a full-bleed world, floating cards, touch drag depth, and a desktop presentation constrained to a mobile canvas.

## QA inventory

| Requirement | Functional check | Visual check | Evidence |
| --- | --- | --- | --- |
| Three game cards retain their routes | Confirmed `/significant`, `/ship-it`, and `/exception-room`; a normal touch opened Significant | All three cards are visible with clear labels and actions | `docs/audits/assets/2026-07-17-floating-hub/01-hub-390x844.png` |
| Cards float independently | Confirmed separate motion timing per card | Watched all three cards through multiple animation cycles without collision or clipping | `docs/audits/assets/2026-07-17-floating-hub/01-hub-390x844.png` |
| Press and drag creates depth | Touch drag moved the first card 16 px right and 10 px down, produced a 3D matrix transform, kept the route at `/`, then returned to its origin | Captured the card during the drag state | `docs/audits/assets/2026-07-17-floating-hub/04-hub-card-drag.png` |
| Reduced motion is respected | Emulated reduced motion and measured a 0 px position delta | Motion remains still without changing the composition | Browser metric log from the final QA pass |
| Phone screens are full bleed | Measured frame and hub at 390 px on a 390 px viewport and 430 px on a 430 px viewport | No pale side gutters at either phone width | `docs/audits/assets/2026-07-17-floating-hub/01-hub-390x844.png`, `02-hub-430x932.png` |
| Desktop stays mobile sized | Measured a centered 390 px frame in a 1200 px viewport | Mobile composition remains centered and intact | `docs/audits/assets/2026-07-17-floating-hub/03-hub-desktop.png` |
| Keyboard access remains available | Focused the Significant card as a native link | Focus treatment is not obscured by card layering | Browser interaction check |
| The selected visual direction is preserved | Reviewed the target and implementation in one image | Coral game world, dimensional art, title hierarchy, card rhythm, and bottom path remain coherent | `docs/audits/assets/2026-07-17-floating-hub/05-reference-comparison.png` |
| App copy contains no em or en dashes | Scanned all files under `src` with zero matches | Reviewed visible hub copy | Source scan and mobile screenshots |

## Exploratory checks

- Dragged a card far enough to trigger the interaction threshold, released it, and confirmed the next ordinary tap still navigates.
- Tested the wider 430 x 932 phone width that exposed gutters in the earlier Significant build.
- Checked all card bounds against the viewport. Every card stays inside the frame, with no horizontal overflow.
- Reviewed the dense 390 x 844 composition and the taller 430 x 932 composition for text overlap, clipped art, weak contrast, and awkward spacing.

## Visual review

- P0 issues: none.
- P1 issues: none.
- P2 issues: none after the final spacing and card-action adjustments.
- No clipped controls, horizontal overflow, pale mobile gutters, broken image crops, unreadable labels, or celebratory error treatment were found on the hub.

## Verification

- 242 tests passed.
- TypeScript passed with no errors.
- ESLint passed with no errors and four pre-existing warnings.
- Production build passed for all 13 app routes.

## Final result

passed
