# Alvin's Product Lab

Mobile-first games that make product judgment visible. The collection includes
Significant, Ship It, and Exception Room.

- Stack: Next.js (App Router), TypeScript, Tailwind, Vitest. Zero backend.
- Run: `npm install && npm run dev`
- Unit tests: `npm test`
- Browser regression suite: `npm run test:e2e`
- Full local quality gate: `npm run test:all`
- Open the last browser report: `npm run test:e2e:report`

The browser suite builds and starts the production application automatically.
Known audit defects run as expected failures, so they remain visible without
blocking unrelated healthy contracts. Remove an expected-failure marker when
the corresponding remediation passes with fresh browser evidence.

Audit, research, and verification documents live in `docs/`.
