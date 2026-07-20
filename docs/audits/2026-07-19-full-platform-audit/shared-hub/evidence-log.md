# Shared hub browser evidence log

Status: all 20 checks executed against the production build at `http://127.0.0.1:3110/`, including primary 390 x 844, secondary 430 x 932, desktop 1200 x 900, keyboard, touch drag, history, settings, motion, and a real cross-game XP reward.

Use `interaction-inventory.md` for the required HUB IDs and `../BROWSER-EVIDENCE-RUNBOOK.md` for the execution contract.

| ID | Result | Viewport and input | Setup | Expected | Actual | Screenshot | Console or network | Finding |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HUB-01 | Finding | 390 x 844, fresh touch context | Six app storage keys cleared before first load | Purpose, game count, and decision model are clear | Title, purpose, and all three cards are visible without scrolling. Ship It and Exception Room describe their mechanics; Significant remains generic. | [HUB-01](evidence/HUB-01-first-load-390x844.png) | HTTP 200; no console errors or page errors | Confirms HUB-P2-01 |
| HUB-02 | Pass | 390 x 844, touch | First-load hub | Brand returns to hub | Visible brand link resolves to `/` and preserves a working hub | HUB-01 | No errors | None |
| HUB-03 | Pass | 390 x 844, same browser context | Completed a reward-bearing Ship It run | Total and per-game XP update and persist | Shared total and Ship It both display 580 XP after returning to the hub. The value survives route transition and storage reload. | [cross-game XP](evidence/HUB-03-cross-game-xp-after-ship-it-390x844.png) | No errors | Shared profile aggregation is working. |
| HUB-04 | Pass | 390 x 844, touch | First-load hub | Disclosed new-tab portfolio exit | Opens `https://alvn.io/` in a new tab with `noopener noreferrer`; hub remains open | HUB-01 | Destination reached | None |
| HUB-05 | Pass | 390 x 844, system motion | Default preferences | Significant card and ambient objects move subtly | Card and ambient transforms changed across three timed samples without layout overflow | [motion](evidence/HUB-05-system-full-motion-390x844.png) | No errors | None |
| HUB-06 | Pass | 390 x 844, touch | Default motion | Tap opens Significant | Direct touchscreen tap opened `/significant` and rendered the first-time entry | HUB-01 | No errors | None |
| HUB-07 | Pass | 390 x 844, touch | Default motion | Four-direction drag, bounded tilt, snap-back, and tap guard | Right, left, down, and up produced bounded 3D transforms. Release returned to origin. Immediate tap after drag was ignored; the next intentional tap opened Significant. | [drag](evidence/HUB-07-significant-touch-drag-390x844.png) | No errors | None |
| HUB-08 | Pass | 390 x 844, touch | Default motion | Ship It card taps, drags, and snaps back | Touch tap opened `/ship-it`; drag produced 3D transform and returned to origin | HUB-01 | No errors | None |
| HUB-09 | Pass | 390 x 844, touch | Default motion | Exception Room card taps, drags, and snaps back | Touch tap opened `/exception-room`; drag produced 3D transform and returned close to origin before settling | HUB-01 | No errors | None |
| HUB-10 | Finding | 390 x 844, keyboard and simulated 200 percent zoom | Fresh hub | One meaningful focus stop per control; zoom preserves access | Each card receives an inert focus stop on its draggable `div` before the actionable link. At 200 percent zoom, the wordmark, title, card copy, and card collection are clipped with no page scroll. | [inert focus](evidence/HUB-10-inert-drag-focus-390x844.png), [link focus](evidence/HUB-10-significant-keyboard-focus-390x844.png), [zoom](evidence/HUB-10-zoom200-390x844.png) | No errors | HUB-BP2-01 and HUB-BP1-01 |
| HUB-11 | Pass | 390 x 844, touch | Fresh hub | Full-bleed mobile world with reachable controls | Canvas fills the viewport, all three cards and play controls are visible, and no horizontal or vertical document overflow is present | HUB-01 | No errors | None |
| HUB-12 | Pass | 430 x 932, touch | Fresh hub | Artwork scales without clipping | Full-bleed canvas, all cards, and additional world background are visible with no document overflow | [430 x 932](evidence/HUB-12-first-load-430x932.png) | No errors | None |
| HUB-13 | Pass | 1200 x 900, pointer | Fresh hub | Mobile canvas stays centered on desktop | A 390 x 844 canvas is centered at x 405 and y 28 against the muted desktop background | [desktop](evidence/HUB-13-desktop-canvas-1200x900.png) | No errors | None |
| HUB-14 | Pass | 390 x 844, touch | Significant entry | Shared home control returns to hub with preferences retained | Home control returned to `/`; the manually reduced hub remained static | [return](evidence/HUB-14-18-return-home-reduced-390x844.png) | No errors | None |
| HUB-15 | Finding | 390 x 844, touch and keyboard | Significant entry | Settings open, close, and dismiss predictably | Popover is legible and fully visible. Clicking outside and pressing Escape do not close it; only activating the summary closes it. | [settings](evidence/HUB-15-settings-open-significant-390x844.png) | No errors | HUB-BP2-02 |
| HUB-16 | Pass | 390 x 844, touch | Settings open | Sound state changes and persists | Sound changed from On to Off, saved in `pmlab:preferences:v1`, and remained Off after reload | HUB-15 | No errors | Audible effect deferred to game pass |
| HUB-17 | Pass | 390 x 844, touch | Settings open | Haptics state changes and persists | Haptics changed from On to Off, saved in `pmlab:preferences:v1`, and remained Off after reload | HUB-15 | No errors | Unsupported-device behavior deferred |
| HUB-18 | Pass | 390 x 844, touch and system preference | Settings open; separate reduced-motion context | System, Reduced, and Full values behave consistently | System full transforms changed over time. System reduced and manual Reduced remained static across timed samples and route return. | [system full](evidence/HUB-05-system-full-motion-390x844.png), [system reduced](evidence/HUB-18-system-reduced-390x844.png), [manual reduced](evidence/HUB-14-18-return-home-reduced-390x844.png) | No errors | Full manual override remains for cross-product pass |
| HUB-19 | Pass | 390 x 844, touch and browser history | Fresh hub to Significant | Back and Forward restore stable routes | Back restored three hub cards; Forward restored the settled Significant entry with no busy main | HUB-01 | No errors | None |
| HUB-20 | Pass | 390 x 844, keyboard | Fresh hub | Skip link appears, targets main, and focus is visible | First Tab exposes a high-contrast 48-pixel skip link targeting `#main-content`; subsequent focus order reaches brand and portfolio | [skip link](evidence/HUB-20-skip-link-focus-390x844.png) | No errors | Card duplicate focus is recorded under HUB-10 |

