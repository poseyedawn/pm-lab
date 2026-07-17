# Product Lab Consolidation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** One trunk where the Product Lab (slice-5 redesign: LabShell, phone frame, services layer) contains all three games — Significant (redesigned), Ship It, Exception Room — each in a consistent per-game pod, with the branch/worktree sprawl retired. **No visual restyling of Ship It or Exception Room in this pass.**

**Current state (2026-07-16):**
- `codex/exception-room-ui` (pushed): main + Ship It + Exception Room, OLD architecture/art. Checked out in `pm-lab/`.
- `codex/product-lab-slice-5` (local only, worktree `pm-lab-slice-5/`): main + redesign (services, GameShell, phone frame, new Significant, art direction). No Ship It/Exception Room. Deleted `lib/analytics.ts`, `lib/labProfile.ts`; removed framer-motion; added zod; profile is `pmlab:profile:v2` per-game via `labProfileService`.
- `origin/feature/significant` (GitHub default): main + Ship It only.

## Global constraints

- Integration branch: `feature/product-lab`, based on slice-5, merging `codex/exception-room-ui`.
- Conflict policy: slice-5 wins on all shared platform files (`layout.tsx`, `page.tsx`, `globals.css`, `progress.ts`, `vitest.setup.ts`, significant components); union on `package.json` (keep zod + phosphor + **framer-motion** — Ship It needs it); `sound.ts` = slice-5 + Ship It's `heartbeat` line.
- Games keep their own gameplay state keys (`pmlab:shipit:v1`, `pmlab:exception-room:v1`); lab-wide XP flows ONLY through `labProfileService.saveGameProgress` (`pmlab:profile:v2`). Delete `src/lib/labProfile.ts`.
- Analytics only via `@/services/analyticsService` typed events — extend `src/types/analytics.ts` with the Ship It and Exception Room events instead of loosening types.
- Per-game pod convention: `src/app/<game>/`, `src/components/<game>/`, `src/lib/<game>/`, `src/hooks/<game>/`, `public/<game>/`. (Rename `components/shipit` → `components/ship-it`, `lib/shipit` → `lib/ship-it`, move `hooks/useShip*` → `hooks/ship-it/`, `public/assets/exception-room/` → `public/exception-room/`.)
- Every task ends with `npm test && npm run lint && npm run build` green and a conventional commit.

### Task 1: Integration branch + merge
- [ ] In `pm-lab/`: `git checkout -b feature/product-lab codex/product-lab-slice-5`
- [ ] `git merge codex/exception-room-ui` — resolve per conflict policy above
- [ ] Post-merge sweep: delete `src/lib/labProfile.ts`; old `src/app/page.tsx` GameCard version and old significant pages must be slice-5's; `next.config`/README sensible union
- [ ] Expect red tests/build (old imports) — commit the merge itself once tree shape is right: `merge: bring ship-it and exception-room into the product lab redesign`

### Task 2: Register both games on the platform
- [ ] `src/types/lab.ts`: `GameId = 'significant' | 'ship-it' | 'exception-room'`; widen `GameTheme.accent` with `'teal'`
- [ ] `src/lib/gameThemes.ts`: add `'exception-room': { accent: 'teal', iconKey: 'exception-room' }`
- [ ] `src/services/labProfileService.ts`: extend `gameIdSchema` + `profileSchema.games` with both new ids
- [ ] `src/types/analytics.ts`: add Ship It events (`card_choice`, `run_complete`, `daily_played`, `streak_extended`) and Exception Room's events (read `lib/exception-room/analytics.ts` for its names) to the typed event map
- [ ] Tests for the schema additions pass; commit `feat(lab): register ship-it and exception-room in lab platform types`

### Task 3: Rewire Ship It onto the platform (no restyle)
- [ ] Rename pods: `components/shipit` → `components/ship-it`, `lib/shipit` → `lib/ship-it`, hooks into `hooks/ship-it/`; fix imports
- [ ] `lib/ship-it/state.ts`: drop `syncLabProfile`; `saveShipItState` also calls `saveGameProgress({ gameId: 'ship-it', xp, completedMilestones, lastPlayedAt: new Date().toISOString() })` (milestones: best ratings, e.g. `rating:{Rating}`)
- [ ] Replace `@/lib/analytics` imports with `@/services/analyticsService` in all ship-it files
- [ ] Wrap `/ship-it` pages in `GameShell gameId="ship-it"`; remove the page-local `← Ship It` headers where GameHeader now covers home/settings; keep everything else visually as-is
- [ ] Ship It's sound toggle: point at `preferencesService` if that is where GameSettings persists sound (read `GameSettings.tsx` first); otherwise keep local soundOn
- [ ] All ship-it tests updated for new paths; commit `refactor(ship-it): move onto lab platform services and shell`

### Task 4: Rewire Exception Room the same way
- [ ] `public/assets/exception-room/` → `public/exception-room/`; fix Image srcs
- [ ] `lib/exception-room/state` → `saveGameProgress` for XP; analytics → `analyticsService`
- [ ] Wrap pages in `GameShell gameId="exception-room"`
- [ ] Commit `refactor(exception-room): move onto lab platform services and shell`

### Task 5: Lab landing becomes the hub
- [ ] Keep the Significant hero entry as Field Test 01 on `/`
- [ ] Add a "More field tests" strip under the hero: pastel cards for Ship It (Field Test 02) and Exception Room (Field Test 03) linking to `/ship-it` and `/exception-room`, firing `game_selected` with their gameIds; show each game's XP from the lab profile
- [ ] Commit `feat(lab): landing hub lists all three field tests`

### Task 6: Verify + publish + cleanup proposal
- [ ] Full suite, lint, build; browser QA: hub → each game start → one loop of play each; XP lands in `pmlab:profile:v2` from every game
- [ ] Push `feature/product-lab`; open PR **based on `main`** titled `feat: Product Lab — one shell, three games`
- [ ] Report to Alvin with the cleanup list (his call): flip GitHub default branch → `main`; after merge delete branches `feature/ship-it`, `feature/significant`, `codex/exception-room-{plan,engine,ui}`, `codex/product-lab-{audit-plan,slice-0..5}`; `git worktree remove` the 7 `pm-lab-*` worktrees; drop the slice-5 launch.json entry
