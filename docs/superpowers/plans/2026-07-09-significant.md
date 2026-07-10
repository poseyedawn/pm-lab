# Lab Shell + Significant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pm-lab Next.js app shell and the first game, "Significant" — a juiced, Duolingo-grade A/B-testing intuition game with campaign + daily modes — and deploy it to Vercel.

**Architecture:** A static Next.js App Router app. A pure-TypeScript, seeded scenario engine (`src/lib/engine/`) generates internally consistent A/B test readouts from 10 trap archetypes; React components render the game; all state lives in localStorage behind a safe wrapper. A shared "juice" component library (buttons, confetti, count-ups, sound, haptics) is built once and reused by future games.

**Tech Stack:** Next.js 15 (App Router) + TypeScript + Tailwind v4, Vitest + Testing Library (jsdom), framer-motion, canvas-confetti, WebAudio (no audio assets), @vercel/analytics. Zero backend, zero API.

## Global Constraints

- Zero backend, zero external API. All persistence via localStorage behind `safeStorage` (game must work when localStorage throws).
- Engine code (`src/lib/engine/**`, `src/lib/progress.ts`) is pure TS: **no React imports, no `Date.now()`/`Math.random()`** — all randomness flows from a seeded PRNG; dates are passed in as `YYYY-MM-DD` strings.
- Mobile-first single column, max width `28rem`, decision buttons in thumb reach. 8pt spacing grid.
- Typography: Nunito via `next/font`, weights 400 and 800 only. Max 4 font sizes.
- Visual identity: vibrant light theme (tokens in Task 1) — NOT dark/minimal. Chunky rounded cards, 3D-pressed buttons.
- All motion respects `prefers-reduced-motion` (use framer-motion's `useReducedMotion`; confetti/shake are skipped when set).
- Sound defaults ON, toggle always visible, preference persisted. Haptics via `navigator.vibrate` guarded with `typeof navigator !== 'undefined' && 'vibrate' in navigator`.
- Statistical copy stays precise; playfulness lives in the interaction layer only.
- Imports use `@/` alias. Components delegate logic to hooks (`src/hooks/`); pages are thin.
- Conventional commits; commit at the end of every task. Run `npm test` and `npm run build` before each commit that touches code.

## File Structure

```
pm-lab/
├── app/
│   ├── layout.tsx                    # Root layout: Nunito font, Analytics, theme
│   ├── globals.css                   # Tailwind v4 + design tokens
│   ├── page.tsx                      # Lab home (game cards)
│   └── significant/
│       ├── page.tsx                  # Mode select: Campaign path + Daily card
│       ├── play/page.tsx             # Campaign round (reads ?level=N)
│       ├── daily/page.tsx            # Daily round + streak + share
│       └── about/page.tsx            # PM writeup incl. engagement design
├── src/
│   ├── lib/
│   │   ├── prng.ts                   # mulberry32, hashString, uniform, normal, pick
│   │   ├── stats.ts                  # binomialDraw, liftReadout, phi, srmPValue
│   │   ├── progress.ts               # safeStorage + profile/campaign/daily state
│   │   ├── analytics.ts              # track() wrapper (no-op outside prod)
│   │   └── engine/
│   │       ├── types.ts              # Call, ArchetypeId, Scenario, ArmDay
│   │       ├── simulate.ts           # simulateArms(rng, SimParams)
│   │       ├── flavor.ts             # 10 product/hypothesis/metric flavor entries
│   │       ├── archetypes.ts         # 10 ArchetypeSpec generators + reveal copy
│   │       ├── scenario.ts           # generateScenario(seed, archetypeId)
│   │       └── daily.ts              # dayNumber, dailyDateSeed, dailyArchetype
│   ├── hooks/
│   │   ├── useGameRound.ts           # round state machine: readout → reveal → next
│   │   ├── useCampaign.ts            # level list, stars, unlock, warm-up endowment
│   │   └── useDaily.ts               # today's scenario, streak, countdown, share text
│   └── components/
│       ├── juice/
│       │   ├── PressButton.tsx       # 3D-pressed tactile button
│       │   ├── CountUp.tsx           # rAF number count-up
│       │   ├── confetti.ts           # fireConfetti() wrapper (reduced-motion aware)
│       │   ├── sound.ts              # WebAudio chimes/thuds + persisted pref
│       │   └── haptics.ts            # vibrate() guard
│       ├── lab/
│       │   └── GameCard.tsx          # home page game card
│       └── significant/
│           ├── Sparkline.tsx         # dual-line SVG daily conversion chart
│           ├── ReadoutCard.tsx       # the experiment readout
│           ├── DecisionButtons.tsx   # Ship / Kill / Keep Running
│           ├── RevealPanel.tsx       # truth + explanation + XP
│           ├── ComboFlame.tsx        # combo multiplier indicator
│           ├── GameRound.tsx         # composes one full round (client)
│           ├── LevelPath.tsx         # winding 11-node campaign map
│           ├── IQCard.tsx            # campaign completion card + titles
│           └── ShareGrid.tsx         # daily emoji share + clipboard fallback
├── vitest.config.ts
└── vitest.setup.ts
```

---

### Task 1: Scaffold app, design tokens, and test harness

**Files:**
- Create: entire Next.js scaffold in repo root (create-next-app), `vitest.config.ts`, `vitest.setup.ts`
- Modify: `app/globals.css`, `app/layout.tsx`, `package.json` (test scripts)

**Interfaces:**
- Produces: working `npm run dev`, `npm test`, `npm run build`; CSS tokens (`--color-*` custom properties) and Tailwind theme colors `bg`, `surface`, `ink`, `brand`, `win`, `lose`, `gold`, `sky` used by every later component; `.btn-3d` utility class.

- [ ] **Step 1: Scaffold Next.js in the existing repo root**

Run (in `/Users/Alvin/portfolio-projects/pm-lab`):
```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes
```
Expected: scaffold completes (create-next-app tolerates existing `.git` and `docs/`). NOTE: `--src-dir` puts `app/` under `src/app/` — that is fine; wherever this plan says `app/...`, use `src/app/...`.

- [ ] **Step 2: Install runtime and test dependencies**

```bash
npm i framer-motion canvas-confetti @vercel/analytics
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @types/canvas-confetti vite-tsconfig-paths
```

- [ ] **Step 3: Add Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

Create `vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

Add to `package.json` scripts: `"test": "vitest run", "test:watch": "vitest"`.

- [ ] **Step 4: Design tokens in globals.css**

Replace the `@theme` / `:root` section of `src/app/globals.css` with:
```css
@import "tailwindcss";

@theme {
  --color-bg: #f4f5fb;
  --color-surface: #ffffff;
  --color-ink: #232447;
  --color-ink-soft: #6b6d94;
  --color-brand: #7c3aed;        /* Significant's violet */
  --color-brand-deep: #5b21b6;
  --color-win: #22c55e;
  --color-win-deep: #15803d;
  --color-lose: #f43f5e;
  --color-lose-deep: #be123c;
  --color-gold: #f59e0b;
  --color-sky: #3b82f6;
  --color-sky-deep: #1d4ed8;
  --radius-card: 1.25rem;
}

body { background: var(--color-bg); color: var(--color-ink); }

/* Tactile 3D-pressed button base: pair with a bg + shadow color per variant */
.btn-3d {
  border-radius: 1rem;
  font-weight: 800;
  transition: transform 0.06s ease, box-shadow 0.06s ease;
  transform: translateY(0);
}
.btn-3d:active { transform: translateY(4px); box-shadow: 0 0 0 0 !important; }
```

- [ ] **Step 5: Root layout with Nunito + Analytics**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const nunito = Nunito({ subsets: ['latin'], weight: ['400', '800'] });

export const metadata: Metadata = {
  title: "Alvin's Lab",
  description: 'Small games about product craft, built with AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={nunito.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify build + empty test run**

Run: `npm run build` → succeeds. Run: `npm test` → "No test files found" is acceptable at this point (exit 0 with `--passWithNoTests`; add that flag to the test script: `"test": "vitest run --passWithNoTests"`).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: scaffold pm-lab app with design tokens and vitest"
```

---

### Task 2: PRNG + statistics module

**Files:**
- Create: `src/lib/prng.ts`, `src/lib/stats.ts`
- Test: `src/lib/prng.test.ts`, `src/lib/stats.test.ts`

**Interfaces:**
- Produces:
  - `type RNG = () => number`; `mulberry32(seed: number): RNG`; `hashString(s: string): number`; `uniform(rng, lo, hi): number`; `uniformInt(rng, lo, hi): number`; `normal(rng): number`; `pick<T>(rng, arr: T[]): T`
  - `binomialDraw(rng: RNG, n: number, p: number): number`
  - `interface LiftReadout { relLift: number; ciLow: number; ciHigh: number; pValue: number; significant: boolean }`
  - `liftReadout(cA: number, nA: number, cB: number, nB: number): LiftReadout` (relative lift of B vs A)
  - `srmPValue(nA: number, nB: number): number`

- [ ] **Step 1: Write failing tests**

Create `src/lib/prng.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { hashString, mulberry32, uniform, uniformInt } from '@/lib/prng';

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('produces values in [0, 1)', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('helpers', () => {
  it('hashString is stable and unsigned', () => {
    expect(hashString('significant-2026-07-09')).toBe(hashString('significant-2026-07-09'));
    expect(hashString('a')).not.toBe(hashString('b'));
    expect(hashString('x')).toBeGreaterThanOrEqual(0);
  });
  it('uniform stays in range, uniformInt is inclusive', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 200; i++) {
      const u = uniform(rng, 5, 10);
      expect(u).toBeGreaterThanOrEqual(5);
      expect(u).toBeLessThan(10);
      const n = uniformInt(rng, 2, 4);
      expect([2, 3, 4]).toContain(n);
    }
  });
});
```

Create `src/lib/stats.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/lib/prng';
import { binomialDraw, liftReadout, srmPValue } from '@/lib/stats';

describe('binomialDraw', () => {
  it('stays within [0, n] and near the mean for large n', () => {
    const rng = mulberry32(3);
    let sum = 0;
    for (let i = 0; i < 500; i++) {
      const c = binomialDraw(rng, 1000, 0.1);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(1000);
      sum += c;
    }
    expect(sum / 500).toBeGreaterThan(90);
    expect(sum / 500).toBeLessThan(110);
  });
});

describe('liftReadout', () => {
  it('detects an obvious lift as significant', () => {
    const r = liftReadout(1000, 10000, 1200, 10000);
    expect(r.relLift).toBeCloseTo(0.2, 1);
    expect(r.significant).toBe(true);
    expect(r.ciLow).toBeLessThan(r.relLift);
    expect(r.ciHigh).toBeGreaterThan(r.relLift);
  });
  it('reports equal arms as not significant', () => {
    const r = liftReadout(1000, 10000, 1000, 10000);
    expect(r.significant).toBe(false);
    expect(Math.abs(r.relLift)).toBeLessThan(0.001);
  });
});

describe('srmPValue', () => {
  it('flags a 46/54 split on large n, passes 50/50', () => {
    expect(srmPValue(46000, 54000)).toBeLessThan(0.001);
    expect(srmPValue(50050, 49950)).toBeGreaterThan(0.05);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test` → FAIL: cannot resolve `@/lib/prng`, `@/lib/stats`.

- [ ] **Step 3: Implement**

Create `src/lib/prng.ts`:
```ts
export type RNG = () => number;

export function mulberry32(seed: number): RNG {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a 32-bit — stable string → seed. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const uniform = (rng: RNG, lo: number, hi: number): number => lo + rng() * (hi - lo);

export const uniformInt = (rng: RNG, lo: number, hi: number): number =>
  lo + Math.floor(rng() * (hi - lo + 1));

export const pick = <T>(rng: RNG, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];

/** Standard normal via Box-Muller. */
export function normal(rng: RNG): number {
  const u = Math.max(rng(), 1e-12);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
```

Create `src/lib/stats.ts`:
```ts
import { normal, type RNG } from '@/lib/prng';

/** Binomial draw via normal approximation — generators guarantee n*p >= 5. */
export function binomialDraw(rng: RNG, n: number, p: number): number {
  const mean = n * p;
  const sd = Math.sqrt(n * p * (1 - p));
  return Math.min(n, Math.max(0, Math.round(mean + normal(rng) * sd)));
}

/** Standard normal CDF (Abramowitz–Stegun 26.2.17, |err| < 7.5e-8). */
export function phi(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export interface LiftReadout {
  relLift: number;   // relative lift of B vs A, e.g. 0.12 = +12%
  ciLow: number;     // 95% CI bounds on relative lift
  ciHigh: number;
  pValue: number;    // two-sided, two-proportion z-test
  significant: boolean; // pValue < 0.05
}

export function liftReadout(cA: number, nA: number, cB: number, nB: number): LiftReadout {
  const pA = cA / nA;
  const pB = cB / nB;
  const se = Math.sqrt((pA * (1 - pA)) / nA + (pB * (1 - pB)) / nB);
  const diff = pB - pA;
  const z = se === 0 ? 0 : diff / se;
  const pValue = Math.min(1, 2 * (1 - phi(Math.abs(z))));
  return {
    relLift: diff / pA,
    ciLow: (diff - 1.96 * se) / pA,
    ciHigh: (diff + 1.96 * se) / pA,
    pValue,
    significant: pValue < 0.05,
  };
}

/** Two-sided p-value that the observed split deviates from 50/50 allocation. */
export function srmPValue(nA: number, nB: number): number {
  const n = nA + nB;
  const z = (nA - n / 2) / Math.sqrt(n / 4);
  return Math.min(1, 2 * (1 - phi(Math.abs(z))));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` → all prng/stats tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/prng.ts src/lib/stats.ts src/lib/prng.test.ts src/lib/stats.test.ts
git commit -m "feat: seeded prng and two-proportion statistics module"
```

---

### Task 3: Engine types, arm simulation, and flavor text

**Files:**
- Create: `src/lib/engine/types.ts`, `src/lib/engine/simulate.ts`, `src/lib/engine/flavor.ts`
- Test: `src/lib/engine/simulate.test.ts`

**Interfaces:**
- Consumes: `RNG`, `binomialDraw` from Task 2.
- Produces:
  - `type Call = 'ship' | 'kill' | 'keep'`
  - `type ArchetypeId = 'clean-win' | 'clean-loss' | 'winners-curse' | 'peeking' | 'novelty' | 'underpowered' | 'multiple-comparisons' | 'seasonality' | 'srm' | 'simpson'`
  - `interface ArmDay { n: number; c: number }`
  - `interface Scenario` (full readout + truth; exact shape below)
  - `simulateArms(rng: RNG, p: SimParams): { control: ArmDay[]; variant: ArmDay[]; totals: Totals }`
  - `FLAVORS: Flavor[]` (10 entries), `interface Flavor { product: string; hypothesis: string; metricName: string }`

- [ ] **Step 1: Write the types**

Create `src/lib/engine/types.ts`:
```ts
import type { LiftReadout } from '@/lib/stats';

export type Call = 'ship' | 'kill' | 'keep';

export type ArchetypeId =
  | 'clean-win'
  | 'clean-loss'
  | 'winners-curse'
  | 'peeking'
  | 'novelty'
  | 'underpowered'
  | 'multiple-comparisons'
  | 'seasonality'
  | 'srm'
  | 'simpson';

export interface ArmDay {
  n: number; // visitors that day
  c: number; // conversions that day
}

export interface Totals {
  nA: number;
  cA: number;
  nB: number;
  cB: number;
}

export interface SegmentReadout {
  name: string;
  relLift: number; // observed relative lift within the segment
}

export interface Scenario {
  seed: number;
  archetype: ArchetypeId;
  product: string;
  hypothesis: string;
  metricName: string;
  daysPlanned: number;
  daysRun: number;
  control: ArmDay[];
  variant: ArmDay[];
  totals: Totals;
  observed: LiftReadout;
  /** Contextual detail shown on the readout (e.g. "1 of 12 metrics checked"). */
  note?: string;
  /** Only present for the simpson archetype. */
  segments?: SegmentReadout[];
  truth: {
    trueLiftPct: number; // long-run true relative lift, in percent
    correctCall: Call;
    explanation: string; // 2-3 sharp sentences, numbers already slotted in
    trapName: string;    // e.g. "Peeking"
  };
}
```

- [ ] **Step 2: Write failing simulation tests**

Create `src/lib/engine/simulate.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/lib/prng';
import { simulateArms } from '@/lib/engine/simulate';

describe('simulateArms', () => {
  it('produces daysRun days with consistent totals', () => {
    const rng = mulberry32(11);
    const { control, variant, totals } = simulateArms(rng, {
      baseRate: 0.1,
      nPerArmDay: 2000,
      daysRun: 7,
      liftOnDay: () => 0.1,
    });
    expect(control).toHaveLength(7);
    expect(variant).toHaveLength(7);
    expect(totals.nA).toBe(control.reduce((s, d) => s + d.n, 0));
    expect(totals.cB).toBe(variant.reduce((s, d) => s + d.c, 0));
  });

  it('applies allocation to arm sizes', () => {
    const rng = mulberry32(12);
    const { totals } = simulateArms(rng, {
      baseRate: 0.1,
      nPerArmDay: 5000,
      daysRun: 10,
      liftOnDay: () => 0,
      allocationB: 0.46,
    });
    const share = totals.nB / (totals.nA + totals.nB);
    expect(share).toBeGreaterThan(0.44);
    expect(share).toBeLessThan(0.48);
  });

  it('a real lift shows up in aggregate rates', () => {
    const rng = mulberry32(13);
    const { totals } = simulateArms(rng, {
      baseRate: 0.1,
      nPerArmDay: 20000,
      daysRun: 14,
      liftOnDay: () => 0.1,
    });
    expect(totals.cB / totals.nB).toBeGreaterThan(totals.cA / totals.nA);
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run: `npm test` → FAIL: cannot resolve `@/lib/engine/simulate`.

- [ ] **Step 4: Implement simulate + flavor**

Create `src/lib/engine/simulate.ts`:
```ts
import { uniform, type RNG } from '@/lib/prng';
import { binomialDraw } from '@/lib/stats';
import type { ArmDay, Totals } from '@/lib/engine/types';

export interface SimParams {
  baseRate: number;                    // control conversion rate
  nPerArmDay: number;                  // nominal visitors per arm per day
  daysRun: number;
  liftOnDay: (day: number) => number;  // relative lift of variant on day i (0-indexed)
  allocationB?: number;                // share of traffic to variant (default 0.5)
  bumpOnDay?: (day: number) => number; // multiplies BOTH arms' rates (seasonality)
}

export function simulateArms(
  rng: RNG,
  p: SimParams,
): { control: ArmDay[]; variant: ArmDay[]; totals: Totals } {
  const allocB = p.allocationB ?? 0.5;
  const control: ArmDay[] = [];
  const variant: ArmDay[] = [];
  for (let day = 0; day < p.daysRun; day++) {
    const dayTotal = Math.round(p.nPerArmDay * 2 * uniform(rng, 0.9, 1.1));
    const nB = Math.round(dayTotal * allocB);
    const nA = dayTotal - nB;
    const bump = p.bumpOnDay ? p.bumpOnDay(day) : 1;
    const rateA = Math.min(0.95, p.baseRate * bump);
    const rateB = Math.min(0.95, p.baseRate * (1 + p.liftOnDay(day)) * bump);
    control.push({ n: nA, c: binomialDraw(rng, nA, rateA) });
    variant.push({ n: nB, c: binomialDraw(rng, nB, rateB) });
  }
  const totals: Totals = {
    nA: control.reduce((s, d) => s + d.n, 0),
    cA: control.reduce((s, d) => s + d.c, 0),
    nB: variant.reduce((s, d) => s + d.n, 0),
    cB: variant.reduce((s, d) => s + d.c, 0),
  };
  return { control, variant, totals };
}
```

Create `src/lib/engine/flavor.ts` with exactly these 10 entries:
```ts
export interface Flavor {
  product: string;
  hypothesis: string;
  metricName: string;
}

export const FLAVORS: readonly Flavor[] = [
  { product: 'Wavelength, a music app', hypothesis: 'A one-tap "play my mix" button on the home screen increases daily listens', metricName: 'Listen-through rate' },
  { product: 'Cartful, a grocery app', hypothesis: 'Showing delivery ETA before checkout increases order completion', metricName: 'Checkout conversion' },
  { product: 'Loop, a fitness tracker', hypothesis: 'A weekly recap notification increases workout logging', metricName: 'Log rate' },
  { product: 'Nest Egg, a savings app', hypothesis: 'Rounding-up purchases by default increases first deposits', metricName: 'Deposit conversion' },
  { product: 'Papertrail, a docs tool', hypothesis: 'Inline comments (vs. sidebar) increase docs shared per user', metricName: 'Share rate' },
  { product: 'Hopscotch, a travel app', hypothesis: 'Price-drop alerts increase itinerary saves', metricName: 'Save rate' },
  { product: 'Brew, a coffee subscription', hypothesis: 'A quiz-based onboarding increases trial-to-paid conversion', metricName: 'Trial conversion' },
  { product: 'Kindling, a reading app', hypothesis: 'Progress streaks on the library screen increase daily reading sessions', metricName: 'Session rate' },
  { product: 'Relay, a team chat tool', hypothesis: 'Suggested replies increase response rate to @-mentions', metricName: 'Response rate' },
  { product: 'Patch, a plant-care app', hypothesis: 'Photo-based diagnosis increases premium upgrades', metricName: 'Upgrade conversion' },
] as const;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test` → simulate tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/engine
git commit -m "feat: engine types, arm simulation, and scenario flavor text"
```

---

### Task 4: The 10 trap archetypes

**Files:**
- Create: `src/lib/engine/archetypes.ts`
- Test: `src/lib/engine/archetypes.test.ts` (invariant tests run in Task 5 against full scenarios; this file tests the specs' shapes)

**Interfaces:**
- Consumes: `simulateArms`, `SimParams` (Task 3); `RNG`, `uniform`, `uniformInt` (Task 2); `liftReadout`, `srmPValue` (Task 2).
- Produces:
  - `interface SimResult { control: ArmDay[]; variant: ArmDay[]; totals: Totals; segments?: SegmentReadout[] }`
  - `interface DraftView { observed: LiftReadout; totals: Totals; daysRun: number; daysPlanned: number; segments?: SegmentReadout[] }`
  - `interface ArchetypeBuild { daysPlanned: number; daysRun: number; trueLiftPct: number; correctCall: Call; trapName: string; note?: string; simulate(rng: RNG): SimResult; accept?(v: DraftView): boolean; explain(v: DraftView): string }`
  - `ARCHETYPES: Record<ArchetypeId, (rng: RNG) => ArchetypeBuild>`
  - `ARCHETYPE_IDS: ArchetypeId[]` (all 10)

- [ ] **Step 1: Write shape tests**

Create `src/lib/engine/archetypes.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/lib/prng';
import { ARCHETYPES, ARCHETYPE_IDS } from '@/lib/engine/archetypes';

describe('archetype specs', () => {
  it('defines all 10 archetypes', () => {
    expect(ARCHETYPE_IDS).toHaveLength(10);
    for (const id of ARCHETYPE_IDS) expect(ARCHETYPES[id]).toBeTypeOf('function');
  });
  it('every build declares a correct call and trap name', () => {
    for (const id of ARCHETYPE_IDS) {
      const build = ARCHETYPES[id](mulberry32(5));
      expect(['ship', 'kill', 'keep']).toContain(build.correctCall);
      expect(build.trapName.length).toBeGreaterThan(2);
      expect(build.daysRun).toBeLessThanOrEqual(build.daysPlanned);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test` → FAIL: cannot resolve `@/lib/engine/archetypes`.

- [ ] **Step 3: Implement all 10 archetypes**

Create `src/lib/engine/archetypes.ts`:
```ts
import { uniform, uniformInt, type RNG } from '@/lib/prng';
import { liftReadout, srmPValue, type LiftReadout } from '@/lib/stats';
import { simulateArms } from '@/lib/engine/simulate';
import type { ArchetypeId, ArmDay, Call, SegmentReadout, Totals } from '@/lib/engine/types';

export interface SimResult {
  control: ArmDay[];
  variant: ArmDay[];
  totals: Totals;
  segments?: SegmentReadout[];
}

export interface DraftView {
  observed: LiftReadout;
  totals: Totals;
  daysRun: number;
  daysPlanned: number;
  segments?: SegmentReadout[];
}

export interface ArchetypeBuild {
  daysPlanned: number;
  daysRun: number;
  trueLiftPct: number;
  correctCall: Call;
  trapName: string;
  note?: string;
  simulate: (rng: RNG) => SimResult;
  accept?: (v: DraftView) => boolean;
  explain: (v: DraftView) => string;
}

const pct = (x: number) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;

export const ARCHETYPES: Record<ArchetypeId, (rng: RNG) => ArchetypeBuild> = {
  'clean-win': (rng) => {
    const lift = uniform(rng, 0.06, 0.15);
    return {
      daysPlanned: 14, daysRun: 14,
      trueLiftPct: lift * 100, correctCall: 'ship', trapName: 'Clean win',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.05, 0.2), nPerArmDay: uniformInt(r, 3000, 8000), daysRun: 14, liftOnDay: () => lift }),
      accept: (v) => v.observed.significant && v.observed.relLift > 0,
      explain: (v) => `No trap. The test ran its full two weeks, the lift held steady, and the CI (${pct(v.observed.ciLow)} to ${pct(v.observed.ciHigh)}) excludes zero. True lift was ${pct(lift)}. Ship it.`,
    };
  },

  'clean-loss': (rng) => {
    const lift = uniform(rng, -0.12, -0.05);
    return {
      daysPlanned: 14, daysRun: 14,
      trueLiftPct: lift * 100, correctCall: 'kill', trapName: 'Clean loss',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.05, 0.2), nPerArmDay: uniformInt(r, 3000, 8000), daysRun: 14, liftOnDay: () => lift }),
      accept: (v) => v.observed.relLift < 0,
      explain: () => `No trap — just a feature that didn't work. The variant genuinely hurt the metric (true lift ${pct(lift)}). Killing cleanly and writing up the learning is the win here.`,
    };
  },

  'winners-curse': (rng) => {
    return {
      daysPlanned: 14, daysRun: 3,
      trueLiftPct: 0, correctCall: 'kill', trapName: "Winner's curse",
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.04, 0.08), nPerArmDay: uniformInt(r, 150, 300), daysRun: 3, liftOnDay: () => 0 }),
      accept: (v) => v.observed.significant && v.observed.relLift > 0.25,
      explain: (v) => `A ${pct(v.observed.relLift)} lift on ${(v.totals.nA + v.totals.nB).toLocaleString()} users is a red flag, not a jackpot. At tiny sample sizes only huge random swings reach significance — so significant results are systematically inflated. True lift: 0%.`,
    };
  },

  peeking: (rng) => {
    const daysRun = uniformInt(rng, 2, 4);
    return {
      daysPlanned: 14, daysRun,
      trueLiftPct: 0, correctCall: 'keep', trapName: 'Peeking',
      note: 'Planned duration: 14 days.',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.05, 0.15), nPerArmDay: uniformInt(r, 1500, 3000), daysRun, liftOnDay: () => 0 }),
      accept: (v) => v.observed.significant,
      explain: (v) => `You're looking at day ${v.daysRun} of a 14-day test. Checking early and stopping on significance inflates false positives severely — an A/A test peeked at daily crosses p<0.05 at some point more than 25% of the time. True lift: 0%. Let it run.`,
    };
  },

  novelty: (rng) => {
    const early = uniform(rng, 0.15, 0.25);
    const daysRun = uniformInt(rng, 8, 12);
    return {
      daysPlanned: 14, daysRun,
      trueLiftPct: 0, correctCall: 'kill', trapName: 'Novelty effect',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.08, 0.2), nPerArmDay: uniformInt(r, 3000, 6000), daysRun, liftOnDay: (d) => early * Math.exp(-d / 2.5) }),
      accept: (v) => v.observed.relLift > 0.01,
      explain: () => `Look at the chart, not the average: the variant spiked at launch and decayed toward the control every day since. Users noticed the new thing, then stopped caring. The long-run lift converges to ~0%. The aggregate ${'"'}win${'"'} is front-loaded noise.`,
    };
  },

  underpowered: (rng) => {
    const lift = uniform(rng, 0.02, 0.04);
    return {
      daysPlanned: 14, daysRun: 14,
      trueLiftPct: lift * 100, correctCall: 'keep', trapName: 'Underpowered',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.03, 0.06), nPerArmDay: uniformInt(r, 300, 600), daysRun: 14, liftOnDay: () => lift }),
      accept: (v) => !v.observed.significant,
      explain: (v) => `The CI (${pct(v.observed.ciLow)} to ${pct(v.observed.ciHigh)}) spans everything from "mildly harmful" to "clearly worth shipping" — this test can't tell them apart at this traffic level. There IS a real ${pct(lift)} effect here. Extend the test or raise the traffic allocation; don't guess.`,
    };
  },

  'multiple-comparisons': (rng) => {
    return {
      daysPlanned: 14, daysRun: 14,
      trueLiftPct: 0, correctCall: 'kill', trapName: 'Multiple comparisons',
      note: 'This is the only significant result among 12 metrics the team checked.',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.05, 0.15), nPerArmDay: uniformInt(r, 2000, 4000), daysRun: 14, liftOnDay: () => 0 }),
      accept: (v) => v.observed.significant,
      explain: () => `Check 12 metrics at p<0.05 and you expect ~0.6 false positives per experiment — nearly a coin flip that SOMETHING lights up. One significant metric out of twelve, with no pre-registered hypothesis, is exactly what noise looks like. True lift: 0%.`,
    };
  },

  seasonality: (rng) => {
    const promoDay = uniformInt(rng, 3, 6);
    const daysRun = uniformInt(rng, 8, 10);
    return {
      daysPlanned: 14, daysRun,
      trueLiftPct: 0, correctCall: 'keep', trapName: 'Contaminated test',
      note: `Marketing ran a promo email on day ${promoDay + 1} that deep-linked into the variant flow.`,
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.05, 0.15), nPerArmDay: uniformInt(r, 2000, 4000), daysRun, liftOnDay: (d) => (d === promoDay ? 0.35 : 0) }),
      accept: (v) => v.observed.relLift > 0.02,
      explain: () => `The entire lift is concentrated on one day — the day marketing pointed a promo at the variant. That's contamination, not causation. Strip that day and the arms are indistinguishable. Fix the exposure and rerun.`,
    };
  },

  srm: (rng) => {
    const lift = uniform(rng, 0.05, 0.1);
    return {
      daysPlanned: 14, daysRun: 14,
      trueLiftPct: 0, correctCall: 'keep', trapName: 'Sample ratio mismatch',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.05, 0.15), nPerArmDay: uniformInt(r, 3000, 6000), daysRun: 14, liftOnDay: () => lift, allocationB: 0.46 }),
      accept: (v) => srmPValue(v.totals.nA, v.totals.nB) < 0.001,
      explain: (v) => `The split is ${((v.totals.nA / (v.totals.nA + v.totals.nB)) * 100).toFixed(1)}/${((v.totals.nB / (v.totals.nA + v.totals.nB)) * 100).toFixed(1)} on a 50/50 assignment — at this sample size that's a p<0.001 deviation. Something upstream (a crash, a redirect, a bot filter) is selectively dropping users, which biases every number on this readout. Diagnose the assignment bug and rerun; the lift is unreadable until you do.`,
    };
  },

  simpson: (rng) => {
    const withinLift = uniform(rng, -0.09, -0.05);
    return {
      daysPlanned: 14, daysRun: 14,
      trueLiftPct: withinLift * 100, correctCall: 'kill', trapName: "Simpson's paradox",
      note: 'Segment breakdown available below the chart.',
      simulate: (r) => {
        // Two user segments; the variant shifts MIX toward the high-converting
        // segment (e.g. a targeting change) while being worse WITHIN each.
        const hi = { base: 0.3, mixA: 0.5, mixB: 0.75 };
        const lo = { base: 0.05, mixA: 0.5, mixB: 0.25 };
        const nPerArmDay = uniformInt(r, 1200, 2000);
        const seg = (base: number, mixA: number, mixB: number) =>
          simulateArms(r, { baseRate: base, nPerArmDay: Math.round((nPerArmDay * (mixA + mixB)) / 2), daysRun: 14, liftOnDay: () => withinLift, allocationB: mixB / (mixA + mixB) });
        const sHi = seg(hi.base, hi.mixA, hi.mixB);
        const sLo = seg(lo.base, lo.mixA, lo.mixB);
        const control = sHi.control.map((d, i) => ({ n: d.n + sLo.control[i].n, c: d.c + sLo.control[i].c }));
        const variant = sHi.variant.map((d, i) => ({ n: d.n + sLo.variant[i].n, c: d.c + sLo.variant[i].c }));
        const totals = {
          nA: sHi.totals.nA + sLo.totals.nA, cA: sHi.totals.cA + sLo.totals.cA,
          nB: sHi.totals.nB + sLo.totals.nB, cB: sHi.totals.cB + sLo.totals.cB,
        };
        const segLift = (s: SimResult) => liftReadout(s.totals.cA, s.totals.nA, s.totals.cB, s.totals.nB).relLift;
        const segments: SegmentReadout[] = [
          { name: 'Power users', relLift: segLift(sHi) },
          { name: 'Casual users', relLift: segLift(sLo) },
        ];
        return { control, variant, totals, segments };
      },
      accept: (v) => v.observed.relLift > 0.05 && (v.segments ?? []).every((s) => s.relLift < 0),
      explain: (v) => `Aggregate says ${pct(v.observed.relLift)}; both segments say the variant is WORSE. The variant changed the user mix (more power users saw it), and the mix shift masquerades as a lift. Within every group of real users, the feature loses. That's Simpson's paradox — and a kill.`,
    };
  },
};

