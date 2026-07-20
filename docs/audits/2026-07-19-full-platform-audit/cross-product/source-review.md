# Cross-product source review

This file records findings confirmed from the current source at commit `d608c67`. Browser reconciliation is complete in `evidence-log.md` and `../FINDINGS-REGISTER.md`.

## Confirmed strengths

### SRC-S01: Shared preferences and lab profile have strict runtime validation

`preferencesService.ts` and `labProfileService.ts` use strict Zod schemas, reject future versions during writes, migrate legacy records, and preserve a session-only memory fallback when browser storage fails.

Why it matters: this is credible engineering work. The shared settings and XP layer are treated as product infrastructure instead of component-local state.

### SRC-S02: Consequential reward paths include duplicate-input guards

Significant prevents repeated calls and repeated Continue actions from granting XP twice. Ship It protects run completion and daily completion from duplicate awards. Exception Room records its one-time campaign reward with a persisted flag.

Why it matters: repeated taps and React effect re-entry are realistic mobile failure modes, and the implementation acknowledges them.

### SRC-S03: Analytics uses a typed allowlist and fails closed

The main analytics service validates every event against a discriminated Zod union, rejects extra fields, coarsens streak and performance values, and catches provider failures so analytics cannot interrupt play.

Why it matters: this is stronger than ad hoc tracking and supports the portfolio claim that the product was engineered deliberately.

### SRC-S04: The portfolio exit is explicit and safely implemented

Both shared portfolio links open `https://alvn.io` in a new tab, disclose that behavior in their accessible names, include `noopener noreferrer`, and record the source surface. A read-only request on 2026-07-19 returned 200 from the destination.

Why it matters: the hub is a portfolio artifact, so returning to the main portfolio is part of the core journey rather than utility chrome.

### SRC-S05: TypeScript boundaries are disciplined

The project enables strict TypeScript, uses the `@/` import alias, and contains no production `any` annotations or suppression comments. The only `@ts-expect-error` found is a test proving that arbitrary analytics event names are rejected.

Why it matters: the games rely on many state-machine branches and authored content shapes. Strong compile-time boundaries reduce the chance that those systems silently drift apart.

## Confirmed risks

### SRC-P1-01: Ship It ignores the shared haptics preference

Severity: `P1` accessibility and preference failure.

Evidence:

- `src/components/ship-it/RunScreen.tsx:45` triggers failure vibration without an enabled flag.
- `src/components/ship-it/RunScreen.tsx:54` vibrates on every card choice without an enabled flag.
- `src/components/juice/haptics.ts:3` defaults `enabled` to `true`.

Impact: a visitor can turn Haptics off in shared settings and still receive vibration throughout Ship It. The control therefore makes a promise the game does not honor.

Browser verification required: disable Haptics, complete a choice and a failed run on a vibration-capable device, and confirm whether the operating system reports vibration calls.

### SRC-P1-02: Ship It does not consistently honor the app's manual motion preference

Severity: `P1` accessibility and preference failure.

Evidence:

- Ship It components use Framer Motion's `useReducedMotion()` directly rather than the shared `usePreferences()` result.
- `DilemmaCard.tsx:23` disables dragging only for the operating-system preference.
- `RunScreen.tsx:30` sends only the operating-system value to confetti and transition logic.
- The global CSS shortens CSS transitions for the app preference, but it cannot prevent canvas confetti or change JavaScript drag behavior.

Impact: selecting Reduced in Product Lab may still permit card dragging and completion confetti in Ship It. Selecting Full may also conflict with an operating-system preference because some components continue to read the system value directly.

Browser verification required: compare System, Reduced, and Full settings with the operating system set both ways.

### SRC-P1-03: The public analytics statement conflicts with Exception Room tracking

Severity: `P1` portfolio trust failure.

Evidence:

- `src/app/significant/about/page.tsx:36-38` states that aggregate analytics exclude seeds.
- `src/components/exception-room/ExceptionPlayClient.tsx:30-34` tracks `exception_run_started` with the run seed.
- `src/services/analyticsService.ts:75` explicitly validates and forwards that seed.

Impact: the implementation contradicts a public privacy claim. A seed is not necessarily personal data, but experienced reviewers will notice that the stated data boundary is not true across the shared analytics service.

Recommendation direction for the later plan: remove the seed from analytics or narrow the public statement so it is explicitly scoped and accurate.

### SRC-P2-01: Two game-specific storage readers accept valid JSON with invalid shapes

