# Source audit checkpoint

Captured: 2026-07-19.

Audited commit: `d608c67` on `codex/game-hub-floating-redesign`.

This checkpoint consolidates the highest-priority findings confirmed from source and authored game content before browser execution. It is retained as an audit-stage record. `FINDINGS-REGISTER.md`, `SYNTHESIS.md`, and the five evidence logs supersede its pending-evidence language.

## P1 findings by surface

### Shared platform

1. Ship It does not honor the shared haptics preference.
2. Ship It does not consistently honor the manual motion preference.
3. The public analytics copy says seeds are excluded while Exception Room records a run seed.
4. Ship It and Exception Room compose root, game, and route-level chrome inside the mobile viewport.

### Product Lab hub

1. Large draggable cards use two-axis drag with `touch-action: none`, which may block the primary vertical-scroll gesture.

### Significant

1. Winner's Curse is graded Kill even though the player-visible evidence supports rejecting shipment, not knowing that the underlying product has no effect.
2. Calibration describes Kill as insufficient evidence and Keep Running as evidence that could change, which reverses the decision semantics.
3. The 10-level answer distribution rewards never shipping on 90 percent of cases and always killing on 50 percent, weakening the stated lesson about avoiding reflexive cynicism.

### Ship It

1. An active run cannot be recovered after refresh, closing, or route navigation.
2. Legal, ethical, security, accessibility, and truthfulness boundaries are scored as ordinary meter tradeoffs rather than hard product-integrity constraints.
   A 10,000-seed production-engine diagnostic found 1,926 affected runs that still received Promoted or CEO-in-waiting, including five CEO-in-waiting outcomes.
3. The Users meter mixes adoption with user welfare, so a dark pattern and low-quality SEO farm increase the same user score.
4. The interface reveals affected meters but does not explain card-specific reasoning, leaving the learning model opaque.

### Exception Room

1. An advertised 8-minute campaign cannot be recovered.
2. The landing page advertises a Daily mode as coming soon.
3. Required evidence is declared in content but not required by the decision engine.
   The profile model also ignores evidence rate. A 10,000-seed diagnostic found nine evidence-free Balanced Operator outcomes, including one with Safety 100, Service 100, and Capacity 96.
4. The due header can announce the wrong deadline and hardcodes one case.
5. Three authored practice cases are not connected to any product route.
6. The case summary is hidden, while evidence summaries render at 8 pixels and are clamped to one line.

## Engineering baseline

- Production build: passed.
- TypeScript: passed as part of the build.
- Vitest: 45 files and 242 tests passed.
- ESLint: 0 errors and 4 warnings.
- End-to-end browser suite: not present.
- Automated accessibility suite: not present.

## Browser reconciliation

The interaction inventories, required viewports, keyboard and preference paths, state transitions, and accepted screenshots were reconciled in the final evidence logs. Tests that remained outside the local Chromium boundary are stated explicitly in `cross-product/evidence-log.md`.
