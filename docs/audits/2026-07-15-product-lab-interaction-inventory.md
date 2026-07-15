# Product Lab Interaction and State Inventory

- **Date:** 2026-07-15
- **Baseline:** `main` at `dbd8362`
- **Companion audit:** [Experience audit](2026-07-15-product-lab-experience-audit.md)
- **Purpose:** Account for every source-reachable route, control, transition, persistence state, and failure fallback, then map the highest-value states to accepted live evidence.

## Evidence legend

- **Source-confirmed:** behavior is directly established by production-aligned code.
- **Live-confirmed:** exercised against the production URL in the 32-check Chrome run.
- **Accepted screenshot:** captured in the current run, opened, and inspected.

## Route inventory

| ID | Route | Source | Primary states | Capture target |
|---|---|---|---|---|
| R-01 | `/` | `src/app/page.tsx` | Lab index | `01-lab-home.png` |
| R-02 | `/significant` | `src/app/significant/page.tsx` | loading, first visit, progressed, completed | `02`–`05` |
| R-03 | `/significant/play?level=N` | `src/app/significant/play/page.tsx` | loading, deciding, correct reveal, incorrect reveal | `06`–`10` |
| R-04 | `/significant/daily` | `src/app/significant/daily/page.tsx` | loading, unplayed, correct result, incorrect result | `11`–`14` |
| R-05 | `/significant/about` | `src/app/significant/about/page.tsx` | article | `15-about.png` |

No custom 404, error boundary, offline route, profile route, settings route, or Lab-to-portfolio route exists on the audited baseline.

## Lab home interactions

| ID | Trigger | Source-confirmed result | Analytics | Persistence | Health |
|---|---|---|---|---|---|
| LAB-01 | Click/tap Significant card | Navigate to `/significant` | None | None | Works; no funnel visibility |
| LAB-02 | Keyboard focus + Enter on card | Semantic `Link` should navigate | None | None | Functionally sound; explicit focus style absent |
| LAB-03 | Pointer press on card | `active:scale-95` compresses the whole card | None | None | Navigation live-confirmed; motion preference is not applied |

There are no interactions for portfolio return, game filtering, Lab profile, settings, in-progress games, or direct calibration.

## Significant home interactions and states

| ID | State/trigger | Source-confirmed result | Analytics | Persistence | Health |
|---|---|---|---|---|---|
| SIG-00 | Initial hydration | Empty `main` with `aria-busy=true` | None | Reads local state | Accessible status exists; visually blank |
| SIG-01 | First successful hydration | Grants 50 XP and sets `warmupDone` without player action | None | Significant + Lab profile | Misrepresents a calibration the player did not perform |
| SIG-02 | Click/tap Sound | Toggles sound preference and label | `sound_toggled` | Significant state | Works; control is small and game-specific |
| SIG-03 | Activate open level node | Navigate to `/significant/play?level=N` | None until play page mounts | None | Works |
| SIG-04 | Inspect locked node | Noninteractive `div` with locked label | None | None | Live-confirmed: nine locked nodes on first visit |
| SIG-05 | Activate completed node | Replay the level | None until play page mounts | Existing progress retained | Works; replay consequence is unexplained |
| SIG-06 | Activate Daily experiment | Navigate to `/significant/daily` | None until daily page mounts | None | Works; competes with first-run campaign |
| SIG-07 | Activate design link | Navigate to `/significant/about` | None | None | Works; no case-study funnel event |
| SIG-08 | All levels become done | Render IQ card; fire completion event once | `campaign_complete` | Dedup flag persisted | Works; only reachable after ten correct levels |

There is no explicit Continue button, back-to-Lab control, campaign help, star legend, shield explanation, progress reset, or first-run tutorial.

## Campaign readout interactions

| ID | Trigger | Source-confirmed result | Feedback | Analytics | Health |
|---|---|---|---|---|---|
| PLAY-00 | Route mounts | Generate seeded scenario from level + attempts | None | `game_start` | Works; fires before user decision |
| PLAY-01 | Toggle Sound | Persist sound preference | Label update | `sound_toggled` | Works |
| PLAY-02 | Choose Ship | Lock round and compare `ship` to truth | Click + win/lose + haptic + optional confetti | `round_complete` | Works |
| PLAY-03 | Choose Kill | Lock round and compare `kill` to truth | Same orchestration | `round_complete` | Works |
| PLAY-04 | Choose Keep Running | Lock round and compare `keep` to truth | Same orchestration | `round_complete` | Works |
| PLAY-05 | Rapid second decision | `stateRef` guard returns `null` | No duplicate feedback | No duplicate event | Strong guard |
| PLAY-06 | Keyboard Tab | Move through decision buttons and sound control | Browser focus | None | Live-confirmed; campaign-home order is Sound, open level, Daily, About |
| PLAY-07 | Keyboard Enter/Space | Activate focused semantic button | Same as pointer | Same as pointer | Source supports it |
| PLAY-08 | Direct invalid `level` query | Scenario falls back to level 1, header keeps invalid value, completion writes invalid ID | Normal round feedback | Invalid level included | Confirmed defect |

