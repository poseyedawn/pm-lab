# Product Lab browser regression inventory

## Slice 0 claims

1. Every public product route loads into stable content without console, page, or local request failures.
2. The hub exposes all three games, safe portfolio exit, shared settings, and persistent shared XP.
3. Significant supports first-time entry, calibration, campaign navigation, Daily, and result state without duplicated reward.
4. Ship It supports button and drag-equivalent choices, meter feedback, failure or review, Daily, and persisted completion.
5. Exception Room supports queue selection, evidence review, all decision types, result continuation, shift progression, and debrief.
6. Required actions remain reachable at 390 x 844, 430 x 932, desktop mobile canvas, and simulated 200 percent zoom.
7. Primary pages have no serious or critical automated accessibility violations.
8. Known audit failures are executable expected-failure tests until their remediation slice removes the marker.

## Coverage map

| Surface | Control or state | Functional check | Visual or fit check | Evidence |
| --- | --- | --- | --- | --- |
| Hub | Three game cards | Links resolve to each game | All cards and play affordances are visible at 390 | Attached viewport capture |
| Hub | Portfolio | Correct URL, new tab, safe relationship | Action stays secondary to game selection | DOM assertion |
| Hub | Settings | Sound, Haptics, Motion persist | Popover remains inside the canvas | Attached settings capture |
| Hub | Keyboard cards | One actionable stop per game | Visible focus on the actual link | Known-failure test |
| Hub | 200 percent zoom | Every game remains reachable through the inner frame scroll | No horizontal clipping of playable cards | Geometry assertion |
| Significant | First entry | CTA reaches calibration | Entry title and CTA fit | Attached viewport capture |
| Significant | Calibration | Decision produces one result | Result has one semantic tone | Interaction assertion |
| Significant | Query shortcut | URL cannot complete calibration by itself | No result without action | Known-failure test |
| Significant | Campaign result commit | Reload preserves the decided state | Wrong result cannot disappear | Known-failure test |
| Significant | Zoom | All three decisions remain reachable through the inner frame scroll | No fixed-canvas dead end | Geometry assertion |
| Ship It | Free-run choice | Choice advances the week once | Meter and next card remain legible | Attached post-choice capture |
| Ship It | Haptics Off | Choice makes no vibration call | Setting and game behavior agree | Known-failure test |
| Ship It | Active run reload | Week and meters restore | No silent reset to week 1 | Known-failure test |
| Ship It | Zoom | Both choices remain reachable through the inner frame scroll | No fixed-canvas dead end | Geometry assertion |
| Exception Room | Queue and evidence | Selection and review counter update | Evidence and actions are readable | Attached selected-case capture |
| Exception Room | Progressbars | Shift and capacity are named | Values remain visible | Known-failure accessibility test |
| Exception Room | Deadline | Timing and count match engine state | Urgency copy is accurate | Known-failure test |
| Exception Room | Active run reload | Selection and evidence restore | No silent run loss | Known-failure test |
| Exception Room | Rapid duplicate decision | One resolution and no error | No false availability error | Known-failure test |
| Exception Room | Evidence-free scoring | Zero evidence cannot earn the strongest profile | Evidence result has sufficient hierarchy | Deferred full-campaign expected-failure test |
| Cross-product | Direct routes | 200 response and stable heading or action | No empty settled main | Route matrix |
| Cross-product | Accessibility | Axe serious and critical scan | Focus and semantic states remain inspectable | Axe report on each entry |
| Cross-product | Browser health | No console, page, or request failures | No broken local assets | Automatic fixture assertion |

## Exploratory scenarios

1. Rapidly activate a consequential decision twice and verify one state change and one reward.
2. Reload immediately after a result replaces its decision controls and verify the product restores one coherent phase.
3. Change a shared preference, navigate through a game and back to the hub, then confirm the selected preference and behavior remain aligned.
4. Resize from 390 x 844 to 195 x 422 while a decision is visible and verify the next required action can still be reached.

## Signoff boundary

- Expected-failure tests document known audit defects and must execute, not skip.
- A remediation slice removes `test.fail()` only when the desired assertion passes with fresh browser evidence.
- Physical haptics, physical speakers, screen-reader speech output, Safari, iPhone, and Android remain outside this local Chromium suite.
- The persistent harness can scroll the inner `.lab-frame` at 195 x 422, so the core hub, Significant, and Ship It actions are currently reachable. This supersedes the audit's outer-document-only reachability interpretation. Slice 1 still owns full reflow, repeated chrome, and clipped-composition quality.