Severity: `P2` state robustness risk.

Evidence:

- `src/lib/progress.ts:86-91` parses JSON and spreads it over defaults without runtime validation.
- `src/lib/ship-it/state.ts:51-56` uses the same unchecked spread.
- Existing tests cover malformed JSON, but not valid JSON containing wrong types, impossible ratings, negative XP, or a non-object campaign.

Impact: extension scripts, older builds, manual edits, or partial writes can produce valid JSON that later crashes route logic or displays impossible progress. This is inconsistent with the stricter shared profile and preference services.

### SRC-P2-02: QA shortcut routes remain active in the production application

Severity: `P2` product integrity and maintainability risk.

Evidence:

- `/significant/calibration?call=ship` or another valid call starts directly in a resolved state and completes calibration through the normal reward path.
- `/exception-room/play?preview=selected` injects a staged second-shift run and can proceed through the normal persistence path.
- Neither shortcut is gated by development or preview environment checks.

Impact: shared or indexed QA URLs can bypass intended onboarding, distort local progress, and create analytics events that appear to be real play.

### SRC-P2-03: Shared settings do not expose save failure

Severity: `P2` recovery and trust risk.

Evidence:

- `savePreferences()` returns a boolean when persistence fails or a future version is present.
- `usePreferences.updatePreference()` updates React state but ignores that return value.

Impact: the UI can display a setting as changed for the current session without explaining that it may not persist. The memory fallback reduces harm during the session but does not make the promise durable.

### SRC-P1-04: Standard games compose multiple layers of mobile chrome

Severity: `P1` mobile viewport and navigation-hierarchy risk.

The root `LabShell` always renders the Product Lab header and footer. Ship It and Exception Room use `standard` chrome, so they also render `GameHeader`. Their route screens then add their own page or run headers. Exception Room additionally places a full viewport-height shell below those headers.

Impact: the two standard games can show duplicated brand, XP, navigation, sound, and title controls while reducing the playable viewport. The full-height Exception Room shell can also create nested scrolling inside an already scrollable mobile frame.

Browser verification required: capture the complete top and bottom chrome for every Ship It and Exception Room route at 390 x 844 and desktop mobile-canvas size.

### SRC-P2-04: The hub title SVG is unusually heavy for its rendered size

Severity: `P2` mobile performance risk.

`pick-field-test-logo.svg` is about 448 KB and contains dense traced path data while rendering at roughly 304 pixels wide. The hub also loads the world background, three depth-card images, a wordmark, and several ambient assets.

Impact: the collection's most important first impression may spend avoidable transfer, parse, and paint time on a decorative title asset. This is a source risk, not a measured performance failure.

Browser verification required: capture transfer size, main-thread timing, LCP element, and layout stability on a mobile-throttled Vercel session.

### SRC-P2-05: Two games inherit generic sharing metadata

Severity: `P2` portfolio discoverability and first-impression risk.

Evidence:

- `src/app/layout.tsx:19-22` defines only the generic Product Lab title and description.
- `src/app/exception-room/layout.tsx:5-8` adds game-specific metadata for Exception Room.
- Significant and Ship It have metadata only on their About pages, not on their game entry routes.
- No Open Graph image, Twitter image, sitemap, robots file, or web app manifest exists in `src/app` or `public`; only the favicon is present.
- Read-only production requests on 2026-07-19 returned 404 for `/robots.txt`, `/sitemap.xml`, both common manifest paths, `/opengraph-image`, and `/twitter-image`.

Impact: a reviewer who shares or bookmarks Significant or Ship It can receive the generic hub title and no designed game preview. The experience is visually differentiated in the product but not in the link surface that brings portfolio visitors into it.

Browser verification required: inspect the final Vercel document title, description, canonical URL, and social-preview response for the hub and every game entry route.

### SRC-P2-06: The automated suite does not exercise a complete browser journey or accessibility tree

Severity: `P2` release-confidence risk.

Evidence:

- `package.json` exposes Vitest and Testing Library scripts only.
- No Playwright, Cypress, Webdriver, axe, or equivalent end-to-end or accessibility test configuration is present.
- The passing unit and component suite therefore does not cover route transitions, real localStorage, browser history, responsive overflow, focus movement, live announcements, pointer gestures, vibration, sound, or production asset loading.

Impact: several source-confirmed risks live precisely at component and browser boundaries. A clean build and 242 passing tests are useful, but they cannot prevent the portfolio experience from regressing in the paths a reviewer actually uses.

