# Exception Room Implementation Baseline

**Recorded:** 2026-07-16  
**Repository:** `/Users/Alvin/Al the Builder/portfolio-projects/pm-lab`  
**Planning branch:** `codex/exception-room-plan`  
**Verified product baseline:** `df5d23e`  
**Local main at verification:** `dbd8362`

## Boundary decision

Exception Room depends on the completed Ship It architecture present at `df5d23e`. Local `main` is older and does not represent the inspected product baseline. The planning artifacts are committed on top of `df5d23e`, then implementation continues on the local `codex/exception-room-engine` branch.

The portfolio editorial package remains in `/Users/Alvin/Al the Builder/portfolio` on its separate branch. It is not part of the engine implementation branch.

## Baseline verification

| Command | Result | Notes |
| --- | --- | --- |
| `npm test` | Pass | 20 test files, 112 tests |
| `npm run lint` | Pass with 4 existing warnings | No errors. Warnings are in existing Ship It and Significant files outside this implementation scope. |
| `npm run build` | Pass | Next.js 16.2.10 production build and TypeScript completed successfully. |

Existing lint warnings:

- `src/hooks/useShipRun.ts`: unused `Review` type.
- `src/lib/engine/archetypes.ts`: two unused `rng` parameters.
- `src/lib/engine/scenario.test.ts`: unused `ARCHETYPES` import.

## Authorization boundary

Authorized now:

- Stage 1 domain and deterministic engine work.
- Stage 2 scoring, content invariants, campaign cases, guided practice, and balance tests.

Still gated:

- UI implementation until one of three visual directions is owner selected.
- Browser QA until its owner approval gate.
- Push, merge, deployment, publication, and production changes until explicit approval.
