# Product Lab hub design QA

## Target

- Approved Pocket Arcade direction: `/Users/Alvin/.codex/generated_images/019f6652-7ba0-73f3-946d-b60caabafd9f/exec-3b985fb1-8c88-426f-91f9-1a29018a3864.png`
- Mobile-first game hub with a full-bleed world, dimensional floating cards, touch drag depth, dimensional ambient objects, and a desktop presentation constrained to a mobile canvas.

## Iteration record

The first implementation failed the visual gate. The generated card artwork was cropped into flat rounded rectangles, the outer rims and shadows were lost, the play controls were changed to arrows, and the dimensional title objects were replaced with flat icons. The corrected implementation uses transparent card silhouettes, dedicated play controls, raster 3D ambient assets, visible card tilt, and the white plus yellow title treatment from the approved render.

## QA inventory

| Requirement | Functional check | Visual check | Evidence |
| --- | --- | --- | --- |
| Three game cards retain their routes | Confirmed `/significant`, `/ship-it`, and `/exception-room`; a normal touch opened Significant | All three cards are visible with clear labels and play controls | `docs/audits/assets/2026-07-17-floating-hub/01-hub-390x844.png` |
| Full card silhouettes remain visible | Confirmed the catalog points to the processed transparent assets | Outer rims, corner highlights, shadows, and dimensional objects remain visible with no rectangular crop | `docs/audits/assets/2026-07-17-floating-hub/06-card-reference-comparison.png` |
| Cards float independently | Confirmed separate motion timing and rotation per card | Watched all three cards through multiple animation cycles without collision or clipping | `docs/audits/assets/2026-07-17-floating-hub/01-hub-390x844.png` |
| Press and drag creates depth | Touch drag moved the first card 16 px right and 10 px down, produced a 3D matrix transform, kept the route at `/`, then returned to its origin | Captured the card during the drag state | `docs/audits/assets/2026-07-17-floating-hub/04-hub-card-drag.png` |
| Reduced motion is respected | Emulated reduced motion and measured a 0 px position delta | Motion remains still without changing the composition | Browser metric log from the final QA pass |
| Dimensional ambient objects are present | Confirmed five image assets around the title plus the flask brand asset | Bubbles, ring, squiggle, sparkle, and flask retain rendered depth and slow independent motion | `docs/audits/assets/2026-07-17-floating-hub/07-title-reference-comparison.png` |
| Phone screens are full bleed | Measured frame and hub at 390 px on a 390 px viewport and 430 px on a 430 px viewport | No pale side gutters at either phone width | `docs/audits/assets/2026-07-17-floating-hub/01-hub-390x844.png`, `02-hub-430x932.png` |
| Desktop stays mobile sized | Measured a centered 390 px frame in a 1200 px viewport | Mobile composition remains centered and intact | `docs/audits/assets/2026-07-17-floating-hub/03-hub-desktop.png` |
| Keyboard access remains available | Focused the Significant card as a native link | Focus treatment is not obscured by card layering | Browser interaction check |
| The selected visual direction is preserved | Reviewed the target and implementation in one image | Coral game world, dimensional art, title hierarchy, card rhythm, play controls, and bottom path are visibly aligned | `docs/audits/assets/2026-07-17-floating-hub/05-reference-comparison.png` |
| App copy contains no em or en dashes | Scanned all files under `src` with zero matches | Reviewed visible hub copy | Source scan and mobile screenshots |

## Exploratory checks

- Dragged a card far enough to trigger the interaction threshold, released it, and confirmed the next ordinary tap still navigates.
- Tested the wider 430 x 932 phone width that exposed gutters in the earlier Significant build.
- Checked all card bounds against the viewport. Every card stays inside the frame, with no horizontal overflow.
- Reviewed the dense 390 x 844 composition and the taller 430 x 932 composition for text overlap, clipped art, weak contrast, and awkward spacing.
- Compared the full screen, the first card, and the title area directly against the approved render.

## Visual review

- P0 issues: none.
- P1 issues found in the earlier pass: cropped card silhouettes, missing play controls, flat substitute decorations, and incorrect title treatment.
- P1 issues after correction: none.
- P2 issues after correction: none.
- No clipped controls, horizontal overflow, pale mobile gutters, black asset mattes, broken image crops, or unreadable labels remain.

## Verification

- 242 tests passed.
- TypeScript passed with no errors.
- ESLint completed with no errors and four pre-existing warnings outside this hub work.
- Production build passed for all 13 app routes.

final result: passed
