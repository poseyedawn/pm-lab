# Product Lab audit remediation, Slice 6 QA inventory

## User-visible claims

- Ship It uses one source-controlled vector icon system for card speakers, meters, failure feedback, review results, streaks, and shields.
- No operating-system emoji is rendered in the Ship It interface.
- The hub title artwork keeps the approved appearance after optimization.
- The optimized hub title asset is materially smaller on disk.
- Shared settings explain when a preference can be kept for the current visit but cannot be written to browser storage.
- Restoring an Exception Room resolution does not replay sound or vibration without a fresh player action.

## Functional checks

1. Open Ship It and confirm all four meter concepts have authored icons and accessible text labels.
2. Start a Free run and confirm the speaker avatar and four meter icons render as SVG artwork.
3. Trigger a Business failure and confirm the failure state uses the same icon language.
4. Continue to the review and confirm all four final meters use the same icon language.
5. Open a returning Daily state and confirm streak and shield status use vector icons with one combined accessible label.
6. Scan the rendered Ship It document for the former emoji glyphs.
7. Compare the optimized hub title against the accepted pre-optimization 390 by 844 screenshot.
8. Force a browser storage write failure and confirm the preference still changes for the visit with a visible warning.
9. Restore an Exception Room reveal after refresh and confirm it does not replay haptic feedback.

## Visual checks

- Ship It entry at 390 by 844.
- Ship It first decision at 390 by 844.
- Ship It Business failure at 390 by 844.
- Ship It review after failure at 390 by 844.
- Ship It Daily header with streak and shield at 390 by 844.
- Product Lab hub at 390 by 844 after title optimization.
- Same-frame hub comparison before and after optimization.
- Significant shared settings with the session-only storage warning at 390 by 844.

## Signoff boundary

- Inspect every accepted screenshot before using it as evidence.
- Unit, lint, build, and full browser checks must pass.
- Performance measurement on a Vercel preview and release identity verification remain outside this local slice.
- No commit, push, preview, deployment, or publication is authorized.