export const ARCHETYPE_IDS = Object.keys(ARCHETYPES) as ArchetypeId[];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` → archetype shape tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/engine/archetypes.ts src/lib/engine/archetypes.test.ts
git commit -m "feat: 10 trap archetype generators with reveal copy"
```

---

### Task 5: Scenario assembly, daily seeds, and statistical sanity suite

**Files:**
- Create: `src/lib/engine/scenario.ts`, `src/lib/engine/daily.ts`
- Test: `src/lib/engine/scenario.test.ts`, `src/lib/engine/daily.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 2–4.
- Produces:
  - `generateScenario(seed: number, archetypeId: ArchetypeId): Scenario`
  - `campaignSeed(levelId: number, attempt: number): number`
  - `dayNumber(date: string): number` (1-based puzzle number; date is `YYYY-MM-DD`)
  - `dailySeed(date: string): number`; `dailyArchetype(date: string): ArchetypeId`
  - `CAMPAIGN_LEVELS: { id: number; archetype: ArchetypeId }[]` (10 levels, blatant → subtle)

- [ ] **Step 1: Write failing tests**

Create `src/lib/engine/scenario.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { ARCHETYPE_IDS, ARCHETYPES } from '@/lib/engine/archetypes';
import { generateScenario } from '@/lib/engine/scenario';
import { srmPValue } from '@/lib/stats';

