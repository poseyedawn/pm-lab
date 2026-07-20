# Browser evidence runbook

This runbook converts the five interaction inventories into a reproducible visual audit sequence. It is tool agnostic and must be executed in the user's chosen browser. It does not authorize Playwright or another fallback browser tool.

## Evidence rules

1. Audit the checkout at commit `d608c67` before any product fixes are applied.
2. Use `390 x 844` for the primary pass, then repeat the responsive gates at `430 x 932` and `1200 x 900`.
3. Save screenshots under the matching game folder in an `evidence/` directory.
4. Name each image with the inventory ID, state, and viewport, for example `SIG-08-incorrect-review-390x844.png`.
5. Record the URL, prior storage state, input method, expected result, actual result, console observation, and screenshot filename for every step.
6. Open and inspect every screenshot before accepting it as evidence.
7. Do not use a QA shortcut to judge first-time comprehension or transition quality. Shortcuts may be used in a separate branch-coverage pass only.
8. Do not alter production data or deploy code during the audit.

## Controlled browser state

Use a dedicated browser context for each journey. Clear only these application keys when a first-time state is required:

| Purpose | Storage key |
| --- | --- |
| Shared preferences | `pmlab:preferences:v1` |
| Shared game profile | `pmlab:profile:v2` |
| Legacy profile migration | `pmlab:profile:v1` |
| Significant progress | `pmlab:significant:v1` |
| Ship It progress | `pmlab:shipit:v1` |
| Exception Room progress | `pmlab:exception-room:v1` |

Capture the storage values before and after every reward, completion, preference, and replay case. Run malformed-state tests in an isolated context so they cannot contaminate the normal-flow evidence.

## Pass 1: Product Lab hub

### First visit

1. Clear the six storage keys and load `/` at 390 x 844.
2. Capture initial paint, complete settled hero, all visible cards, and the lowest reachable content.
3. Record whether the title, collection purpose, game count, and each game's decision model are understandable without opening a card.
4. Open the Portfolio link and verify the new-tab disclosure, destination, focus, and original-tab state.

### Card input

1. Start a vertical scroll from the art, title, description, and play control of every card.
2. Tap each card once and verify the intended game entry.
3. Press and hold each card, drag it in four directions, release outside and inside the card, and verify snap-back behavior.
4. Drag and immediately tap to confirm that the drag guard prevents accidental navigation without swallowing the next intentional tap.
5. Repeat by keyboard and with 200 percent zoom.

### Motion and progress

1. Compare System, Reduced, and Full motion with the operating-system preference both enabled and disabled.
2. Earn XP in one game, return to the hub, and capture per-game and total XP updates.
3. Refresh and reopen the hub to confirm persistence and hydration behavior.

## Pass 2: Significant

### First-time path

1. Clear Significant and shared profile state, then load `/significant` directly.
2. Capture the empty or loading paint, settled entry world, rules, expected duration, simulated-data disclosure, and first CTA.
3. Enter calibration through the CTA. Do not use a query shortcut for this flow.
4. Submit Ship for the clean-win scenario and capture the correct result, reward, animation, sound, haptic, focus, and Continue behavior.
5. Repeat from clean state with Kill and Keep Running to capture both incorrect branches and confirm no win confetti appears.

### Campaign

1. Capture the returning campaign home, next-case CTA, level path, locked levels, completed levels, stars, and XP.
2. For every level, capture the question state and one result state. Across the set, include correct and incorrect examples for Ship, Kill, and Keep Running.
3. Exercise duplicate taps on a decision and Continue.
4. Refresh during the question and result states. Test browser Back and Forward from both states.
5. Complete all ten levels and capture the completion card and hub XP update.

### Daily, settings, and explanation

1. Complete the daily experiment correctly and incorrectly in isolated date states.
2. Reopen the same-day daily route and verify the completed state and duplicate reward guard.
3. Toggle Sound, Haptics, and all Motion values, then verify persistence across routes and reloads.
4. Open Replay calibration and the design page. Verify complete content, return path, headings, links, and mobile scrolling.
5. Inspect the chart and result states by keyboard, screen-reader semantics, and 200 percent zoom.

### Branch-only QA

The `call` query on calibration may stage a resolved state, but it is itself a recorded integrity finding. Use it only after the manual flow has been captured, and keep its evidence separate.

## Pass 3: Ship It

### Entry and explanation

