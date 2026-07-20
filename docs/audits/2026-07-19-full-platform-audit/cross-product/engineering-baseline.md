# Cross-product engineering baseline

Captured: 2026-07-19.

Audited commit: `d608c67` on `codex/game-hub-floating-redesign`.

## Automated checks

| Check | Result | Notes |
| --- | --- | --- |
| Vitest | Pass | 45 test files and 242 tests passed. |
| ESLint | Pass with warnings | 0 errors and 4 unused-variable warnings. |
| Next.js production build | Pass | Compilation, TypeScript, static generation, and route output completed. |
| Route generation | Pass | 13 product routes plus `_not-found` were generated. |
| End-to-end browser suite | Not present | No complete route or gameplay journey runs in a real browser. |
| Automated accessibility suite | Not present | No axe or equivalent accessibility-tree checks are configured. |
| Production dependency audit | Two moderate entries | One PostCSS advisory path through the current Next dependency; 0 high and 0 critical. |

## Local direct-route baseline

Captured from a fresh Next.js development server at `http://127.0.0.1:3110` on 2026-07-19. These are HTTP and document-title checks, not accepted visual evidence.

| Route | Status | Document title |
| --- | --- | --- |
| `/` | 200 | `Alvin's Product Lab` |
| `/significant` | 200 | `Alvin's Product Lab` |
| `/significant/about` | 200 | `How Significant was designed` |
| `/significant/calibration` | 200 | `Alvin's Product Lab` |
| `/significant/daily` | 200 | `Alvin's Product Lab` |
| `/significant/play?level=1` | 200 | `Alvin's Product Lab` |
| `/ship-it` | 200 | `Alvin's Product Lab` |
| `/ship-it/about` | 200 | `How Ship It was designed` |
| `/ship-it/daily` | 200 | `Alvin's Product Lab` |
| `/ship-it/play` | 200 | `Alvin's Product Lab` |
| `/exception-room` | 200 | `Exception Room | Alvin's Product Lab` |
| `/exception-room/play` | 200 | `Exception Room | Alvin's Product Lab` |

The development server emitted successful request logs for all routes and no server-side exception during this pass. The generic titles on Significant and Ship It confirm the metadata source finding. Client hydration, console behavior, and rendered state were later reconciled in `evidence-log.md`.

The live hub, Significant, Ship It, and Exception Room documents expose no canonical URL, Open Graph title, Open Graph description, Open Graph image, Twitter card, or theme color. Significant and Ship It also inherit the hub description. Production requests for robots, sitemap, manifest, and generated social-image paths returned 404.

## Vercel deployment baseline

Read-only inspection on 2026-07-19 confirmed that the linked `.vercel/project.json` targets Vercel project `pm-lab` and that [pm-lab-coral.vercel.app](https://pm-lab-coral.vercel.app) points to a production deployment in `Ready` state.

- Deployment ID: `dpl_34dCMCrhqV1qaGNtpiCoEMhoEaxv`.
- Deployment URL: `pm-4zjiy1yfa-alvins-projects-b8dbbace.vercel.app`.
- Created: 2026-07-17 at 23:05:45 PDT.
- Every route in the local direct-route table returned 200 from the public alias with the same document title.
- SHA-256 checks for the current hub title, Product Lab wordmark, and all three depth-card assets matched the public files byte for byte.

The Vercel inspection response did not expose Git metadata, so these checks do not prove that every deployed JavaScript chunk was built from commit `d608c67`. They do establish that the production alias is live and serves the audited checkout's critical hub assets.

## Production response headers

The public hub response included HTTPS and `strict-transport-security: max-age=63072000; includeSubDomains; preload`. It did not include an explicit Content Security Policy, frame policy, referrer policy, permissions policy, or `X-Content-Type-Options` during this capture. See `source-review.md` for the scoped P3 hardening finding.

## Production dependency advisory

`npm audit --omit=dev` reported 0 critical, 0 high, 2 moderate, 0 low, and 0 informational entries. Both moderate entries represent the same transitive PostCSS advisory through Next:

| Package | Installed path | Advisory range | First patched |
| --- | --- | --- | --- |
| `next` | Direct `16.2.10` | Includes affected PostCSS | No current Next release with the patched nested version was identified |
| `postcss` | `next > postcss@8.4.31` | `<8.5.10` | `8.5.10` |

The direct Tailwind and Vite path already resolves `postcss@8.5.16`. The audit's automatic fix suggestion would downgrade Next to 9.3.3 and is not a valid resolution for this application.

## Non-blocking warnings

1. `src/hooks/ship-it/useShipRun.ts` imports the unused `Review` type.
2. `src/lib/engine/archetypes.ts` has two unused `rng` parameters.
3. `src/lib/engine/scenario.test.ts` imports unused `ARCHETYPES`.
4. Vitest emits Node environment warnings because browser localStorage is unavailable without a localStorage file.
5. One test reaches an unimplemented JSDOM canvas API. The suite still passes, so the real browser audit must determine whether any visible chart or confetti path fails in production.
6. Vite reports that `vite-tsconfig-paths` can be replaced by native `resolve.tsconfigPaths` support. This is maintenance work, not a user-facing failure.

## Evidence limits

These checks establish build and automated-test health only. They do not prove that interactions are intuitive, visually correct, accessible, persistent in a real browser, or free of runtime warnings.
