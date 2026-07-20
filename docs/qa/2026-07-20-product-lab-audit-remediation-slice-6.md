# Product Lab audit remediation: Slice 6

Date: 2026-07-20

Branch: `codex/product-lab-audit-remediation`

Commit boundary at start: `d608c67`

Status: complete locally, not committed, not pushed, not deployed

## Slice objective

Finish the locally actionable visual and platform hardening work by replacing Ship It's operating-system emoji presentation, optimizing the oversized hub title asset, completing shared persistence and sharing fallbacks, and making the future release gate explicit.

## Outcome

Ship It now renders source-controlled Phosphor vector icons for speaker roles, the four operating meters, failure feedback, review results, Daily streaks, and Daily shields. The visible interface no longer depends on Apple, Google, Microsoft, or browser emoji artwork.

The Pick a Field Test title SVG is 196,619 bytes, down from 448,109 bytes. That is a reduction of 251,490 bytes, or 56.1 percent. The optimized and previous assets were rendered in the same 390 by 844 state and reviewed side by side. Their screenshot comparison reached 60.43 dB average PSNR, and no visible shape, color, alignment, or framing change was found.

A release checklist now separates local verification, preview authorization, deployment identity, preview product checks, mobile performance, dependency review, owner approval, production promotion, and post-release verification.

Shared Settings now reports when a preference is kept for the current visit but browser storage cannot save it. Clipboard denial in Significant and Ship It now exposes the complete result in a selectable textarea. Exception Room sound and haptic feedback is armed by a fresh accepted decision, so restoring a reveal does not replay feedback without a player gesture.

## Ship It authored icon system

| Surface | Previous presentation | Current presentation |
| --- | --- | --- |
| Card speaker | Operating-system emoji portrait | Role-specific Phosphor duotone icon |
| Customer | Chart emoji | ChartLineUp icon |
| Business | Money emoji | CurrencyDollar icon |
| Team | Heart emoji | Heart icon |
| Tech | Gear emoji | GearSix icon |
| Failure | Enlarged meter emoji | Inverse meter icon in a themed tile |
| Review | Four meter emoji | Four matching meter icons |
| Daily streak | Fire emoji | Fire vector icon |
| Daily shield | Shield character | ShieldCheck vector icon |

The card deck keeps its existing legacy role tokens for saved-data compatibility. `ShipIcon` maps those tokens to the authored icon library and uses `UserCircle` as a safe fallback for a future unknown role. No legacy glyph is inserted into the document.

## Hub title optimization

- Source generator comment and redundant SVG structure were removed.
- Path data and attributes were minified through a multipass SVG optimization.
- The view box geometry and rendered dimensions remain unchanged.
- The 390 by 844 comparison preserves the approved title lockup, card geometry, play controls, and full-bleed world.

Asset record:

| Asset | SHA-256 |
| --- | --- |
| `pick-field-test-logo.svg` | `d130b578fa7b596131fee9df679c3e273d94e4952c7757e3a5839f5c5eb6c655` |
| `product-lab-wordmark.svg` | `9b98e689376abb074d386b1732e95ee59c40c6884079f227ac6aaa725ef821e1` |
| `significant-depth-card.webp` | `2f052a422cb326e8a06bca33d3c7cf0285e793abe9536519dbc6780fbe8350ad` |
| `ship-it-depth-card.webp` | `f448fa8bedcbd54e47923684539240afdb26977e84bbe39ce30f671b1a97f21b` |
| `exception-room-depth-card.webp` | `5b235aafb4026e6ca4c307e6e5ca318c5f5be903e982f8ad8b66d0df56bcefda` |
| `hub-world.webp` | `3659ffd480d01dd243677a34b0df6131fd61b4545a529f14e59078d27a3dbbfc` |

These hashes describe the current local working tree and must be recalculated from the eventual release commit.

## Rendered evidence

All screenshots were captured from the rebuilt local production app and opened before signoff.

| Evidence | What it proves |
| --- | --- |
| `evidence/slice-6/01-ship-it-entry-icons-390x844.png` | Four authored meter icons and the returning Daily streak. |
| `evidence/slice-6/02-ship-it-first-card-icons-390x844.png` | Authored speaker avatar plus matching meter icons in play. |
| `evidence/slice-6/03-ship-it-failure-icon-390x844.png` | Business failure uses the same icon language without celebratory art. |
| `evidence/slice-6/04-ship-it-review-icons-390x844.png` | Review uses four matching vector icons. |
| `evidence/slice-6/05-ship-it-daily-icons-390x844.png` | Daily streak and shield are vector icons with one combined accessible label. |
| `evidence/slice-6/06-hub-optimized-title-390x844.png` | Optimized title inside the approved complete hub state. |
| `evidence/slice-6/07-hub-title-before-after.png` | Same-frame hub comparison before and after optimization. |
| `evidence/slice-6/08-preference-storage-warning-390x844.png` | Shared Settings exposes the session-only storage boundary while preserving the changed preference. |

## Verification

- `npm test -- --run`: 49 files passed, 268 tests passed.
- `npm run lint`: passed with no errors or warnings.
- `npm run build`: passed on Next.js 16.2.10 with 19 generated page entries.
- Full Chromium production run: 103 passed.
- Slice 6 visual test: passed and verified five Ship It states plus the hub.
- Rendered Ship It text scan: no former operating-system emoji glyph was present.
- Executable expected-failure scan: no `test.fail()` call remains.
- `git diff --check`: passed.
- Authored source and QA copy scan: no em dash or en dash found in the active remediation scope.

## Release and performance boundary

`PRODUCT-LAB-RELEASE-CHECKLIST.md` defines the future Vercel gate. It requires the exact project, deployment ID, commit, deployment-specific URL, build logs, asset hashes, complete browser suite, accepted screenshots, and owner approval to be recorded before promotion.

The preview performance budget is:

- LCP at or below 2.5 seconds;
- field INP at or below 200 milliseconds;
- lab Total Blocking Time at or below 200 milliseconds as the INP proxy;
- CLS at or below 0.1;
- zero broken asset requests;
- zero unhandled browser errors.

No preview exists for this working tree, so those measurements have not been claimed.

## Dependency review

The two moderate PostCSS advisories remain reviewed. Product Lab does not accept or stringify user CSS. npm's automatic force option proposes a breaking Next 9 downgrade. The release checklist records the exposure model and requires another audit on the release commit while the stable Next dependency path is monitored.

## Evidence limits

- Chromium is the verified browser.
- The 195 by 422 viewport remains the local 200 percent zoom proxy.
- Screen-reader speech, physical phone hardware, Safari, and real vibration were not tested.
- Mobile-throttled preview performance, Vercel project identity, deployment logs, and public-domain verification require explicit deployment authorization.

## Release boundary

No commit, push, pull request, merge, Vercel preview, production deployment, or publication was performed.