1. Clear Ship It and shared profile state, then load `/ship-it` directly.
2. Capture loading paint, settled rules, four meters, Free run, Daily run, and design-page access.
3. Judge whether twelve weeks communicates a realistic time commitment and whether `no correct answers` is credible for the deck's safety-sensitive cards.
4. Compare avatar and meter emoji alignment, weight, and visual quality against the authored hub and Significant assets.

### Free run

1. Start a run and capture product, week, card, affected meters, current meter values, and both explicit choices.
2. Choose each side by button in isolated runs. Then repeat by swipe and keyboard.
3. Record meter deltas, sound, haptics, low-meter heartbeat timing, focus, and announcement behavior.
4. Trigger a failed meter and capture the alert layer, keyboard containment, retry action, and emotional tone.
5. Complete a run and capture every rating tier that can be reached through controlled runs, the final meter summary, review prose, XP, sharing, and Run it back.
6. Refresh and navigate away at early, middle, and late weeks to verify the documented state-loss risk.

### Daily and preferences

1. Complete a daily run and reopen it on the same date.
2. Confirm streak, shield, rating, and reward persistence.
3. Repeat choices and a failure with Haptics disabled.
4. Compare drag and confetti under System, Reduced, and Full motion values.

## Pass 4: Exception Room

### Briefing

1. Clear Exception Room and shared profile state, then load `/exception-room` directly.
2. Capture loading paint, settled briefing, rules, 8-minute commitment, 12-case scope, synthetic-data disclosure, campaign CTA, and locked Daily card.
3. Toggle Sound and verify whether any subsequent interaction produces an audible difference.

### Queue and case review

1. Start a manual campaign and capture the initial shift, capacity, queue order, selected case, and deadline language.
2. Open every queue-card type and each evidence status: supports, conflicts, missing, and neutral.
3. Capture the longest case and evidence copy at 390 x 844 and 200 percent zoom. Verify whether the full summary is available by sight and accessible name.
4. Resolve one case without opening evidence, then resolve another after opening only a non-required item. Record debrief scoring.
5. Complete Approve, Correct, and Escalate paths, including Back from both detail pickers and insufficient-capacity states.
6. Double-tap an immediate decision and a detail option on a throttled session.

### Time, shifts, and outcomes

1. Capture cases due in one, two, and three ticks, plus multiple cases sharing a deadline.
2. End a shift with unresolved cases and record the absence or presence of consequence explanation and confirmation.
3. Capture preferred, acceptable, unnecessary, and unsafe reveals. Verify distinct tone, iconography, color independence, focus, and announcements.
4. Complete all three shifts and capture the debrief, internal scrolling, operator profile, Safety, Service, Capacity, evidence rate, XP, replay, and return to briefing.
5. Reproduce an evidence-free Balanced Operator path from a diagnostic seed and judge whether the 0 percent evidence rate is visually strong enough to counter the positive profile label.
6. Refresh and navigate away during case review, a detail picker, reveal, and late campaign.

### Branch-only QA

`/exception-room/play?preview=selected` stages a second-shift case for layout inspection. Use it only after the manual queue flow has been captured, and keep its evidence separate because the shortcut is available in production.

## Pass 5: Cross-product engineering

Run the following checks against the same Vercel deployment after the full user journeys:

1. Console and failed-network requests for every route and result branch.
2. Cold-load first paint, hydration duration, LCP, CLS, image transfer, and hub SVG parse cost.
3. Direct route titles, descriptions, canonical URLs, Open Graph, Twitter images, robots, sitemap, and link previews.
4. Keyboard order, visible focus, screen-reader names and roles, live results, and modal behavior.
5. 200 percent zoom, increased text size, 390 x 844, 430 x 932, and desktop mobile-canvas presentation.
6. System and manual motion combinations, Sound on and off, Haptics on and off, and unsupported-device behavior.
7. Valid, malformed, legacy, future-version, denied, and unavailable localStorage.
8. Rapid duplicate input, refresh, Back, Forward, replay, and cross-game XP reconciliation.
9. Analytics requests and payloads, especially seeds, scenario content, local profile data, and duplicate events.
10. Production dependency advisory state and effective security response headers.
11. Daily rollover at local midnight, two time zones, a backward clock change, and edited completion storage.

## Completion gate

The browser phase is complete only when every inventory row has one of these outcomes:

- `Pass`, with inspected evidence.
- `Finding`, with severity, actual behavior, expected behavior, and inspected evidence.
- `Not applicable`, with a source-backed reason.
- `Blocked`, with the exact environment limitation and attempted reproduction.

An unvisited row or an uninspected screenshot remains pending.
