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