There is no glossary interaction, chart detail view, evidence tooltip, reason selection, skip, pause, help, or explicit exit.

## Reveal interactions

| ID | State/trigger | Source-confirmed result | Persistence | Health |
|---|---|---|---|---|
| REV-01 | Correct call | Green result, trap name, correct call, explanation, XP, optional random bonus | Pending until Next | Clear outcome; source readout disappears |
| REV-02 | Incorrect call | Red result, trap name, correct call, explanation, zero XP | Pending until Next | Gentle failure; source readout disappears |
| REV-03 | Select Next after correct | Save level result + XP, increment combo, navigate home | Local storage | Works; label is accurate enough |
| REV-04 | Select Next after incorrect | Save failed attempt, reset combo, navigate home | Local storage | Works; “Next” obscures that retry is required |
| REV-05 | Rapid double Next | `nextCalledRef` prevents duplicate grant | Single write | Strong guard |
| REV-06 | Correct with random critical insight | 5% chance doubles earned XP | Saved after Next | Reward is unrelated to player skill |
| REV-07 | Reduced-motion system preference | Confetti is skipped | Preference not persisted | Partial; other motion continues |

There is no evidence comparison, reveal replay, explanation expansion, next-case direct continuation, or user-facing feedback error.

## Campaign progression states

| ID | State transition | Source-confirmed result | Health |
|---|---|---|---|
| PROG-01 | First correct attempt | Award 3 stars, mark done, unlock next | Works; 3-star meaning not explained |
| PROG-02 | Correct after one or more failures | Award at least 1 star, mark done, unlock next | Works |
| PROG-03 | Replay previously mastered level incorrectly | Preserve prior correct state and stars; combo resets | Sensible mastery preservation |
| PROG-04 | Consecutive correct calls | Campaign combo increases; XP multiplier caps at ×3 | Works; combo meaning appears only during play |
| PROG-05 | Refresh | Restore stored state | Works when local storage is available |
| PROG-06 | Storage unavailable | Use in-memory fallback for current session | Strong resilience; no persistence notice |
| PROG-07 | Corrupt stored JSON | Merge parsed partial state into defaults or reset | Generally resilient; runtime schema absent |
| PROG-08 | Campaign complete | Render title based on first-try levels and one-time confetti | Good foundation; profile lacks breakdown |

## Campaign completion interactions

| ID | Trigger | Source-confirmed result | Analytics | Health |
|---|---|---|---|---|
| IQ-01 | Select Copy result | Write text summary to clipboard | `share_clicked` after success | Works on success; no visible copied state |
| IQ-02 | Clipboard resolves | No user-facing confirmation | Tracked | Ordinary and ambiguous |
| IQ-03 | Clipboard rejects/unavailable | Error is swallowed | None | Confirmed silent failure |

There is no native share, branded image, retry, per-trap report, or Lab profile navigation.

## Daily interactions and states

| ID | State/trigger | Source-confirmed result | Analytics | Health |
|---|---|---|---|---|
| DAY-00 | Initial hydration | Empty busy `main`; load today's state and scenario | None | Same blank-loading risk |
| DAY-01 | First unplayed mount | Show deterministic scenario for local date | `game_start: daily` | Works |
| DAY-02 | Toggle Sound | Persist game sound preference | `sound_toggled` | Works |
| DAY-03 | Ship/Kill/Keep Running | Same round transition as campaign | `round_complete`, `daily_played` | Works |
| DAY-04 | Complete any result | Record date, correctness, XP, and participation streak | `daily_played` | Humane participation model |
| DAY-05 | Streak increases after render | Track extended streak | `streak_extended` | Works |
| DAY-06 | Seven-day milestone | Add shield, capped at two | None | Invisible mechanic |
| DAY-07 | One missed day with shield | Spend shield and preserve streak | None | Invisible repair |
| DAY-08 | Revisit same day | Show result, countdown, share, and back link | None | Functional dead-end risk |
| DAY-09 | Countdown tick | Update once per second | None | Live-confirmed across successive daily result captures |
| DAY-10 | Local date changes while open | Replace date and deterministic scenario | None | Source supports rollover |
| DAY-11 | Select Share result | Copy spoiler-safe text | `share_clicked` on success | Works; native share absent |
| DAY-12 | Clipboard unavailable | Render read-only textarea | None | Good fallback |
| DAY-13 | Clipboard rejects | Swallow rejection; no message | None | Confirmed silent failure |
| DAY-14 | Select Back to campaign | Navigate to `/significant` | None | Works; small secondary link |