## Browser-confirmed findings

### HUB-BP1-01: The hub is unusable at simulated 200 percent zoom

At a 195 x 422 CSS viewport rendered at device scale 2, the 390 x 844 physical screenshot clips the Product Lab wordmark, portfolio label, Field Test title, Significant copy, and lower cards. The document reports no horizontal or vertical scrolling, so the hidden content cannot be reached. This is a P1 accessibility and comprehension failure because the collection's title and navigation are visually truncated.

Evidence: `evidence/HUB-10-zoom200-390x844.png`.

### HUB-BP2-01: Every draggable game card creates an inert keyboard stop

Framer Motion adds `tabindex="0"` to the draggable wrapper while the nested link remains separately focusable. The wrapper has no role, name, or keyboard action. Pressing Enter on it does nothing. The next Tab reaches the real link, and Enter then navigates successfully. This is a P2 keyboard-efficiency and semantic-clarity issue.

Evidence: `evidence/HUB-10-inert-drag-focus-390x844.png` and `evidence/HUB-10-significant-keyboard-focus-390x844.png`.

### HUB-BP2-02: The settings popover does not support outside-click or Escape dismissal

The settings panel is a native `details` element. It opens and closes through its summary, but clicking elsewhere and pressing Escape leave it open. The panel covers a large part of the mobile game entry, so this is a P2 interaction and keyboard-recovery issue even though all controls remain reachable.

Evidence: `evidence/HUB-15-settings-open-significant-390x844.png`.