describe('generateScenario', () => {
  it('is deterministic: same seed → identical scenario', () => {
    const a = generateScenario(123, 'peeking');
    const b = generateScenario(123, 'peeking');
    expect(a).toEqual(b);
  });

  it('different seeds → different data', () => {
    const a = generateScenario(1, 'clean-win');
    const b = generateScenario(2, 'clean-win');
    expect(a.totals).not.toEqual(b.totals);
  });

  it('every scenario is internally consistent', () => {
    for (const id of ARCHETYPE_IDS) {
      const s = generateScenario(99, id);
      expect(s.control).toHaveLength(s.daysRun);
      expect(s.totals.cA).toBe(s.control.reduce((x, d) => x + d.c, 0));
      expect(s.truth.explanation.length).toBeGreaterThan(40);
    }
  });
});

// Statistical sanity: invariants hold across many seeds.
const SEEDS = Array.from({ length: 60 }, (_, i) => i * 7 + 1);

describe('archetype invariants', () => {
  it('peeking: early, significant, true lift 0', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'peeking');
      expect(s.daysRun).toBeLessThanOrEqual(4);
      expect(s.observed.significant).toBe(true);
      expect(s.truth.trueLiftPct).toBe(0);
      expect(s.truth.correctCall).toBe('keep');
    }
  });
  it('winners-curse: tiny n, huge significant lift, true lift 0', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'winners-curse');
      expect(s.totals.nA + s.totals.nB).toBeLessThan(4000);
      expect(s.observed.relLift).toBeGreaterThan(0.25);
      expect(s.truth.correctCall).toBe('kill');
    }
  });
  it('underpowered: not significant, real small effect, keep', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'underpowered');
      expect(s.observed.significant).toBe(false);
      expect(s.truth.trueLiftPct).toBeGreaterThan(1);
      expect(s.truth.correctCall).toBe('keep');
    }
  });
  it('srm: allocation fails the SRM check', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'srm');
      expect(srmPValue(s.totals.nA, s.totals.nB)).toBeLessThan(0.001);
    }
  });
  it('simpson: aggregate positive, every segment negative', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'simpson');
      expect(s.observed.relLift).toBeGreaterThan(0);
      expect(s.segments).toBeDefined();
      for (const seg of s.segments!) expect(seg.relLift).toBeLessThan(0);
    }
  });
  it('novelty: variant advantage decays from first to last day', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'novelty');
      const relDay = (i: number) => s.variant[i].c / s.variant[i].n - s.control[i].c / s.control[i].n;
      expect(relDay(0)).toBeGreaterThan(relDay(s.daysRun - 1));
    }
  });
  it('clean-win ships, clean-loss kills, both run full duration', () => {
    for (const seed of SEEDS) {
      const w = generateScenario(seed, 'clean-win');
      expect(w.observed.significant).toBe(true);
      expect(w.daysRun).toBe(w.daysPlanned);
      expect(w.truth.correctCall).toBe('ship');
      const l = generateScenario(seed, 'clean-loss');
      expect(l.observed.relLift).toBeLessThan(0);
      expect(l.truth.correctCall).toBe('kill');
    }
  });
});
```

Create `src/lib/engine/daily.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { CAMPAIGN_LEVELS, campaignSeed } from '@/lib/engine/scenario';
import { dailyArchetype, dailySeed, dayNumber } from '@/lib/engine/daily';