There is no practice-another-case action, campaign Continue CTA, daily explanation, timezone disclosure, or share deep-link source handling.

## About-page interactions

| ID | Trigger | Source-confirmed result | Analytics | Health |
|---|---|---|---|---|
| ABOUT-01 | Scroll/read | Static article | None | Captured at 1,544px document height; text-heavy scan cost confirmed |
| ABOUT-02 | Select Back to game | Navigate to `/significant` | None | Works |

There are no research-source links, repository link, architecture interaction, before/after evidence, portfolio return, author/contact link, or tracked case-study view.

## Global preference and accessibility states

| ID | Condition | Source-confirmed behavior | Gap |
|---|---|---|---|
| A11Y-01 | `prefers-reduced-motion` | Confetti disabled in round and IQ celebration | CSS pulse, transforms, and CountUp continue |
| A11Y-02 | Sound off | Web Audio tones do not play | Haptics remain active |
| A11Y-03 | Haptics unsupported | Vibration silently does nothing | Correct fallback |
| A11Y-04 | Haptics unwanted | No control exists | Accessibility preference gap |
| A11Y-05 | Keyboard play | Native buttons and links are operable | Live-confirmed; links use Chrome's 1px default auto outline, buttons use an authored 4px outline |
| A11Y-06 | Screen reader chart | Receives “Daily conversion rate, control vs variant” | No data/trend equivalent |
| A11Y-07 | Screen reader segments | Reads table cells | No headers or caption |
| A11Y-08 | Outcome without color | Correct/incorrect text remains present | Strong |
| A11Y-09 | 320px narrow viewport | No horizontal overflow; all decision buttons visible | Live-confirmed; document is 583px in a 568px viewport, requiring a slight 15px scroll |
| A11Y-10 | 390px campaign map | Alternating translated nodes expand page width | Live-confirmed 5px horizontal overflow (`395 > 390`) |

## Screenshot acceptance queue

**Status:** 18/18 accepted after individual visual inspection.

| File | Required state | Required interaction evidence |
|---|---|---|
| `01-lab-home.png` | Cold Lab home | Default and focus treatment |
| `02-significant-first.png` | First visit | 50 XP, banner, open/locked nodes |
| `03-significant-progressed.png` | Mixed done/open/locked | Stars, combo implications, continue clarity |
| `04-significant-complete.png` | All levels done | IQ card and share control |
| `05-significant-focus.png` | Keyboard focus | Level, sound, daily, about focus states |
| `06-round-default.png` | Campaign deciding | Full readout hierarchy and buttons |
| `07-round-segments.png` | Segment archetype | Table and chart layout |
| `08-reveal-correct.png` | Correct result | Feedback hierarchy and missing evidence |
| `09-reveal-incorrect.png` | Incorrect result | Failure recovery and Next wording |
| `10-round-reduced-motion.png` | Reduced motion | Static equivalent and remaining motion |
| `11-daily-unplayed.png` | Daily deciding | Daily differentiation |
| `12-daily-correct.png` | Correct completed | Countdown/share/next actions |
| `13-daily-incorrect.png` | Incorrect completed | Failure copy and recovery |
| `14-daily-share-fallback.png` | Clipboard unavailable | Text fallback |
| `15-about.png` | Case study | Scan hierarchy and link affordances |
| `16-desktop-lab.png` | Wide desktop | Composition and unused space |
| `17-desktop-round.png` | Wide desktop | Game focus and supporting space |
| `18-mobile-320.png` | Narrow mobile | Reflow, clipping, and target spacing |

All 18 accepted screenshots were captured in the final current run, opened, inspected, and tied back to the IDs above. The functional log contains 32/32 passing checks. Machine-readable evidence is in [`assets/2026-07-15-product-lab/live-evidence.json`](assets/2026-07-15-product-lab/live-evidence.json); the reproducible runner is [`live-audit-runner.mjs`](live-audit-runner.mjs).

Hardware sound character, vibration intensity, 200% zoom, and 375px/768px breakpoint captures remain explicit exclusions; control state, persistence, reduced-motion detection, and fallbacks were exercised.
