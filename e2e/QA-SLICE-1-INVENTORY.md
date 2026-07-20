# Product Lab Slice 1 browser QA inventory

## Slice goal

Keep the approved full-bleed mobile game presentation while giving every route one predictable canvas, one persistent control layer, and scroll-based reflow at narrow and zoomed viewports.

## Product claims

1. The hub and all three games fill the mobile viewport at 390 x 844 and 430 x 932 without exposing the desktop page background.
2. At 1200 x 900, each surface stays centered in an exact 390-pixel game canvas without padding that shrinks its approved art or card silhouettes.
3. Each game exposes one persistent navigation and settings layer. The root Product Lab header and footer do not stack above game-owned chrome.
4. At a simulated 200 percent zoom viewport of 195 x 422, the current title, keyboard focus, and next required action remain reachable by vertical scroll without horizontal clipping.
5. Significant entry, decisions, and results preserve the approved pink world while their controls reflow instead of being hidden by fixed-height composition.
6. Ship It entry, choices, failure, and review remain reachable under the shared canvas contract without changing its approved art direction.
7. Exception Room entry, queue, evidence, decisions, reveal, and debrief fit within one shell. No nested 844-pixel surface begins below another persistent header.
8. Exception Room keeps the selected case summary and evidence meaning readable at narrow widths, including two-line evidence summaries where needed.
9. Shared settings remain inside the canvas and usable at every tested viewport.
10. Existing game art, SVG lockups, backgrounds, floating objects, card silhouettes, and play affordances remain visually intact.

## Control and state matrix

| Surface | Control or state | Functional assertion | Visual and fit assertion |
| --- | --- | --- | --- |
| Hub | Significant, Ship It, Exception Room cards | Each card opens its game | All art and play affordances remain visible and unclipped |
| Hub | Product Lab and field test lockups | Static approved assets render | No font substitute or cropped lockup |
| Hub | Shared settings | Sound, Haptics, and Motion toggle | Popover stays within the 195 and 390 canvases |
| Game header | Home | Returns to the hub | One visible persistent header, 44-pixel target |
| Game header | Active game title | Correct game name is present | Name remains readable at 195 pixels wide |
| Game header | XP and settings | Values and settings remain operable | Actions do not push the title outside the canvas |
| Significant entry | Start field test | Opens calibration or resumes campaign | Title, explanation, and CTA are reachable by scroll |
| Significant calibration | Product decisions | One result follows one decision | All decision buttons fit without horizontal clipping |
| Significant result | Continue or replay | Advances or restarts coherently | Outcome and required action remain visible and semantically distinct |
| Ship It entry | Start or resume | Opens a run | Entry CTA remains reachable |
| Ship It run | Two release choices | One choice advances one week | Both choices and meter feedback remain reachable |
| Ship It failure or review | Continue or replay | Advances or restarts coherently | Required action is not covered by chrome |
| Exception entry | Start shift | Opens the queue | Hero, brief, disclosure, and CTA share one scroll contract |
| Exception queue | Case cards | Selection changes the active case | Case identity and urgency reflow at 195 pixels |
| Exception case | Evidence items | Review count updates | Summary and evidence meaning remain readable |
| Exception decision | Approve, Correct, Escalate | One resolution follows one decision | Three actions reflow without horizontal clipping |
| Exception reveal | Continue | Advances the shift | Consequence and next action remain reachable |
| Exception debrief | Replay or return | Leaves or restarts coherently | Score and action groups fit the canvas |

## Viewport and geometry evidence

For the hub, Significant, Ship It, and Exception Room:

- 390 x 844 mobile primary screenshot
- 430 x 932 mobile large screenshot
- 1200 x 900 desktop screenshot with a measured 390-pixel centered `.lab-frame`
- 195 x 422 zoom simulation screenshot with measured `scrollWidth <= clientWidth`
- required-action bounding box reached after vertical scroll
- shared header count and root header visibility assertion

## Functional walkthroughs

1. Open each hub card, confirm the active title, open settings, close settings, and return through the game header.
2. Complete one consequential action in every game and verify the result state exposes a reachable next action.
3. In Exception Room, select a case, review evidence, decide, continue, and reach the next case or debrief.
4. Resize from 390 x 844 to 195 x 422 while a consequential decision is visible, then scroll to and activate the next required action.

## Exploratory scenarios

1. At 195 x 422, open shared settings, toggle Sound, Haptics, and Motion, close the popover, then reach and activate the game CTA.
2. Select an Exception Room case and open evidence at 390 x 844, resize to 195 x 422, then verify the same selection, readable summary, focus, and decision controls remain coherent.
3. Move keyboard focus through Home, active game context, XP, Settings, page content, and the required action while the sticky header is present.
4. Navigate from a game back to the hub and into another game after scrolling, verifying that no stale scroll position or duplicate chrome hides the new route heading.

## Visual review checklist

- No exposed desktop background at mobile sizes
- No repeated Product Lab, game, sound, or settings header rows
- No horizontal scrollbar or clipped required action
- No desktop-only padding inside the 390-pixel game canvas
- No substituted wordmarks, missing SVGs, cropped card edges, or missing play buttons
- No visual hierarchy regressions in Significant, Ship It, or Exception Room
- Settings popover, focus ring, and sticky header remain within the game canvas
- Exception Room case summary and evidence descriptions are legible without relying on icons alone

## Expected test evolution

- Slice 0 expected failures remain executable unless this slice directly fixes their documented defect.
- New Slice 1 geometry tests begin as desired-state assertions after the shell implementation.
- A passing geometry assertion is not visual signoff by itself. Every representative screenshot must be inspected.

## Local-only signoff boundary

- Chromium and the project-owned Playwright fallback provide the automated evidence for this slice.
- Safari, physical iPhone and Android devices, physical haptics, speaker output, and screen-reader speech remain outside this local pass.
- This slice does not authorize a commit, push, pull request, merge, deployment, or publication.
