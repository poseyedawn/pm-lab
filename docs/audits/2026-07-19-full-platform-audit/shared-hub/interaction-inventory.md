# Shared hub interaction inventory

All 20 cases were executed against the local production build at commit `d608c67` using Chromium through the user-approved Playwright fallback. Results are recorded in `evidence-log.md`.

| ID | Interaction or state | Required evidence |
| --- | --- | --- |
| HUB-01 | First load at `/` with zero XP | Full-screen screenshot, comprehension notes, console state |
| HUB-02 | Product Lab logo link | Destination, focus state, accessible name |
| HUB-03 | Total XP before and after game progress | Hydration behavior, value consistency, refresh persistence |
| HUB-04 | Portfolio external link | New-tab behavior, destination, return-path clarity |
| HUB-05 | Significant card idle motion | Visual hierarchy, motion comfort, reduced-motion comparison |
| HUB-06 | Significant card tap | Navigation, selected-game clarity, back behavior |
| HUB-07 | Significant card press and drag | 3D response, drag bounds, snap-back, accidental navigation prevention |
| HUB-08 | Ship It card idle motion, tap, and drag | Same checks as HUB-05 through HUB-07 |
| HUB-09 | Exception Room card idle motion, tap, and drag | Same checks as HUB-05 through HUB-07 |
| HUB-10 | Keyboard traversal of brand, portfolio, and three cards | Focus visibility, order, activation, no focus trap |
| HUB-11 | 390 x 844 presentation | Full bleed, clipping, scroll behavior, safe target placement |
| HUB-12 | 430 x 932 presentation | Reflow, artwork scale, whitespace, scrolling |
| HUB-13 | 1200 x 900 presentation | Mobile-canvas lock, centering, surrounding background |
| HUB-14 | Shared game header home control | Return to hub, progress retained |
| HUB-15 | Shared settings open and close | Discoverability, overlay placement, outside interaction, focus behavior |
| HUB-16 | Sound toggle | State, label, persistence, audible result |
| HUB-17 | Haptics toggle | State, label, persistence, unsupported-device behavior |
| HUB-18 | Motion selector | System, reduced, and full behavior plus persistence |
| HUB-19 | Refresh and back or forward navigation | Route stability, scroll restoration, state consistency |
| HUB-20 | Skip link and semantic landmarks | Keyboard visibility, target, reading order |