describe('daily', () => {
  it('dayNumber increments by 1 per calendar day', () => {
    expect(dayNumber('2026-07-10') - dayNumber('2026-07-09')).toBe(1);
    expect(dayNumber('2026-08-01') - dayNumber('2026-07-31')).toBe(1);
  });
  it('same date → same seed; consecutive dates → different archetypes', () => {
    expect(dailySeed('2026-07-09')).toBe(dailySeed('2026-07-09'));
    expect(dailyArchetype('2026-07-09')).not.toBe(dailyArchetype('2026-07-10'));
  });
});

describe('campaign', () => {
  it('has 10 ordered levels and distinct seeds per attempt', () => {
    expect(CAMPAIGN_LEVELS).toHaveLength(10);
    expect(CAMPAIGN_LEVELS[0].archetype).toBe('clean-win');
    expect(campaignSeed(3, 1)).not.toBe(campaignSeed(3, 2));
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test` → FAIL: cannot resolve `@/lib/engine/scenario`, `@/lib/engine/daily`.

- [ ] **Step 3: Implement**

Create `src/lib/engine/scenario.ts`:
```ts
import { hashString, mulberry32, pick } from '@/lib/prng';
import { liftReadout } from '@/lib/stats';
import { ARCHETYPES } from '@/lib/engine/archetypes';
import { FLAVORS } from '@/lib/engine/flavor';
import type { ArchetypeId, Scenario } from '@/lib/engine/types';

/** Campaign order: blatant traps first, subtle ones last. */
export const CAMPAIGN_LEVELS: { id: number; archetype: ArchetypeId }[] = [
  { id: 1, archetype: 'clean-win' },
  { id: 2, archetype: 'clean-loss' },
  { id: 3, archetype: 'winners-curse' },
  { id: 4, archetype: 'peeking' },
  { id: 5, archetype: 'novelty' },
  { id: 6, archetype: 'underpowered' },
  { id: 7, archetype: 'multiple-comparisons' },
  { id: 8, archetype: 'seasonality' },
  { id: 9, archetype: 'srm' },
  { id: 10, archetype: 'simpson' },
];

export const campaignSeed = (levelId: number, attempt: number): number =>
  hashString(`significant-campaign-${levelId}-${attempt}`);

export function generateScenario(seed: number, archetypeId: ArchetypeId): Scenario {
  const rng = mulberry32(seed);
  const flavor = pick(rng, FLAVORS);
  for (let attempt = 0; attempt < 1000; attempt++) {
    const build = ARCHETYPES[archetypeId](rng);
    const sim = build.simulate(rng);
    const observed = liftReadout(sim.totals.cA, sim.totals.nA, sim.totals.cB, sim.totals.nB);
    const view = {
      observed,
      totals: sim.totals,
      daysRun: build.daysRun,
      daysPlanned: build.daysPlanned,
      segments: sim.segments,
    };
    if (build.accept && !build.accept(view)) continue;
    return {
      seed,
      archetype: archetypeId,
      product: flavor.product,
      hypothesis: flavor.hypothesis,
      metricName: flavor.metricName,
      daysPlanned: build.daysPlanned,
      daysRun: build.daysRun,
      control: sim.control,
      variant: sim.variant,
      totals: sim.totals,
      observed,
      note: build.note,
      segments: sim.segments,
      truth: {
        trueLiftPct: build.trueLiftPct,
        correctCall: build.correctCall,
        explanation: build.explain(view),
        trapName: build.trapName,
      },
    };
  }
  throw new Error(`archetype ${archetypeId}: no accepted draw in 1000 attempts (seed ${seed})`);
}
```

Create `src/lib/engine/daily.ts`:
```ts
import { hashString } from '@/lib/prng';
import type { ArchetypeId } from '@/lib/engine/types';

/** Puzzle #1 = 2026-08-01 (launch). Earlier dates give numbers <= 0; fine for dev. */
const EPOCH_UTC = Date.UTC(2026, 7, 1);

/** Fixed rotation, shuffled so consecutive days always differ. */
const ROTATION: ArchetypeId[] = [
  'peeking', 'clean-win', 'srm', 'novelty', 'clean-loss',
  'multiple-comparisons', 'winners-curse', 'seasonality', 'underpowered', 'simpson',
];

export function dayNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Math.floor((Date.UTC(y, m - 1, d) - EPOCH_UTC) / 86_400_000) + 1;
}

export const dailySeed = (date: string): number => hashString(`significant-daily-${date}`);

export function dailyArchetype(date: string): ArchetypeId {
  const idx = ((dayNumber(date) % ROTATION.length) + ROTATION.length) % ROTATION.length;
  return ROTATION[idx];
}
```

- [ ] **Step 4: Run the full suite**

Run: `npm test` → all tests PASS, including the 60-seed invariant sweep for every archetype. If any invariant test is flaky, the archetype's `accept` predicate is too loose — tighten the predicate, never the test.

- [ ] **Step 5: Commit**

```bash
git add src/lib/engine
git commit -m "feat: scenario assembly, campaign order, daily seeds + invariant suite"
```

---

### Task 6: Progress store (XP, campaign stars, streaks, shields, sound pref)

**Files:**
- Create: `src/lib/progress.ts`
- Test: `src/lib/progress.test.ts`

**Interfaces:**
- Consumes: `dayNumber` (Task 5).
- Produces:
  - `interface SignificantState { campaign: Record<number, { stars: 0 | 1 | 3; attempts: number; correct: boolean }>; warmupDone: boolean; dailyStreak: number; lastDailyDate: string | null; lastDailyCorrect: boolean | null; shields: number; xp: number; soundOn: boolean }`
  - `defaultState(): SignificantState`
  - Pure reducers: `recordCampaignResult(s, levelId: number, correct: boolean): SignificantState` (first-attempt correct → 3 stars, retry correct → 1); `recordDaily(s, date: string, correct: boolean): SignificantState` (streak +1 on consecutive day; a single missed day auto-spends a shield; otherwise reset to 1; shield earned at every 7-streak multiple, max 2; no-op if date already played); `addXp(s, amount: number): SignificantState`; `completeWarmup(s): SignificantState`
  - Storage: `loadState(): SignificantState`, `saveState(s): void` — localStorage key `pmlab:significant:v1`, guarded try/catch, in-memory fallback so the game never crashes. `saveState` also mirrors `{ xp }` to the lab-wide profile key `pmlab:profile:v1` (future games merge their XP into this shared profile).
  - `xpForCall(correct: boolean, combo: number): number` → `correct ? 100 * Math.min(combo, 3) : 0`

- [ ] **Step 1: Write failing tests**

Create `src/lib/progress.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { addXp, defaultState, recordCampaignResult, recordDaily, xpForCall } from '@/lib/progress';

describe('campaign results', () => {
  it('first-try correct → 3 stars; retry correct → 1 star; keeps best', () => {
    let s = defaultState();
    s = recordCampaignResult(s, 1, true);
    expect(s.campaign[1]).toMatchObject({ stars: 3, correct: true });
    s = recordCampaignResult(defaultState(), 2, false);
    expect(s.campaign[2].stars).toBe(0);
    s = recordCampaignResult(s, 2, true);
    expect(s.campaign[2].stars).toBe(1);
    s = recordCampaignResult(s, 2, false); // never downgrade
    expect(s.campaign[2].stars).toBe(1);
  });
});

describe('daily streaks', () => {
  it('consecutive days increment; playing twice is a no-op', () => {
    let s = defaultState();
    s = recordDaily(s, '2026-08-01', true);
    s = recordDaily(s, '2026-08-02', false); // played = streak, regardless of correctness
    expect(s.dailyStreak).toBe(2);
    const again = recordDaily(s, '2026-08-02', true);
    expect(again).toEqual(s);
  });
  it('a one-day gap spends a shield; without one, resets', () => {
    let s = { ...defaultState(), shields: 1 };
    s = recordDaily(s, '2026-08-01', true);
    s = recordDaily(s, '2026-08-03', true); // missed Aug 2
    expect(s.dailyStreak).toBe(2);
    expect(s.shields).toBe(0);
    s = recordDaily(s, '2026-08-06', true); // 2-day gap, no shield
    expect(s.dailyStreak).toBe(1);
  });
  it('earns a shield at each 7-multiple, capped at 2', () => {
    let s = defaultState();
    for (let d = 1; d <= 7; d++) s = recordDaily(s, `2026-08-0${d}`, true);
    expect(s.dailyStreak).toBe(7);
    expect(s.shields).toBe(1);
  });
});

describe('xp', () => {
  it('scales with combo, capped at x3', () => {
    expect(xpForCall(true, 1)).toBe(100);
    expect(xpForCall(true, 3)).toBe(300);
    expect(xpForCall(true, 9)).toBe(300);
    expect(xpForCall(false, 5)).toBe(0);
    expect(addXp(defaultState(), 250).xp).toBe(250);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test` → FAIL: cannot resolve `@/lib/progress`.

- [ ] **Step 3: Implement**

Create `src/lib/progress.ts`:
```ts
import { dayNumber } from '@/lib/engine/daily';

export interface CampaignLevelResult {
  stars: 0 | 1 | 3;
  attempts: number;
  correct: boolean;
}

export interface SignificantState {
  campaign: Record<number, CampaignLevelResult>;
  warmupDone: boolean;
  dailyStreak: number;
  lastDailyDate: string | null;
  lastDailyCorrect: boolean | null;
  shields: number;
  xp: number;
  soundOn: boolean;
}

export const defaultState = (): SignificantState => ({
  campaign: {},
  warmupDone: false,
  dailyStreak: 0,
  lastDailyDate: null,
  lastDailyCorrect: null,
  shields: 0,
  xp: 0,
  soundOn: true,
});

export const xpForCall = (correct: boolean, combo: number): number =>
  correct ? 100 * Math.min(combo, 3) : 0;

export const addXp = (s: SignificantState, amount: number): SignificantState => ({
  ...s,
  xp: s.xp + amount,
});

export const completeWarmup = (s: SignificantState): SignificantState => ({
  ...s,
  warmupDone: true,
});

export function recordCampaignResult(
  s: SignificantState,
  levelId: number,
  correct: boolean,
): SignificantState {
  const prev = s.campaign[levelId] ?? { stars: 0 as const, attempts: 0, correct: false };
  const attempts = prev.attempts + 1;
  const earned: 0 | 1 | 3 = correct ? (attempts === 1 ? 3 : 1) : 0;
  const stars = Math.max(prev.stars, earned) as 0 | 1 | 3;
  return {
    ...s,
    campaign: { ...s.campaign, [levelId]: { stars, attempts, correct: prev.correct || correct } },
  };
}

export function recordDaily(s: SignificantState, date: string, correct: boolean): SignificantState {
  if (s.lastDailyDate === date) return s;
  const gap = s.lastDailyDate === null ? Infinity : dayNumber(date) - dayNumber(s.lastDailyDate);
  let shields = s.shields;
  let streak: number;
  if (gap === 1) streak = s.dailyStreak + 1;
  else if (gap === 2 && shields > 0) {
    shields -= 1;
    streak = s.dailyStreak + 1;
  } else streak = 1;
  if (streak > 0 && streak % 7 === 0) shields = Math.min(2, shields + 1);
  return { ...s, dailyStreak: streak, lastDailyDate: date, lastDailyCorrect: correct, shields };
}

// ---- storage (browser-safe) ----

const KEY = 'pmlab:significant:v1';
let memoryFallback: string | null = null;

export function loadState(): SignificantState {
  try {
    const raw =
      typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : memoryFallback;
    if (!raw) return defaultState();
    return { ...defaultState(), ...(JSON.parse(raw) as Partial<SignificantState>) };
  } catch {
    return defaultState();
  }
}

export function saveState(s: SignificantState): void {
  const raw = JSON.stringify(s);
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(KEY, raw);
      // Lab-wide profile shared by all pm-lab games. With one game,
      // lab XP === significant XP; future games merge their XP in here.
      window.localStorage.setItem('pmlab:profile:v1', JSON.stringify({ xp: s.xp }));
    } else memoryFallback = raw;
  } catch {
    memoryFallback = raw;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` → progress tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/progress.ts src/lib/progress.test.ts
git commit -m "feat: progress store with stars, streaks, shields, and xp"
```

---

### Task 7: Juice library (PressButton, CountUp, confetti, sound, haptics)

**Files:**
- Create: `src/components/juice/PressButton.tsx`, `src/components/juice/CountUp.tsx`, `src/components/juice/confetti.ts`, `src/components/juice/sound.ts`, `src/components/juice/haptics.ts`
- Test: `src/components/juice/juice.test.tsx`

**Interfaces:**
- Produces:
  - `<PressButton color="brand" | "win" | "lose" | "sky" onClick={...} disabled? ariaLabel? className?>children</PressButton>`
  - `<CountUp value={number} durationMs?={600} className? />` — animates from previous value via rAF
  - `fireConfetti(opts?: { big?: boolean; reducedMotion?: boolean }): void` — no-op when `reducedMotion`
  - `sfx: { click(on: boolean): void; win(on: boolean): void; lose(on: boolean): void; reward(on: boolean): void }` — every method takes the sound preference; silent when `false`
  - `vibrate(pattern: number | number[]): void` — guarded no-op off-device

- [ ] **Step 1: Write failing tests**

Create `src/components/juice/juice.test.tsx`:
```tsx
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PressButton } from '@/components/juice/PressButton';
import { CountUp } from '@/components/juice/CountUp';
import { vibrate } from '@/components/juice/haptics';

describe('PressButton', () => {
  it('renders children and fires onClick', () => {
    const onClick = vi.fn();
    render(<PressButton color="win" onClick={onClick}>Ship</PressButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Ship' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
  it('does not fire when disabled', () => {
    const onClick = vi.fn();
    render(<PressButton color="lose" onClick={onClick} disabled>Kill</PressButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Kill' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('CountUp', () => {
  it('renders the final value', () => {
    render(<CountUp value={250} durationMs={0} />);
    expect(screen.getByText('250')).toBeInTheDocument();
  });
});

describe('haptics', () => {
  it('never throws without vibration support', () => {
    expect(() => vibrate(30)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test` → FAIL: modules not found.

- [ ] **Step 3: Implement**

Create `src/components/juice/PressButton.tsx`:
```tsx
'use client';

const STYLES = {
  brand: 'bg-brand text-white shadow-[0_4px_0_var(--color-brand-deep)]',
  win: 'bg-win text-white shadow-[0_4px_0_var(--color-win-deep)]',
  lose: 'bg-lose text-white shadow-[0_4px_0_var(--color-lose-deep)]',
  sky: 'bg-sky text-white shadow-[0_4px_0_var(--color-sky-deep)]',
} as const;

interface PressButtonProps {
  color: keyof typeof STYLES;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export function PressButton({ color, onClick, disabled, ariaLabel, className = '', children }: PressButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`btn-3d px-4 py-3 text-base disabled:opacity-40 disabled:shadow-none ${STYLES[color]} ${className}`}
    >
      {children}
    </button>
  );
}
```

Create `src/components/juice/CountUp.tsx`:
```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  durationMs?: number;
  className?: string;
}

export function CountUp({ value, durationMs = 600, className }: CountUpProps) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    fromRef.current = value;
    if (durationMs === 0 || from === value) {
      setShown(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / durationMs);
      const eased = 1 - (1 - k) ** 3;
      setShown(Math.round(from + (value - from) * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span className={className}>{shown}</span>;
}
```

Create `src/components/juice/confetti.ts`:
```ts
'use client';

export function fireConfetti(opts: { big?: boolean; reducedMotion?: boolean } = {}): void {
  if (opts.reducedMotion) return;
  import('canvas-confetti').then(({ default: confetti }) => {
    confetti({
      particleCount: opts.big ? 220 : 70,
      spread: opts.big ? 110 : 65,
      startVelocity: opts.big ? 45 : 32,
      origin: { y: 0.7 },
      colors: ['#7c3aed', '#22c55e', '#f59e0b', '#3b82f6', '#f43f5e'],
    });
  });
}
```

Create `src/components/juice/sound.ts` (WebAudio, zero assets):
```ts
'use client';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, ms: number, delayMs = 0, type: OscillatorType = 'sine', gain = 0.05) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime + delayMs / 1000;
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + ms / 1000);
}

export const sfx = {
  click: (on: boolean) => on && tone(600, 60, 0, 'triangle', 0.03),
  win: (on: boolean) => {
    if (!on) return;
    tone(523, 120);          // C5
    tone(784, 200, 110);     // G5
  },
  lose: (on: boolean) => on && tone(140, 220, 0, 'square', 0.04),
  reward: (on: boolean) => {
    if (!on) return;
    tone(523, 100);
    tone(659, 100, 90);
    tone(784, 100, 180);
    tone(1047, 260, 270);
  },
};
```

Create `src/components/juice/haptics.ts`:
```ts
'use client';

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* unsupported — ignore */
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` → juice tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/juice
git commit -m "feat: shared juice library — 3d buttons, count-up, confetti, sound, haptics"
```

---

### Task 8: Readout UI (Sparkline, ReadoutCard, DecisionButtons)

**Files:**
- Create: `src/components/significant/Sparkline.tsx`, `src/components/significant/ReadoutCard.tsx`, `src/components/significant/DecisionButtons.tsx`
- Test: `src/components/significant/readout.test.tsx`

**Interfaces:**
- Consumes: `Scenario`, `ArmDay` (Task 3); `generateScenario` (Task 5, in tests); `PressButton` (Task 7).
- Produces:
  - `<Sparkline control={ArmDay[]} variant={ArmDay[]} />`
  - `<ReadoutCard scenario={Scenario} />`
  - `<DecisionButtons onCall={(call: Call) => void} disabled? />` — renders exactly three buttons labeled `Ship`, `Kill`, `Keep Running`

- [ ] **Step 1: Write failing tests**

Create `src/components/significant/readout.test.tsx`:
```tsx
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { generateScenario } from '@/lib/engine/scenario';
import { ReadoutCard } from '@/components/significant/ReadoutCard';
import { DecisionButtons } from '@/components/significant/DecisionButtons';

describe('ReadoutCard', () => {
  it('shows hypothesis, metric, duration, and lift', () => {
    const s = generateScenario(42, 'clean-win');
    render(<ReadoutCard scenario={s} />);
    expect(screen.getByText(s.hypothesis)).toBeInTheDocument();
    expect(screen.getByText(s.metricName)).toBeInTheDocument();
    expect(screen.getByText(`Day ${s.daysRun} of ${s.daysPlanned}`)).toBeInTheDocument();
  });
  it('shows the note chip and segment table when present', () => {
    const s = generateScenario(42, 'simpson');
    render(<ReadoutCard scenario={s} />);
    expect(screen.getByText(/Power users/)).toBeInTheDocument();
  });
});

describe('DecisionButtons', () => {
  it('emits the chosen call', () => {
    const onCall = vi.fn();
    render(<DecisionButtons onCall={onCall} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ship' }));
    expect(onCall).toHaveBeenCalledWith('ship');
    fireEvent.click(screen.getByRole('button', { name: 'Keep Running' }));
    expect(onCall).toHaveBeenCalledWith('keep');
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test` → FAIL: modules not found.

- [ ] **Step 3: Implement**

Create `src/components/significant/Sparkline.tsx`:
```tsx
import type { ArmDay } from '@/lib/engine/types';

interface SparklineProps {
  control: ArmDay[];
  variant: ArmDay[];
}

/** Dual-line daily conversion-rate chart. Pure SVG, no library. */
export function Sparkline({ control, variant }: SparklineProps) {
  const W = 300;
  const H = 88;
  const PAD = 8;
  const rates = (arm: ArmDay[]) => arm.map((d) => d.c / d.n);
  const all = [...rates(control), ...rates(variant)];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const x = (i: number, len: number) => PAD + (i * (W - 2 * PAD)) / Math.max(1, len - 1);
  const y = (r: number) => H - PAD - ((r - min) / Math.max(1e-9, max - min)) * (H - 2 * PAD);
  const path = (arm: ArmDay[]) =>
    rates(arm).map((r, i) => `${i === 0 ? 'M' : 'L'}${x(i, arm.length).toFixed(1)},${y(r).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Daily conversion rate, control vs variant">
      <path d={path(control)} fill="none" stroke="var(--color-ink-soft)" strokeWidth="2.5" strokeLinecap="round" />
      <path d={path(variant)} fill="none" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
```

Create `src/components/significant/ReadoutCard.tsx`:
```tsx
import type { Scenario } from '@/lib/engine/types';
import { Sparkline } from '@/components/significant/Sparkline';

const pct = (x: number) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;

export function ReadoutCard({ scenario: s }: { scenario: Scenario }) {
  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-6 shadow-lg shadow-ink/5" data-seed={s.seed}>
      <p className="text-sm text-ink-soft">{s.product}</p>
      <h2 className="mt-1 text-lg font-extrabold leading-snug">{s.hypothesis}</h2>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-sm font-extrabold text-ink-soft">{s.metricName}</span>
        <span className="rounded-full bg-bg px-3 py-1 text-sm font-extrabold">{`Day ${s.daysRun} of ${s.daysPlanned}`}</span>
      </div>

      <div className="mt-2"><Sparkline control={s.control} variant={s.variant} /></div>
      <div className="mt-1 flex gap-4 text-xs text-ink-soft">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-brand" />Variant</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-ink-soft" />Control</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-bg p-3">
          <p className="text-xs text-ink-soft">Observed lift</p>
          <p className={`text-2xl font-extrabold ${s.observed.relLift >= 0 ? 'text-win-deep' : 'text-lose-deep'}`}>{pct(s.observed.relLift)}</p>
        </div>
        <div className="rounded-2xl bg-bg p-3">
          <p className="text-xs text-ink-soft">95% CI · p={s.observed.pValue < 0.001 ? '<0.001' : s.observed.pValue.toFixed(3)}</p>
          <p className="text-sm font-extrabold">{pct(s.observed.ciLow)} to {pct(s.observed.ciHigh)}</p>
        </div>
      </div>

      <p className="mt-2 text-xs text-ink-soft">
        {s.totals.nA.toLocaleString()} control · {s.totals.nB.toLocaleString()} variant users
      </p>

      {s.note && <p className="mt-3 rounded-2xl bg-gold/15 px-3 py-2 text-sm font-extrabold text-ink">{s.note}</p>}

      {s.segments && (
        <table className="mt-3 w-full text-sm">
          <tbody>
            {s.segments.map((seg) => (
              <tr key={seg.name} className="border-t border-bg">
                <td className="py-1.5 text-ink-soft">{seg.name}</td>
                <td className={`py-1.5 text-right font-extrabold ${seg.relLift >= 0 ? 'text-win-deep' : 'text-lose-deep'}`}>{pct(seg.relLift)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
```

Create `src/components/significant/DecisionButtons.tsx`:
```tsx
'use client';

import type { Call } from '@/lib/engine/types';
import { PressButton } from '@/components/juice/PressButton';

interface DecisionButtonsProps {
  onCall: (call: Call) => void;
  disabled?: boolean;
}

export function DecisionButtons({ onCall, disabled }: DecisionButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <PressButton color="win" onClick={() => onCall('ship')} disabled={disabled}>Ship</PressButton>
      <PressButton color="lose" onClick={() => onCall('kill')} disabled={disabled}>Kill</PressButton>
      <PressButton color="sky" onClick={() => onCall('keep')} disabled={disabled} className="text-sm leading-tight">Keep Running</PressButton>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` → readout tests PASS.

- [ ] **Step 5: Visual check + commit**

Run `npm run dev`, temporarily render `<ReadoutCard scenario={generateScenario(1, 'clean-win')} />` on the home page, confirm mobile layout at 375px width, then remove the temporary render.

```bash
git add src/components/significant
git commit -m "feat: experiment readout card, sparkline, and decision buttons"
```

---

### Task 9: The round loop (useGameRound, RevealPanel, ComboFlame, GameRound)

**Files:**
- Create: `src/hooks/useGameRound.ts`, `src/components/significant/RevealPanel.tsx`, `src/components/significant/ComboFlame.tsx`, `src/components/significant/GameRound.tsx`
- Test: `src/hooks/useGameRound.test.tsx`

**Interfaces:**
- Consumes: `Scenario`, `Call` (Task 3); `xpForCall` (Task 6); juice library (Task 7); readout components (Task 8).
- Produces:
  - `useGameRound(scenario: Scenario, combo: number): { phase: 'deciding' | 'revealed'; call: Call | null; correct: boolean | null; crit: boolean; xpEarned: number; decide(call: Call): void }` — `crit` is decided at decide-time (`Math.random() < 0.05`, presentation-layer randomness is allowed outside the engine) and doubles XP.
  - `<GameRound scenario={Scenario} combo={number} soundOn={boolean} onComplete={(r: { correct: boolean; xpEarned: number }) => void} />` — full round: readout → decision (sfx/haptics/confetti fire here) → reveal → "Next" calls `onComplete`.
  - `<ComboFlame combo={number} />` — hidden below 2, shows `×2`/`×3` badge with pulse.
  - `<RevealPanel scenario={Scenario} call={Call} correct={boolean} xpEarned={number} crit={boolean} onNext={() => void} />`

- [ ] **Step 1: Write failing hook test**

Create `src/hooks/useGameRound.test.tsx`:
```tsx
import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { generateScenario } from '@/lib/engine/scenario';
import { useGameRound } from '@/hooks/useGameRound';

afterEach(() => vi.restoreAllMocks());

describe('useGameRound', () => {
  it('scores a correct call with combo multiplier', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // no crit
    const s = generateScenario(7, 'clean-win'); // correct call: ship
    const { result } = renderHook(() => useGameRound(s, 2));
    act(() => result.current.decide('ship'));
    expect(result.current.phase).toBe('revealed');
    expect(result.current.correct).toBe(true);
    expect(result.current.xpEarned).toBe(200); // 100 * combo 2
  });
  it('a wrong call earns nothing', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const s = generateScenario(7, 'peeking'); // correct call: keep
    const { result } = renderHook(() => useGameRound(s, 1));
    act(() => result.current.decide('ship'));
    expect(result.current.correct).toBe(false);
    expect(result.current.xpEarned).toBe(0);
  });
  it('a crit doubles xp', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01); // crit
    const s = generateScenario(7, 'clean-win');
    const { result } = renderHook(() => useGameRound(s, 1));
    act(() => result.current.decide('ship'));
    expect(result.current.crit).toBe(true);
    expect(result.current.xpEarned).toBe(200);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test` → FAIL: cannot resolve `@/hooks/useGameRound`.

- [ ] **Step 3: Implement hook + components**

Create `src/hooks/useGameRound.ts`:
```ts
'use client';

import { useCallback, useState } from 'react';
import type { Call, Scenario } from '@/lib/engine/types';
import { xpForCall } from '@/lib/progress';

interface RoundState {
  phase: 'deciding' | 'revealed';
  call: Call | null;
  correct: boolean | null;
  crit: boolean;
  xpEarned: number;
}

export function useGameRound(scenario: Scenario, combo: number) {
  const [state, setState] = useState<RoundState>({
    phase: 'deciding', call: null, correct: null, crit: false, xpEarned: 0,
  });

  const decide = useCallback(
    (call: Call) => {
      setState((prev) => {
        if (prev.phase === 'revealed') return prev;
        const correct = call === scenario.truth.correctCall;
        const crit = correct && Math.random() < 0.05;
        return {
          phase: 'revealed', call, correct, crit,
          xpEarned: xpForCall(correct, combo) * (crit ? 2 : 1),
        };
      });
    },
    [scenario, combo],
  );

  return { ...state, decide };
}
```

Create `src/components/significant/ComboFlame.tsx`:
```tsx
'use client';

export function ComboFlame({ combo }: { combo: number }) {
  if (combo < 2) return null;
  return (
    <span className="animate-pulse rounded-full bg-gold px-3 py-1 text-sm font-extrabold text-white" aria-label={`Combo multiplier ${Math.min(combo, 3)}x`}>
      ×{Math.min(combo, 3)} COMBO
    </span>
  );
}
```

Create `src/components/significant/RevealPanel.tsx`:
```tsx
'use client';

import type { Call, Scenario } from '@/lib/engine/types';
import { CountUp } from '@/components/juice/CountUp';
import { PressButton } from '@/components/juice/PressButton';

const CALL_LABEL: Record<Call, string> = { ship: 'Ship', kill: 'Kill', keep: 'Keep Running' };

interface RevealPanelProps {
  scenario: Scenario;
  call: Call;
  correct: boolean;
  xpEarned: number;
  crit: boolean;
  onNext: () => void;
}

export function RevealPanel({ scenario: s, call, correct, xpEarned, crit, onNext }: RevealPanelProps) {
  return (
    <section className={`rounded-[var(--radius-card)] p-6 text-white shadow-lg ${correct ? 'bg-win-deep' : 'bg-lose-deep'}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold">{correct ? 'Correct call!' : 'Not this time'}</h3>
        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-extrabold">{s.truth.trapName}</span>
      </div>
      <p className="mt-1 text-sm opacity-90">
        You said {CALL_LABEL[call]} · the right call was {CALL_LABEL[s.truth.correctCall]} · true lift {s.truth.trueLiftPct >= 0 ? '+' : ''}{s.truth.trueLiftPct.toFixed(1)}%
      </p>
      <p className="mt-3 leading-relaxed">{s.truth.explanation}</p>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg font-extrabold" aria-live="polite">
          +<CountUp value={xpEarned} /> XP{crit && <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs">CRITICAL INSIGHT ×2</span>}
        </p>
        <PressButton color="brand" onClick={onNext} className="bg-white !text-ink shadow-[0_4px_0_rgba(0,0,0,0.25)]">Next</PressButton>
      </div>
    </section>
  );
}
```

Create `src/components/significant/GameRound.tsx`:
```tsx
'use client';

import { useReducedMotion } from 'framer-motion';
import type { Scenario } from '@/lib/engine/types';
import { useGameRound } from '@/hooks/useGameRound';
import { ReadoutCard } from '@/components/significant/ReadoutCard';
import { DecisionButtons } from '@/components/significant/DecisionButtons';
import { RevealPanel } from '@/components/significant/RevealPanel';
import { fireConfetti } from '@/components/juice/confetti';
import { sfx } from '@/components/juice/sound';
import { vibrate } from '@/components/juice/haptics';

interface GameRoundProps {
  scenario: Scenario;
  combo: number;
  soundOn: boolean;
  onComplete: (r: { correct: boolean; xpEarned: number }) => void;
}

export function GameRound({ scenario, combo, soundOn, onComplete }: GameRoundProps) {
  const round = useGameRound(scenario, combo);
  const reducedMotion = useReducedMotion() ?? false;

  const handleCall = (call: Parameters<typeof round.decide>[0]) => {
    sfx.click(soundOn);
    round.decide(call);
    // decide() resolves synchronously into state on next render; recompute here for feedback:
    const correct = call === scenario.truth.correctCall;
    if (correct) {
      sfx.win(soundOn);
      vibrate(30);
      fireConfetti({ reducedMotion });
    } else {
      sfx.lose(soundOn);
      vibrate([60, 40, 60]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {round.phase === 'deciding' ? (
        <>
          <ReadoutCard scenario={scenario} />
          <DecisionButtons onCall={handleCall} />
        </>
      ) : (
        <RevealPanel
          scenario={scenario}
          call={round.call!}
          correct={round.correct!}
          xpEarned={round.xpEarned}
          crit={round.crit}
          onNext={() => onComplete({ correct: round.correct!, xpEarned: round.xpEarned })}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` → all PASS. Also `npm run build` → succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useGameRound.ts src/hooks/useGameRound.test.tsx src/components/significant
git commit -m "feat: playable round loop with reveal, combo, crit xp, and juice"
```

---

### Task 10: Campaign — level path, play page, IQ card

**Files:**
- Create: `src/hooks/useCampaign.ts`, `src/components/significant/LevelPath.tsx`, `src/components/significant/IQCard.tsx`, `src/app/significant/page.tsx`, `src/app/significant/play/page.tsx`
- Test: `src/hooks/useCampaign.test.ts`

**Interfaces:**
- Consumes: `CAMPAIGN_LEVELS`, `campaignSeed`, `generateScenario` (Task 5); progress store (Task 6); `GameRound` (Task 9); juice (Task 7).
- Produces:
  - Pure helper `levelStatuses(state: SignificantState): { id: number; archetype: ArchetypeId; stars: 0 | 1 | 3; status: 'locked' | 'open' | 'done' }[]` — level N is `open` when every level < N has `correct === true`; `done` when its own `correct === true`.
  - `useCampaign(): { levels: ReturnType<typeof levelStatuses>; state: SignificantState; totalStars: number; allDone: boolean; completeLevel(id: number, correct: boolean, xp: number): void; toggleSound(): void }` — on first mount, if `!state.warmupDone`, runs the endowed-progress grant: `completeWarmup` + `addXp(state, 50)` + save.
  - `IQ_TITLES: [number, string][]` = `[[0,'Coin Flipper'],[4,'Dashboard Watcher'],[7,'Growth PM'],[9,'Decision Scientist'],[10,"p-Hacker's Nightmare"]]` — title = last entry whose threshold ≤ correct count.
  - `/significant` page: warm-up banner ("Baseline calibrated ✓ +50 XP"), XP counter, `LevelPath`, link card to Daily, sound toggle, About link.
  - `/significant/play?level=N` page: renders the level's `GameRound`; on complete, records result + XP, then routes back to `/significant` (or shows `IQCard` when all 10 done).

- [ ] **Step 1: Write failing tests for status + titles**

Create `src/hooks/useCampaign.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { defaultState, recordCampaignResult } from '@/lib/progress';
import { iqTitle, levelStatuses } from '@/hooks/useCampaign';

describe('levelStatuses', () => {
  it('only level 1 is open initially', () => {
    const levels = levelStatuses(defaultState());
    expect(levels[0].status).toBe('open');
    expect(levels[1].status).toBe('locked');
  });
  it('passing level 1 opens level 2; failing does not', () => {
    const passed = recordCampaignResult(defaultState(), 1, true);
    expect(levelStatuses(passed)[1].status).toBe('open');
    const failed = recordCampaignResult(defaultState(), 1, false);
    expect(levelStatuses(failed)[1].status).toBe('locked');
    expect(levelStatuses(failed)[0].status).toBe('open'); // retryable
  });
});

describe('iqTitle', () => {
  it('maps correct counts to titles', () => {
    expect(iqTitle(0)).toBe('Coin Flipper');
    expect(iqTitle(8)).toBe('Growth PM');
    expect(iqTitle(10)).toBe("p-Hacker's Nightmare");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test` → FAIL: cannot resolve `@/hooks/useCampaign`.

- [ ] **Step 3: Implement hook + helpers**

Create `src/hooks/useCampaign.ts`:
```ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { CAMPAIGN_LEVELS } from '@/lib/engine/scenario';
import type { ArchetypeId } from '@/lib/engine/types';
import {
  addXp, completeWarmup, loadState, recordCampaignResult, saveState,
  type SignificantState,
} from '@/lib/progress';

export interface LevelStatus {
  id: number;
  archetype: ArchetypeId;
  stars: 0 | 1 | 3;
  status: 'locked' | 'open' | 'done';
}

export function levelStatuses(state: SignificantState): LevelStatus[] {
  return CAMPAIGN_LEVELS.map((lvl) => {
    const result = state.campaign[lvl.id];
    const prevAllPassed = CAMPAIGN_LEVELS
      .filter((p) => p.id < lvl.id)
      .every((p) => state.campaign[p.id]?.correct);
    const status: LevelStatus['status'] = result?.correct ? 'done' : prevAllPassed ? 'open' : 'locked';
    return { id: lvl.id, archetype: lvl.archetype, stars: result?.stars ?? 0, status };
  });
}

const IQ_TITLES: [number, string][] = [
  [0, 'Coin Flipper'], [4, 'Dashboard Watcher'], [7, 'Growth PM'],
  [9, 'Decision Scientist'], [10, "p-Hacker's Nightmare"],
];

export const iqTitle = (correctCount: number): string =>
  IQ_TITLES.filter(([min]) => correctCount >= min).at(-1)![1];

export function useCampaign() {
  const [state, setState] = useState<SignificantState | null>(null);

  useEffect(() => {
    let s = loadState();
    if (!s.warmupDone) {
      s = addXp(completeWarmup(s), 50); // endowed progress: path starts non-empty
      saveState(s);
    }
    setState(s);
  }, []);

  const mutate = useCallback((fn: (s: SignificantState) => SignificantState) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);

  const completeLevel = useCallback(
    (id: number, correct: boolean, xp: number) =>
      mutate((s) => addXp(recordCampaignResult(s, id, correct), xp)),
    [mutate],
  );

  const toggleSound = useCallback(
    () => mutate((s) => ({ ...s, soundOn: !s.soundOn })),
    [mutate],
  );

  const levels = state ? levelStatuses(state) : [];
  return {
    ready: state !== null,
    state: state ?? null,
    levels,
    totalStars: levels.reduce((sum, l) => sum + l.stars, 0),
    allDone: levels.length > 0 && levels.every((l) => l.status === 'done'),
    completeLevel,
    toggleSound,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` → useCampaign tests PASS.

- [ ] **Step 5: Build LevelPath, IQCard, and the two pages**

Create `src/components/significant/LevelPath.tsx`:
```tsx
'use client';

import Link from 'next/link';
import type { LevelStatus } from '@/hooks/useCampaign';

const Star = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 20 20" className={`h-4 w-4 ${filled ? 'fill-gold' : 'fill-ink/15'}`} aria-hidden>
    <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.8l-5.3 2.8 1-5.8L1.5 7.7l5.9-.9z" />
  </svg>
);

export function LevelPath({ levels }: { levels: LevelStatus[] }) {
  return (
    <ol className="relative mx-auto flex w-full max-w-xs flex-col gap-6 py-4">
      {levels.map((lvl, i) => {
        const offset = i % 2 === 0 ? '-translate-x-10' : 'translate-x-10';
        const node = (
          <div
            className={`flex h-20 w-20 flex-col items-center justify-center rounded-full font-extrabold text-white shadow-lg transition-transform
              ${lvl.status === 'done' ? 'bg-win' : lvl.status === 'open' ? 'animate-pulse bg-brand' : 'bg-ink/20'}`}
          >
            <span className="text-xl">{lvl.id}</span>
            <span className="flex" aria-label={`${lvl.stars} stars`}>
              <Star filled={lvl.stars >= 1} /><Star filled={lvl.stars >= 3} /><Star filled={lvl.stars >= 3} />
            </span>
          </div>
        );
        return (
          <li key={lvl.id} className={`flex justify-center ${offset}`}>
            {lvl.status === 'locked' ? (
              <div aria-label={`Level ${lvl.id} locked`}>{node}</div>
            ) : (
              <Link href={`/significant/play?level=${lvl.id}`} aria-label={`Play level ${lvl.id}`} className="active:scale-95">
                {node}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
```

Create `src/components/significant/IQCard.tsx`:
```tsx
'use client';

import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { iqTitle, type LevelStatus } from '@/hooks/useCampaign';
import { fireConfetti } from '@/components/juice/confetti';
import { PressButton } from '@/components/juice/PressButton';

export function IQCard({ levels, xp }: { levels: LevelStatus[]; xp: number }) {
  // Gating means finishing implies all levels passed eventually — so the score
  // that differentiates players is FIRST-TRY correct calls (3-star levels).
  const firstTry = levels.filter((l) => l.stars === 3).length;
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    fireConfetti({ big: true, reducedMotion });
  }, [reducedMotion]);

  const shareText = `Significant — Experimentation IQ: ${iqTitle(firstTry)} (${firstTry}/10 first try, ${xp} XP)\nCan you beat the traps? ${typeof window !== 'undefined' ? window.location.origin : ''}/significant`;

  return (
    <section className="rounded-[var(--radius-card)] bg-brand p-6 text-center text-white shadow-xl">
      <p className="text-sm font-extrabold uppercase tracking-wide opacity-80">Experimentation IQ</p>
      <h2 className="mt-2 text-3xl font-extrabold">{iqTitle(firstTry)}</h2>
      <p className="mt-1 text-lg">{firstTry}/10 on the first try · {xp} XP</p>
      <div className="mt-4 flex justify-center gap-2">
        {levels.map((l) => (
          <span key={l.id} className={`h-3 w-3 rounded-full ${l.stars === 3 ? 'bg-gold' : l.stars > 0 ? 'bg-white' : 'bg-white/30'}`} aria-hidden />
        ))}
      </div>
      <PressButton
        color="sky"
        className="mt-5 w-full bg-white !text-ink shadow-[0_4px_0_rgba(0,0,0,0.25)]"
        onClick={() => navigator.clipboard?.writeText(shareText).catch(() => {})}
      >
        Copy result to share
      </PressButton>
    </section>
  );
}
```

Create `src/app/significant/page.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { useCampaign } from '@/hooks/useCampaign';
import { LevelPath } from '@/components/significant/LevelPath';
import { IQCard } from '@/components/significant/IQCard';
import { CountUp } from '@/components/juice/CountUp';

export default function SignificantHome() {
  const { ready, state, levels, totalStars, allDone, toggleSound } = useCampaign();
  if (!ready || !state) return <main className="mx-auto max-w-md p-6" aria-busy="true" />;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-deep">Significant</h1>
          <p className="text-sm text-ink-soft">Ship, kill, or keep running?</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold"><CountUp value={state.xp} /> XP</p>
          <button type="button" onClick={toggleSound} className="text-sm font-extrabold text-ink-soft underline">
            Sound {state.soundOn ? 'on' : 'off'}
          </button>
        </div>
      </header>

      <p className="rounded-2xl bg-win/15 px-4 py-2 text-sm font-extrabold text-win-deep">
        Baseline calibrated ✓ +50 XP — {totalStars} star{totalStars === 1 ? '' : 's'} collected
      </p>

      {allDone && <IQCard levels={levels} xp={state.xp} />}
      <LevelPath levels={levels} />

      <Link href="/significant/daily" className="rounded-[var(--radius-card)] bg-gold p-4 text-center font-extrabold text-white shadow-lg active:scale-95">
        Daily experiment {state.dailyStreak > 0 ? `· streak ${state.dailyStreak}` : ''}
      </Link>
      <Link href="/significant/about" className="text-center text-sm font-extrabold text-ink-soft underline">
        How this game was designed
      </Link>
    </main>
  );
}
```

Create `src/app/significant/play/page.tsx`:
```tsx
'use client';

import { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CAMPAIGN_LEVELS, campaignSeed, generateScenario } from '@/lib/engine/scenario';
import { useCampaign } from '@/hooks/useCampaign';
import { GameRound } from '@/components/significant/GameRound';
import { ComboFlame } from '@/components/significant/ComboFlame';

function PlayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const levelId = Number(params.get('level') ?? '1');
  const { ready, state, completeLevel } = useCampaign();

  const scenario = useMemo(() => {
    const level = CAMPAIGN_LEVELS.find((l) => l.id === levelId) ?? CAMPAIGN_LEVELS[0];
    const attempts = state?.campaign[level.id]?.attempts ?? 0;
    return generateScenario(campaignSeed(level.id, attempts + 1), level.archetype);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- regenerate only per page load, not per state change
  }, [levelId, ready]);

  if (!ready || !state) return <main className="mx-auto max-w-md p-6" aria-busy="true" />;

  const combo = 1 + Object.values(state.campaign).filter((r) => r.correct).length % 3;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="font-extrabold text-brand-deep">Level {levelId}</h1>
        <ComboFlame combo={combo} />
      </header>
      <GameRound
        scenario={scenario}
        combo={combo}
        soundOn={state.soundOn}
        onComplete={({ correct, xpEarned }) => {
          completeLevel(levelId, correct, xpEarned);
          router.push('/significant');
        }}
      />
    </main>
  );
}

export default function PlayPage() {
  return (
    <Suspense>
      <PlayInner />
    </Suspense>
  );
}
```

- [ ] **Step 6: Verify in browser + commit**

Run `npm run dev`, play through levels on a 375px viewport: locked levels unclickable, stars appear, warm-up banner shows, finishing all 10 shows the IQ card with big confetti. Run `npm test` and `npm run build`.

```bash
git add src/hooks/useCampaign.ts src/hooks/useCampaign.test.ts src/components/significant src/app/significant
git commit -m "feat: campaign level path, play flow, and experimentation iq card"
```

---

### Task 11: Daily mode — streaks, countdown, share grid

**Files:**
- Create: `src/hooks/useDaily.ts`, `src/components/significant/ShareGrid.tsx`, `src/app/significant/daily/page.tsx`
- Test: `src/hooks/useDaily.test.ts`

**Interfaces:**
- Consumes: `dailySeed`, `dailyArchetype`, `dayNumber` (Task 5); `generateScenario` (Task 5); progress store (Task 6); `GameRound` (Task 9).
- Produces:
  - Pure: `localToday(now: Date): string` (local `YYYY-MM-DD`); `buildShareText(date: string, correct: boolean, streak: number, origin: string): string` → exactly `` `Significant #${dayNumber(date)} ${correct ? '🟢' : '🔴'} 🔥${streak}\n${origin}/significant/daily` ``; `msToLocalMidnight(now: Date): number`
  - `useDaily(): { ready: boolean; today: string; scenario: Scenario; playedToday: boolean; lastCorrect: boolean | null; streak: number; shields: number; soundOn: boolean; complete(correct: boolean, xp: number): void; countdown: string }` — countdown ticks every second as `HH:MM:SS`.
  - `<ShareGrid text={string} />` — copies to clipboard on tap, shows "Copied!" for 2s; if clipboard API missing, renders the text in a read-only `<textarea>` instead.

- [ ] **Step 1: Write failing tests for the pure helpers**

Create `src/hooks/useDaily.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { buildShareText, localToday, msToLocalMidnight } from '@/hooks/useDaily';
import { dayNumber } from '@/lib/engine/daily';

describe('daily helpers', () => {
  it('localToday formats local date as YYYY-MM-DD', () => {
    expect(localToday(new Date(2026, 7, 9, 23, 59))).toBe('2026-08-09');
    expect(localToday(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01');
  });
  it('buildShareText matches the exact grid format', () => {
    const n = dayNumber('2026-08-09');
    expect(buildShareText('2026-08-09', true, 6, 'https://lab.test')).toBe(
      `Significant #${n} 🟢 🔥6\nhttps://lab.test/significant/daily`,
    );
  });
  it('msToLocalMidnight is positive and under 24h', () => {
    const ms = msToLocalMidnight(new Date(2026, 7, 9, 18, 30));
    expect(ms).toBe(5.5 * 3600 * 1000);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test` → FAIL: cannot resolve `@/hooks/useDaily`.

- [ ] **Step 3: Implement**

Create `src/hooks/useDaily.ts`:
```ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { dailyArchetype, dailySeed, dayNumber } from '@/lib/engine/daily';
import { generateScenario } from '@/lib/engine/scenario';
import { addXp, loadState, recordDaily, saveState, type SignificantState } from '@/lib/progress';

export function localToday(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const buildShareText = (date: string, correct: boolean, streak: number, origin: string): string =>
  `Significant #${dayNumber(date)} ${correct ? '🟢' : '🔴'} 🔥${streak}\n${origin}/significant/daily`;

export function msToLocalMidnight(now: Date): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return midnight.getTime() - now.getTime();
}

const fmt = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

export function useDaily() {
  const [state, setState] = useState<SignificantState | null>(null);
  const [countdown, setCountdown] = useState('--:--:--');
  const today = useMemo(() => localToday(new Date()), []);

  useEffect(() => {
    setState(loadState());
    const tick = () => setCountdown(fmt(msToLocalMidnight(new Date())));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const scenario = useMemo(
    () => generateScenario(dailySeed(today), dailyArchetype(today)),
    [today],
  );

  const complete = useCallback(
    (correct: boolean, xp: number) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = addXp(recordDaily(prev, today, correct), xp);
        saveState(next);
        return next;
      });
    },
    [today],
  );

  return {
    ready: state !== null,
    today,
    scenario,
    playedToday: state?.lastDailyDate === today,
    lastCorrect: state?.lastDailyCorrect ?? null,
    streak: state?.dailyStreak ?? 0,
    shields: state?.shields ?? 0,
    soundOn: state?.soundOn ?? true,
    complete,
    countdown,
  };
}
```

Create `src/components/significant/ShareGrid.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { PressButton } from '@/components/juice/PressButton';

export function ShareGrid({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard;

  if (!canCopy) {
    return <textarea readOnly value={text} className="w-full rounded-2xl bg-surface p-3 text-sm" rows={2} aria-label="Share text" />;
  }
  return (
    <PressButton
      color="brand"
      className="w-full"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
      }}
    >
      {copied ? 'Copied!' : 'Share result'}
    </PressButton>
  );
}
```

Create `src/app/significant/daily/page.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { dayNumber } from '@/lib/engine/daily';
import { buildShareText, useDaily } from '@/hooks/useDaily';
import { GameRound } from '@/components/significant/GameRound';
import { ShareGrid } from '@/components/significant/ShareGrid';

export default function DailyPage() {
  const daily = useDaily();
  if (!daily.ready) return <main className="mx-auto max-w-md p-6" aria-busy="true" />;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="font-extrabold text-brand-deep">Daily #{dayNumber(daily.today)}</h1>
        <p className="font-extrabold text-gold" aria-label={`Streak ${daily.streak}`}>
          🔥 {daily.streak}{daily.shields > 0 ? ` · 🛡 ${daily.shields}` : ''}
        </p>
      </header>

      {daily.playedToday ? (
        <section className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-6 text-center shadow-lg">
          <p className="text-lg font-extrabold">
            {daily.lastCorrect ? 'Nailed it. See you tomorrow.' : 'Missed it — tomorrow is a new experiment.'}
          </p>
          <p className="text-sm text-ink-soft">Next experiment in <span className="font-extrabold text-ink">{daily.countdown}</span></p>
          <ShareGrid text={buildShareText(daily.today, daily.lastCorrect ?? false, daily.streak, origin)} />
          <Link href="/significant" className="text-sm font-extrabold text-ink-soft underline">Back to campaign</Link>
        </section>
      ) : (
        <GameRound
          scenario={daily.scenario}
          combo={1}
          soundOn={daily.soundOn}
          onComplete={({ correct, xpEarned }) => daily.complete(correct, xpEarned)}
        />
      )}
    </main>
  );
}
```

- [ ] **Step 4: Run tests + verify in browser**

Run: `npm test` → PASS. In the dev server: play the daily, confirm the played state persists on reload, streak shows, countdown ticks, share copies the exact grid text.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useDaily.ts src/hooks/useDaily.test.ts src/components/significant/ShareGrid.tsx src/app/significant/daily
git commit -m "feat: daily mode with streaks, shields, countdown, and share grid"
```

---

### Task 12: Lab home page + About writeup

**Files:**
- Create: `src/components/lab/GameCard.tsx`, `src/app/significant/about/page.tsx`
- Modify: `src/app/page.tsx` (replace scaffold home)

**Interfaces:**
- Consumes: design tokens (Task 1).
- Produces: `/` (Lab home) and `/significant/about`. No exports consumed by later tasks.

- [ ] **Step 1: GameCard + home**

Create `src/components/lab/GameCard.tsx`:
```tsx
import Link from 'next/link';

interface GameCardProps {
  href: string;
  title: string;
  tagline: string;
  accent: string; // tailwind bg class, e.g. 'bg-brand'
}

export function GameCard({ href, title, tagline, accent }: GameCardProps) {
  return (
    <Link href={href} className={`block rounded-[var(--radius-card)] ${accent} p-6 text-white shadow-lg transition-transform active:scale-95`}>
      <h2 className="text-xl font-extrabold">{title}</h2>
      <p className="mt-1 text-sm opacity-90">{tagline}</p>
      <p className="mt-4 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-extrabold">Play →</p>
    </Link>
  );
}
```

Replace `src/app/page.tsx`:
```tsx
import { GameCard } from '@/components/lab/GameCard';

export default function LabHome() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <header className="pt-8">
        <h1 className="text-3xl font-extrabold">Alvin&apos;s Lab</h1>
        <p className="mt-2 text-ink-soft">
          Small games about product craft — built with AI, designed like real products.
        </p>
      </header>
      <GameCard
        href="/significant"
        title="Significant"
        tagline="Would you ship it? An A/B-testing intuition game where the data knows the truth."
        accent="bg-brand"
      />
      <p className="text-center text-sm text-ink-soft">More experiments brewing.</p>
    </main>
  );
}
```

- [ ] **Step 2: About page with the full PM writeup**

Create `src/app/significant/about/page.tsx` with exactly this copy (server component, prose layout):
```tsx
import Link from 'next/link';

export const metadata = { title: 'How Significant was designed' };

export default function AboutPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 p-6 leading-relaxed">
      <h1 className="pt-4 text-2xl font-extrabold text-brand-deep">How Significant was designed</h1>

      <h2 className="text-lg font-extrabold">Why this game exists</h2>
      <p>
        The single hardest judgment call in product work is deciding what an experiment actually told you.
        Most A/B test mistakes aren&apos;t math errors — they&apos;re judgment errors: peeking early, trusting a
        huge lift on a tiny sample, ignoring a broken traffic split. Significant turns those failure modes
        into a game. Every readout is simulated from a hidden ground truth, so unlike real life, the game
        can tell you whether you were <em>actually</em> right.
      </p>

      <h2 className="text-lg font-extrabold">Key trade-offs</h2>
      <p>
        <strong>Generated, not hand-written.</strong> Scenarios come from 10 hand-designed trap archetypes with
        seeded random parameters — curated quality with infinite replay. <strong>Honest scenarios included.</strong>
        Two of the ten archetypes are clean wins and losses; if everything were a trap, the winning strategy
        would be reflexive cynicism instead of judgment. <strong>Zero backend.</strong> Everything — the statistics
        engine, streaks, progress — runs in your browser. No accounts, no data collected.
      </p>

      <h2 className="text-lg font-extrabold">The engagement system (and its limits)</h2>
      <p>
        This game deliberately uses the retention psychology playbook: loss-aversion streaks with an earnable
        Streak Shield (Duolingo&apos;s Streak Freeze pattern), variable rewards (critical-insight rounds), endowed
        progress (your path starts pre-calibrated), amplified feedback on every action, and a daily puzzle with
        a shareable result. It also draws a line: no fake scarcity, no guilt copy, no notifications, sound and
        motion respect your preferences, and nothing you do here is tracked to you. If you enjoyed the game,
        that was the design working — and now you know exactly which levers made it work.
      </p>

      <h2 className="text-lg font-extrabold">How it was built</h2>
      <p>
        Next.js + TypeScript on Vercel, built in collaboration with AI coding agents. The statistics are real:
        binomial simulation per arm per day, two-proportion z-tests, and an invariant test suite that verifies
        every archetype behaves like its trap across hundreds of seeds.
      </p>

      <Link href="/significant" className="pb-8 text-center font-extrabold text-brand-deep underline">
        Back to the game
      </Link>
    </main>
  );
}
```

- [ ] **Step 3: Verify + commit**

Run: `npm run build` → succeeds; check both pages at 375px width.

```bash
git add src/app/page.tsx src/app/significant/about src/components/lab
git commit -m "feat: lab home page and significant design writeup"
```

---

### Task 13: Analytics events + accessibility pass

**Files:**
- Create: `src/lib/analytics.ts`
- Modify: `src/components/significant/GameRound.tsx`, `src/app/significant/play/page.tsx`, `src/app/significant/daily/page.tsx`, `src/app/significant/page.tsx`, `src/components/significant/ShareGrid.tsx`, `src/components/significant/IQCard.tsx`

**Interfaces:**
- Produces: `track(name: string, props?: Record<string, string | number | boolean>): void` — wraps `@vercel/analytics` `track`, never throws.

- [ ] **Step 1: Implement the wrapper**

Create `src/lib/analytics.ts`:
```ts
import { track as vercelTrack } from '@vercel/analytics';

export function track(name: string, props?: Record<string, string | number | boolean>): void {
  try {
    vercelTrack(name, props);
  } catch {
    /* analytics must never break the game */
  }
}
```

- [ ] **Step 2: Add the event calls**

Exact call sites (import `track` in each file):
- `GameRound.handleCall`: `track('round_complete', { archetype: scenario.archetype, correct, mode: window.location.pathname.includes('daily') ? 'daily' : 'campaign' })`
- `play/page.tsx` in a `useEffect` on mount: `track('game_start', { mode: 'campaign', level: levelId })`
- `daily/page.tsx` in a `useEffect` on mount when `!playedToday`: `track('game_start', { mode: 'daily' })`; in `onComplete`: `track('daily_played', { correct })` and when the new streak exceeds the old: `track('streak_extended', { streak })`
- `significant/page.tsx` when `allDone` first renders the IQCard: `track('campaign_complete', { stars: totalStars })`
- `ShareGrid` + `IQCard` copy handlers: `track('share_clicked', {})`
- `significant/page.tsx` `toggleSound`: `track('sound_toggled', { on: !state.soundOn })`

- [ ] **Step 3: Accessibility sweep**

Verify and fix in one pass:
- Every icon-only or emoji element has `aria-label` or `aria-hidden` (streak flame, stars, combo badge — already specced; confirm).
- Decision buttons and level nodes reachable and operable by keyboard (Tab + Enter); focus rings visible on `.btn-3d` (add `focus-visible:outline-4 focus-visible:outline-brand/50` to the base class in `globals.css`).
- Reveal XP line uses `aria-live="polite"` (already specced; confirm).
- Run Chrome DevTools Lighthouse a11y audit on `/significant` → score ≥ 95; fix anything it flags.

- [ ] **Step 4: Test + commit**

Run: `npm test && npm run build` → PASS.

```bash
git add -A
git commit -m "feat: analytics events and accessibility pass"
```

---

### Task 14: Deploy to Vercel + release QA

**Files:**
- Create: `README.md`
- No code changes expected; fixes found in QA get their own commits.

- [ ] **Step 1: README**

Create `README.md`:
```markdown
# Alvin's Lab

Small games about product craft, built with AI. First game: **Significant** —
an A/B-testing intuition game where every readout is simulated from a hidden
ground truth.

- Stack: Next.js (App Router), TypeScript, Tailwind, Vitest. Zero backend.
- Run: `npm install && npm run dev`
- Test: `npm test`

Design docs live in `docs/superpowers/specs/`.
```

- [ ] **Step 2: Push to GitHub and deploy**

```bash
git add README.md && git commit -m "docs: readme"
gh repo create pm-lab --public --source=. --push
npm i -g vercel@latest   # CLI 54.x is outdated
vercel link --yes
vercel --prod
```
Expected: production URL responds; `/`, `/significant`, `/significant/play?level=1`, `/significant/daily`, `/significant/about` all render.

- [ ] **Step 3: Release QA checklist (on the production URL)**

- iPhone Safari + Android Chrome at real device or 375px emulation: play campaign level 1 and the daily end-to-end.
- Private/incognito mode: game playable, no crashes with storage blocked.
- Sound toggle persists across reloads; mute actually silences all sfx.
- OS-level reduce-motion: no confetti, no pulse animations.
- Animations smooth on a mid-range Android (Chrome DevTools 4x CPU throttle — no dropped-frame jank on reveal).
- Daily streak: play, change device date +1 day, play again → streak 2. (Then reset.)
- Share button produces the exact grid text on both platforms.
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95.

- [ ] **Step 4: Final commit + tag**

```bash
git add -A && git commit -m "chore: qa fixes" --allow-empty
git tag v1.0.0 && git push --tags
```
