# Product Lab Slice 1 verification

- **Captured:** 2026-07-15 America/Los_Angeles
- **Baseline:** Slice 0 at `8c9472c`
- **Implementation branch:** `codex/product-lab-slice-1`
- **Local production origin:** `http://localhost:3111`
- **Browser:** Google Chrome

## Scope delivered

Slice 1 adds the shared Product Lab structure without changing the visual direction of Significant:

- a persistent Lab header, skip link, portfolio return, privacy footer, and shared main-content focus target;
- a game-level header with Lab breadcrumb, game identity, game XP, and settings;
- versioned, Zod-validated preferences for sound, haptics, and motion;
- explicit `system`, `reduced`, and `full` motion choices, including an explicit full-motion override of a reduced operating-system preference;
- versioned, per-game Lab profile storage with legacy, malformed, denied-storage, and future-version handling;
- Significant campaign and daily progress synchronized into the shared Lab profile;
- sound, haptics, count-up, pulse, transform, and confetti behavior gated by the shared preferences;
- the campaign path width corrected at narrow viewports; and
- the unused `framer-motion` dependency removed after the count-up implementation moved to the shared motion runtime.

## Automated verification

| Check | Result |
|---|---:|
| Unit/component tests | 112 passed in 21 files |
| TypeScript | `npx tsc --noEmit` passed |
| ESLint | 0 errors, the same 3 existing warnings |
| Production build | Passed; all 6 app routes prerendered |
| Local Chrome verification | 18/18 checks passed |

The three existing lint warnings remain limited to unused parameters/imports in the scenario engine and its test. Node 26 test workers continue to emit the known experimental `localStorage` warning; storage denial and fallback tests pass.

## Rendered Chrome verification

The local production build was tested in Chrome at 320x760 and 390x844.

| Behavior | Result |
|---|---:|
| Lab home horizontal overflow at 320px | `320px` scroll width / `320px` client width |
| Significant path horizontal overflow at 320px | `320px` / `320px` |
| Significant path horizontal overflow at 390px | `390px` / `390px` |
| Skip link is first keyboard target and focuses shared main content | Passed |
| Lab and portfolio return links on Significant, About, Daily, and Play | Passed |
| Settings panel inside 320px viewport | `x=40`, `width=256` |
| Settings panel inside 390px viewport | `x=110`, `width=256` |
| Sound, haptics, and motion persistence after reload | Passed |
| Explicit reduced and full motion behavior | Passed |
| System preference honors reduced-motion media query | Passed |
| Legacy Significant sound migration | Passed |
| Legacy Lab XP migration | Passed |
| Significant baseline progress sync to Lab profile | `50 XP`, `baseline-calibrated` milestone |
| Unexpected app responses, console exceptions, or page errors | None |

Vercel Web Analytics requests its deployment-only `/_vercel/insights/script.js` endpoint when the production bundle runs locally. Its expected local 404 was excluded from app-error assertions; no application route or asset failed.

## Visual review

The rendered evidence was reviewed against the Slice 0 Lab screenshot, not only against DOM assertions. The violet game card, typography, pale background, rounded cards, campaign nodes, and orange daily CTA retain the established visual language. The additions are structural: two compact navigation layers inside Significant, visible progress, and a settings popover. No Slice 2 landing-page redesign was introduced early.

- [`slice-1-lab-home-320.png`](assets/slice-1-lab-home-320.png)
- [`slice-1-significant-320.png`](assets/slice-1-significant-320.png)
- [`slice-1-significant-settings-390.png`](assets/slice-1-significant-settings-390.png)

## Storage contract coverage

Preference and profile tests cover missing data, legacy data, malformed JSON/shape, localStorage denial, valid round trips, and future versions. Future-version payloads are read safely as defaults but are not overwritten, preserving forward compatibility. The shared profile stores per-game XP, named milestone IDs, and `lastPlayedAt`; it does not store raw scenario contents.

## Dependency and security note

`npm audit --omit=dev` still reports the same two moderate PostCSS findings nested under Next.js. The offered forced remediation would install a breaking older Next.js line, so no forced dependency mutation was applied.
