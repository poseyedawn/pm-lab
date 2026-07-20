# Cross-product engineering evidence log

Status: all 34 checks reconciled at commit `d608c67`. Evidence combines the local production browser pass, source inspection, 242 automated tests, production build output, local and public route checks, Vercel read-only inspection, response headers, dependency audit, and audited screenshots. A source risk is not labeled browser-confirmed unless the interaction pass reproduced it.

| ID | Result | Evidence | Reconciled outcome |
| --- | --- | --- | --- |
| ENG-01 | Pass | Local and public direct-route matrix in [engineering baseline](engineering-baseline.md#local-direct-route-baseline); browser entry captures | All 12 audited product routes returned 200 and settled to stable content. |
| ENG-02 | Pass | Hub, About, Daily, play, home, briefing, portfolio, Back, and Forward interaction passes | Every visible internal link used in the audited journeys resolved. Browser history was coherent when state recovery was not expected. |
| ENG-03 | Pass | Console and page-error listeners across full Significant, Ship It, and two Exception Room campaigns | No console errors, uncaught page errors, rejected promises, or hydration errors appeared in the tested loops. |
| ENG-04 | Pass with scope limit | Local server request log, direct-route matrix, rendered asset inspection | No broken product asset request or duplicate gameplay fetch was observed. Third-party analytics delivery was not independently audited. |
| ENG-05 | Pass | Fresh contexts with Product Lab storage keys cleared | Hub and all three games rendered coherent defaults without a visible XP or setting jump after hydration. |
| ENG-06 | Pass | Shared XP, preference, calibration, campaign, Daily, rating, and completion reload checks | Completed-state persistence works across the tested product paths. Active Ship It and Exception Room runs do not persist. |
| ENG-07 | Finding | Source review plus malformed-state unit coverage | Shared profile and preferences validate runtime shape. Significant and Ship It accept valid JSON with invalid shapes. See `SRC-P2-01`. |
| ENG-08 | Finding with browser limit | Source review of memory fallbacks; successful browser persistence | The services retain a playable in-memory fallback, but the UI ignores failed writes. Storage denial was not forced in this Chromium pass. |
| ENG-09 | Pass with source risk | Duplicate reward guards, rapid hub tap, repeated decisions, and Exception Room double click | No duplicate XP, completion, navigation, or reveal reproduced. Exception Room retains a source-level race risk and needs automated browser coverage. |
| ENG-10 | Finding | Significant wrong-reveal refresh, Ship It active-run refresh, Exception Room selected-case refresh | Significant can erase a miss before commit. Ship It and Exception Room lose active progress. |
| ENG-11 | Finding | Browser Back and Forward across hub and all games | Settled route navigation works. Active Ship It and Exception Room state is not recovered after route exit. |
| ENG-12 | Finding | 390 x 844 screenshots for every entry and core loop | Hub and Significant fill the viewport. Exception Room starts below 114 pixels of chrome while still claiming 844 pixels, clipping its bottom. |
| ENG-13 | Finding | 430 x 932 entry screenshots | Hub and Significant scale cleanly. Exception Room's shell extends beyond the viewport because its fixed height is composed below shared chrome. |
| ENG-14 | Finding | 1200 x 900 screenshots | The hub and Significant preserve a centered 390 pixel canvas. Exception Room's desktop padding shrinks its inner shell to about 342 pixels. |
| ENG-15 | P1 finding | Simulated 195 x 422 CSS viewport for hub and all games | Hub, Significant, and Ship It lock required content outside an unscrollable viewport. Exception Room retains internal scrolling but severely clips both shared headers. |
| ENG-16 | Finding | Full keyboard routes and complete Ship It keyboard campaign | Native activation works, but hub drag wrappers add inert focus stops and dynamic game states repeatedly drop focus to Body. |
| ENG-17 | Finding | DOM and accessibility inspection | Significant chart data is under-described. Ship It failure dialog lacks complete modal semantics. Exception Room progressbars are unnamed. |
| ENG-18 | Finding | Result, warning, copy, failure, and queue transition inspection | Copy success and some results announce correctly. Ship It meter changes and Exception Room queue or picker replacements do not provide complete announcements. |
| ENG-19 | Pass with measurement limit | 390 x 844 touch use across repeated game controls | Repeated primary controls were usable without adjacent accidental activation. A formal pixel-by-pixel target-size report was not run. |
| ENG-20 | Finding with measurement limit | Visual inspection of selected, disabled, correct, wrong, warning, and zoom states | Focus and major result states are visible. Ship It low-meter warning relies on color and motion. Automated contrast ratios were not measured. |
| ENG-21 | Finding | System and manual motion tests | Hub respects System and manual Reduced. Ship It manual Reduced still permits drag, while operating-system reduced motion blocks it. |
| ENG-22 | Finding | Preference persistence, vibration spy, audio API instrumentation | Ship It calls vibration with Haptics off. Exception Room's Sound setting changes no observed game audio. Physical output was outside scope. |
| ENG-23 | P1 source finding | Typed analytics review and public disclosure comparison | Analytics is allowlisted and fails closed, but Exception Room records a seed while public copy says seeds are excluded. |
| ENG-24 | Pass | Hub and shared portfolio-link activation | Portfolio opens `https://alvn.io/` in a new tab with disclosed behavior and `noopener noreferrer`. |
| ENG-25 | Finding with trace limit | Production build, asset sizes, local browser loads | Normal routes settle without visible load errors. The 448 KB traced title SVG and empty pre-hydration game main remain risks. No throttled performance trace was run. |
| ENG-26 | Pass | [Engineering baseline](engineering-baseline.md#automated-checks) | Production build and TypeScript pass. All 242 tests pass. ESLint reports 0 errors and 4 warnings. |
| ENG-27 | P1 finding | Standard-game screenshots and source composition | Root, game, and route chrome consume meaningful mobile height. Exception Room demonstrates actual clipping at the primary viewport. |
| ENG-28 | P2 source finding | Asset inspection | `pick-field-test-logo.svg` is about 448 KB at roughly 304 rendered pixels. Transfer timing and main-thread cost were not measured. |
| ENG-29 | P2 finding | Local and public document metadata and missing asset requests | Significant and Ship It inherit the generic title. Canonical, Open Graph, Twitter, robots, sitemap, manifest, and social-image surfaces are absent. |
| ENG-30 | P2 finding | Package and test configuration review | No end-to-end browser or automated accessibility suite covers the integration failures reproduced in this audit. |
| ENG-31 | P2 source finding | Server-rendered document inspection plus normal cold browser loads | Game routes send an empty busy main before hydration. Normal browser loads settled, but slow or failed JavaScript behavior was not measured. |
| ENG-32 | P3 finding | `npm audit --omit=dev` | Two moderate entries represent one PostCSS advisory through Next. No high or critical entries. The suggested major downgrade is not a valid fix. |
| ENG-33 | P3 finding | Public response header capture | HSTS is present. CSP, frame, referrer, permissions, and content-type hardening headers are absent. |
| ENG-34 | P2 source finding | Daily implementation review and normal multi-day state branches | Daily identity and eligibility trust device-local date and localStorage. Normal streak branches passed; time-zone and clock-tampering cases were not run. |

## Cross-product strengths

- Shared XP genuinely aggregates game rewards and persists across route return.
- Strict TypeScript, Zod-validated shared records, typed analytics, seeded engines, and duplicate-reward guards form a strong technical base.
- All direct routes and complete supported game loops ran without console or page errors.
- The hub and Significant preserve the approved full-bleed mobile world at 390 x 844 and a centered mobile canvas on desktop.
- The product exposes sound, haptics, and motion preferences at a shared level, which gives the implementation one clear place to repair preference consistency.

## Cross-product release blockers before portfolio promotion

1. Make every route reflow and remain completable at 200 percent zoom.
2. Remove the conflicting fixed-height and shared-chrome composition in Exception Room.
3. Persist or explicitly checkpoint active Ship It and Exception Room runs.
4. Align Ship It haptics and motion with shared preferences.
5. Align public analytics language with the actual Exception Room payload.
6. Add automated browser journeys and accessibility checks for the exact integration boundaries found here.

## Evidence limits

- The audit used Chromium on macOS, not Safari on iPhone or Chrome on Android.
- Physical vibration and speaker output were not observed.
- Automated contrast measurement, screen-reader speech output, mobile network throttling, crawler rendering, time-zone manipulation, and storage-denial injection were not run.
- The production alias served critical hub assets matching the checkout, but the Vercel response did not expose enough Git metadata to prove every public JavaScript chunk came from commit `d608c67`.
