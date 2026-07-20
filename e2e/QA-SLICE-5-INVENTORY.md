# Product Lab audit remediation, Slice 5 QA inventory

## User-visible claims

- The hub explains the distinct product judgment each field test exercises before a visitor opens a game.
- Every hub card exposes its expected duration and mode without losing the approved art, play control, or full silhouette.
- A draggable hub card contributes one keyboard stop: its game link.
- Vertical browsing still works when a scroll starts over a draggable card.
- Settings closes through its trigger, Escape, or an outside click and returns focus to the trigger.
- Significant and Ship It entry text passes the serious and critical automated contrast gate.
- Direct links expose game-specific titles, descriptions, canonical URLs, and social preview images.
- Robots, sitemap, and manifest endpoints describe the public Product Lab routes.
- A server response for each game entry contains a meaningful heading and loading explanation before storage hydration.
- Browser headers declare framing, referrer, content type, and unused capability policies without breaking the app.
- Daily copy states that the date and completion boundary are device-local.

## Controls and state changes

| Control or behavior | Initial state | Changed state | Required check |
| --- | --- | --- | --- |
| Hub game link | Resting card | Game entry | One link per card, one navigation, visible focus, and safe drag guard. |
| Hub card drag | Resting card | Tilted card, then origin | Horizontal pointer drag responds and snaps back without accidental navigation. |
| Hub card scroll surface | Hub at top | Hub scrolled | Wheel and vertical touch policy remain available from the card surface. |
| Settings trigger | Closed | Open, then closed | `aria-expanded`, outside click, Escape, and trigger focus all agree with the visible state. |
| Sound and Haptics | On | Off, then persisted | Shared switches retain their values after route change and reload. |
| Motion selector | System | Reduced, then persisted | Ambient hub movement and drag become nonessential and static. |
| Significant entry | Loading, then ready | First-time CTA | Both states identify the game; ready-state copy passes Axe. |
| Ship It entry | Loading, then ready | Free and Daily CTAs | Both states identify the game; both CTA cards remain readable. |
| Metadata request | Generic root | Game-specific route | Title, description, canonical, Open Graph, and Twitter fields match the route. |
| Platform resource | Direct request | Public response | Robots, sitemap, manifest, and declared response headers return valid content. |

## Functional flow

1. Open a fresh hub at 390 by 844 and confirm the title, three mechanisms, card metadata, and play controls.
2. Tab through the hub. Confirm each draggable card contributes only its nested game link.
3. Drag the Significant card horizontally, release, and confirm the guarded release does not navigate. Activate the link normally and confirm navigation.
4. At 195 by 422, start scrolling over the card collection and reach every game.
5. Open Settings on Significant. Close it with an outside click, reopen it, close it with Escape, and confirm trigger focus after each dismissal.
6. Change Sound, Haptics, and Motion, then open Ship It and confirm the same values.
7. Run Axe on the hub and all three game entries with no serious or critical findings.
8. Inspect direct response HTML for all three game entries and confirm branded loading content appears before hydration.
9. Inspect route metadata and public platform endpoints.
10. Recheck hub and entry behavior at 390 by 844, 430 by 932, 1200 by 900, and 195 by 422.

## Visual checks

- Hub first view at 390 by 844 with all three complete card silhouettes.
- Hub at 430 by 932 with balanced vertical spacing.
- Hub at 1200 by 900 with a centered 390-pixel mobile canvas.
- Hub at 195 by 422 with readable shared navigation and reachable cards.
- Significant entry at 390 by 844 after the contrast repair.
- Ship It entry at 390 by 844 after the contrast repair.
- Settings open and settled on a game entry.
- Hub card in a live drag state and settled after release.

## Exploratory scenarios

1. Open Settings, change a value, click outside, then reopen it. The changed value must remain and the panel must not reopen itself.
2. Drag a card, activate it during the release guard, then activate it again after the guard. Only the deliberate activation may navigate.
3. Resize from 390 by 844 to 195 by 422 while Settings is open. The trigger and controls must remain reachable.
4. Load each game entry with malformed local storage. The branded loading response must settle into a safe default without a runtime error.

## Signoff boundary

- Remove the three remaining `test.fail()` markers only after their assertions pass in the production build.
- Review every accepted screenshot from this run before using it as evidence.
- Chromium, instrumented sound and haptics, and the 195 by 422 zoom proxy remain the local verification boundary.
- Physical phone hardware, screen-reader speech, Safari, and production deployment remain outside this slice.
