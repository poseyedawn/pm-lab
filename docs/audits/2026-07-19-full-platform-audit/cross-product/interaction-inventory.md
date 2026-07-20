# Cross-product engineering interaction inventory

All 34 checks are reconciled with browser, source, build, dependency, deployment, or response evidence. Results and explicit limits are recorded in `evidence-log.md`.

| ID | Interaction or state | Required evidence |
| --- | --- | --- |
| ENG-01 | Every route loads directly | HTTP result, stable rendering, console and runtime errors |
| ENG-02 | Every internal link resolves | Destination, back behavior, no stale route |
| ENG-03 | Browser console health across complete loops | Errors, warnings, rejected promises, hydration issues |
| ENG-04 | Network behavior | Broken assets, duplicate fetches, unexpected third parties |
| ENG-05 | LocalStorage first load | Default schema, hydration stability, no visible value jump |
| ENG-06 | LocalStorage persistence | XP, preferences, daily state, ratings, completion flags |
| ENG-07 | Corrupt and legacy localStorage | Validation, migration, safe fallback, no crash |
| ENG-08 | Storage denied or unavailable | Fallback behavior, user messaging, playable state |
| ENG-09 | Duplicate rapid input | No double XP, duplicate completion, or double navigation |
| ENG-10 | Refresh at consequential states | Explicit reset or recovery, no inconsistent partial progress |
| ENG-11 | Back and forward navigation | History coherence, no stale component state |
| ENG-12 | 390 x 844 responsive pass | No horizontal overflow, clipped controls, or hidden content |
| ENG-13 | 430 x 932 responsive pass | Reflow and asset scaling |
| ENG-14 | Desktop mobile-canvas pass | Width lock, centering, complete vertical experience |
| ENG-15 | 200 percent zoom and text reflow | Content access, control overlap, horizontal scroll risk |
| ENG-16 | Keyboard traversal | Visible focus, logical order, native activation, no traps |
| ENG-17 | Screen-reader semantics | Landmarks, names, roles, values, pressed and expanded states |
| ENG-18 | Live state communication | Results, errors, meter changes, copy status, queue changes |
| ENG-19 | Target size and spacing | Mobile touch safety for every repeated control |
| ENG-20 | Color and contrast | Text, focus, selected, disabled, error, and result states |
| ENG-21 | Reduced motion | No essential information lost, no unwanted animation |
| ENG-22 | Sound and haptics preferences | Persistence, consistent respect, unsupported-device safety |
| ENG-23 | Analytics payload boundary | No scenario text, seeds, clipboard content, or local profile leakage |
| ENG-24 | External portfolio link | Security attributes, new-tab expectation, analytics event |
| ENG-25 | Performance and loading | Initial paint, route transition, image loading, layout stability |
| ENG-26 | Build, type, lint, and automated tests | Current clean-run results tied to audited commit |
| ENG-27 | Global, game, and route-level chrome composition | Duplicate headers, XP, settings, titles, and viewport cost |
| ENG-28 | Hub critical asset cost | SVG parse cost, image transfer, paint, and layout stability |
| ENG-29 | Direct-link and social-preview metadata | Per-route title, description, canonical URL, image, robots, and share rendering |
| ENG-30 | Automated journey and accessibility coverage | Real-browser route, state, focus, announcement, and responsive regression protection |
| ENG-31 | Cold-load hydration on every game entry | Busy state, visible loading feedback, time to game explanation, JavaScript-failure behavior |
| ENG-32 | Production dependency advisory state | Current audit, affected path, runtime relevance, upstream or override resolution |
| ENG-33 | Production security response headers | HSTS, CSP, framing, referrer, permissions, content type, required third parties |
| ENG-34 | Daily clock and time-zone authority | Shared-day promise, midnight rollover, backward clock, streak and reward integrity |