This is a coverage finding, not a claim that the untested behavior is broken.

### SRC-P2-07: Game routes send an empty main region until client hydration completes

Severity: `P2` first-paint, resilience, and discoverability risk.

Evidence:

- `src/app/significant/page.tsx:37-39` returns an empty busy main until campaign storage is ready.
- `src/app/ship-it/page.tsx:17-19` returns an empty busy main until local state loads in an effect.
- `src/app/exception-room/page.tsx:27` returns an empty busy main until local state loads in an effect.
- Fresh local HTTP responses for all three entry routes, both Significant play routes, both Ship It run routes, and Exception Room play contained shared header controls but no game heading or primary game action. Each exposed an empty `main` with `aria-busy="true"`. The hub response did contain its H1 and all three game links.

Impact: the first meaningful game explanation depends on JavaScript hydration and a post-mount storage read. On a slow device the route can briefly look empty; with blocked or failed JavaScript, the visitor never reaches the goal, rules, or CTA. Search and link-preview systems also receive less game-specific content.

Browser verification required: capture first paint and hydration on a cold, mobile-throttled load with and without saved state. Test the behavior with JavaScript failure as a resilience check, not as a requirement for complete no-JavaScript gameplay.

### SRC-P2-08: Daily identity and reward eligibility trust the device clock

Severity: `P2` daily-promise and progress-integrity risk.

Significant and Ship It both derive the daily date from the browser's local calendar and store the last completed date only in localStorage. Their daily seeds, streak updates, countdowns, and one-reward-per-date guards therefore trust the device time and time zone.

Impact:

- Two players at the same moment can receive different daily runs when their local dates differ.
- Ship It's promise that everyone receives the same deck order `today` is true only for the same local date string, not for one shared global day.
- Changing the device date, time zone, or stored completion record can reopen a daily reward.
- Moving backward across dates can reset or distort streak behavior.

This is expected in a client-only portfolio game, but the product language and analytics should not imply server-authoritative competition or tamper-resistant streaks.

Browser verification required: run both daily modes across midnight, two time zones, a backward clock change, and cleared or edited localStorage.

### SRC-P3-01: The production dependency tree contains a moderate PostCSS advisory

Severity: `P3` supply-chain maintenance risk.

Evidence:

- `npm audit --omit=dev` on 2026-07-19 reported two moderate entries representing one advisory path: direct dependency `next@16.2.10` includes `postcss@8.4.31`.
- GitHub advisory `GHSA-qx2v-qp2m-jg93`, also assigned `CVE-2026-41305`, affects PostCSS versions before 8.5.10 when CSS stringification does not escape a closing style tag.
- The project also installs a patched `postcss@8.5.16` through Tailwind and Vite, but Next retains its own older nested version.
- `16.2.10` is the current published Next release at the time of this audit, and npm's suggested automatic resolution is an invalid major downgrade to Next 9.3.3.

Impact: Product Lab's CSS inputs are repository-controlled and PostCSS is used during the build, so the direct application exposure appears limited. The installed production tree is still within the advisory range and should not be reported as vulnerability-free.

This is a dependency-maintenance finding, not evidence of an exploitable Product Lab route.

### SRC-P3-02: The public response has transport security but no explicit browser hardening policy

Severity: `P3` defense-in-depth gap.

A fresh response from the production hub included long-lived HSTS. It did not include an explicit Content Security Policy, `frame-ancestors` or `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, or `X-Content-Type-Options`. The current `next.config.ts` defines no response headers, and no middleware, proxy, or `vercel.json` provides them elsewhere.

Impact: this is a public, unauthenticated portfolio game with no user-generated HTML, so the immediate risk is limited. The absence still leaves framing, referrer behavior, content types, and browser capabilities to defaults rather than a declared policy.

This finding should be evaluated against actual third-party scripts, analytics, sound, vibration, image, and font requirements before any later policy is implemented.

## Browser reconciliation summary

- Ship It manual Reduced still permits card drag, while operating-system reduced motion blocks it.
- Dynamic focus and announcement defects reproduced across Significant, Ship It, and Exception Room.
- Successful storage persistence passed. Denied-storage behavior remains source-reviewed.
- Local and public metadata checks confirmed generic Significant and Ship It titles and missing social-preview surfaces.
- Normal cold loads settled without runtime errors. CPU-throttled hydration duration was not measured.
- Analytics payload structure is source-confirmed. Provider delivery and public-network payload inspection were outside scope.
