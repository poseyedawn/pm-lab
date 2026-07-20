# Mobile Game Hub Engagement Research

**Date:** 2026-07-17
**Scope:** A mobile-first Product Lab hub for three short product judgment games: Significant, Ship It, and Exception Room.
**Decision boundary:** This document sets the redesign direction. It does not approve visual implementation.

## Research question

What makes a small game hub engaging when the user should be able to understand the collection and start a game within seconds?

## Primary-source evidence

### 1. Put the games and the next action first

Xbox describes its Home experience around quick access, recently played games, curated discovery, and pinned favorites. The useful principle for Product Lab is not the console-scale navigation. It is that the player's library and quickest next action receive priority over secondary dashboards.

Source: [Welcome to Your New Xbox Home](https://news.xbox.com/en-us/2023/07/26/welcome-to-your-new-xbox-home/)

Netflix exposes mobile games as a row on the home screen and, on Android, as a dedicated shortcut. That pattern supports a direct route from discovery to selecting a title without requiring a separate browse hierarchy.

Source: [How to find and download Netflix mobile games](https://help.netflix.com/en/node/121924)

**Product Lab implication:** With only three games, the hub does not need search, genres, filters, a sidebar, or multiple navigation layers. It needs one obvious collection and one tap to enter a game.

### 2. Treat each game as a distinct product with consistent capsule art

Steam requires repeatable capsule formats for store and library surfaces, with game artwork and logos prepared for specific aspect ratios. This creates fast recognition while preserving a consistent browsing grid.

Source: [Steamworks graphical assets overview](https://partner.steamgames.com/doc/store/assets)

Google Play frames a game's store presence as its first impression. It emphasizes compelling media, clear communication of value, and an original but internally consistent visual experience.

Source: [Getting featured on Google Play](https://play.google.com/console/about/guides/featuring/)

**Product Lab implication:** Every game needs purpose-built hub artwork with the same crop contract and a title-safe area. A gameplay screenshot can inform the artwork, but it should not carry embedded interface text behind another title layer.

### 3. Design for a handheld screen instead of shrinking a desktop hub

Apple recommends flexible layouts that respond to aspect ratio, preserve safe areas, and keep controls physically comfortable. It warns that simple scaling can make controls too small or poorly positioned. Apple also recommends 17 point body text where possible, 44 by 44 point primary touch targets, vertical scrolling instead of compressed content, and visible press feedback for touch controls.

Source: [Design great interfaces for handheld games](https://developer.apple.com/videos/play/meet-with-apple/243/)

**Product Lab implication:** The 390 by 844 phone canvas remains the primary design target, with 320 by 568 as the narrow acceptance size. Cards can be large and vertically scrollable. Text and controls should not be compressed to preserve a desktop composition.

## What the supplied references contribute

### Desktop references

The first three references share useful hierarchy patterns:

- A strong focal area rather than a flat list of identical modules.
- Bold game artwork that helps users recognize a title before reading every word.
- Compact navigation that stays secondary to the game content.
- Distinct sections for featured content and the broader library.
- A darker or quieter shell that lets colorful game art carry the energy.

They also contain patterns that do not fit Product Lab at its current scale:

- Dense finance, social, statistics, and activity sidebars.
- Search and category navigation for a three-game library.
- Large empty hero areas that push the playable collection below the fold.

### Mobile references

The final two references contribute the strongest mobile cues:

- Large, colorful tiles that can be scanned with one thumb.
- Chunky grouping, rounded shapes, and immediate visual feedback.
- Strong character or world art that gives the collection energy.
- A clear distinction between the global hub and the content inside each tile.

The casino-style example should be used carefully. Its color and scannability are useful, but the currency bars, bonus badges, notification pressure, and slot-machine framing would weaken Product Lab's professional and trustworthy positioning.

## Recommended engagement model

### First visit

1. State what Product Lab is in one short line.
2. Present all three games immediately.
3. Give each game a clear promise, expected time, and primary mode.
4. Make the whole card a touch target.
5. Let the player choose without an onboarding carousel.

### Returning visit

1. Offer a compact `Continue` or `Played recently` treatment for the last game.
2. Preserve the full three-game library below it.
3. Show per-game progress only when it helps the next decision.
4. Keep total XP secondary. A zero-value status should not compete with game discovery.

### Card anatomy

Each game card should use the same structural contract:

- Dedicated capsule art with a consistent aspect ratio.
- Field test number as a small collection marker.
- Game name.
- One-line gameplay promise.
- Compact time or mode metadata.
- One clear launch affordance.
- Optional progress state after the user has played.

## Direction for the redesign stage

The hub should feel like a pocket arcade for product judgment, not a dashboard and not a game store. The shared shell can stay visually calm while each game card carries a bold, colorful world. The collection should remain narrow, tactile, and easy to scan at 390 by 844, with a deliberate 320 by 568 fallback.

## Non-goals for the next redesign

- No search, filters, genres, or sidebar navigation.
- No leaderboard, social feed, virtual currency, or notification pressure.
- No autoplay video or large motion sequence before the games become usable.
- No desktop-first layout that is scaled down for mobile.
- No redesign of the games themselves during the hub redesign.

## Acceptance principles

- All three games are visible or clearly reachable without horizontal scrolling.
- A first-time user can explain the difference between the games from the cards alone.
- A returning user can resume the most relevant game without losing access to the full library.
- Primary card targets meet the 44 by 44 point touch target baseline.
- Text remains readable over art at 320 and 390 widths.
- Motion, sound, and haptic feedback respect the existing preference system.
- The hub uses real game artwork and library icons, not emoji or placeholder graphics.
