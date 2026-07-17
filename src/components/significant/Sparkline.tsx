import type { ArmDay } from '@/lib/engine/types';

interface SparklineProps {
  control: ArmDay[];
  variant: ArmDay[];
}

interface RatePoint {
  rate: number;
  low: number;
  high: number;
}

const confidencePoint = ({ c, n }: ArmDay): RatePoint => {
  const rate = c / n;
  const margin = 1.96 * Math.sqrt((rate * (1 - rate)) / n);
  return { rate, low: Math.max(0, rate - margin), high: Math.min(1, rate + margin) };
};

/** Dual-line daily conversion-rate chart with real binomial confidence bands. */
export function Sparkline({ control, variant }: SparklineProps) {
  const W = 300;
  const H = 104;
  const PAD_X = 8;
  const PAD_TOP = 8;
  const PLOT_BOTTOM = 84;
  const controlPoints = control.map(confidencePoint);
  const variantPoints = variant.map(confidencePoint);
  const bounds = [...controlPoints, ...variantPoints].flatMap(({ low, high }) => [low, high]);
  const min = Math.min(...bounds);
  const max = Math.max(...bounds);
  const x = (index: number, length: number) => PAD_X + (index * (W - 2 * PAD_X)) / Math.max(1, length - 1);
  const y = (rate: number) => PLOT_BOTTOM
    - ((rate - min) / Math.max(1e-9, max - min)) * (PLOT_BOTTOM - PAD_TOP);
  const linePath = (points: RatePoint[]) => points
    .map(({ rate }, index) => `${index === 0 ? 'M' : 'L'}${x(index, points.length).toFixed(1)},${y(rate).toFixed(1)}`)
    .join(' ');
  const bandPath = (points: RatePoint[]) => {
    const upper = points.map(({ high }, index) => `${index === 0 ? 'M' : 'L'}${x(index, points.length).toFixed(1)},${y(high).toFixed(1)}`);
    const lower = [...points].reverse().map(({ low }, reverseIndex) => {
      const index = points.length - 1 - reverseIndex;
      return `L${x(index, points.length).toFixed(1)},${y(low).toFixed(1)}`;
    });
    return [...upper, ...lower, 'Z'].join(' ');
  };
  const labelIndexes = [...new Set([0, Math.floor((variant.length - 1) / 2), variant.length - 1])];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Daily conversion rate, control vs variant">
      {[0.25, 0.5, 0.75].map((fraction) => (
        <line
          key={fraction}
          x1={PAD_X}
          x2={W - PAD_X}
          y1={PAD_TOP + (PLOT_BOTTOM - PAD_TOP) * fraction}
          y2={PAD_TOP + (PLOT_BOTTOM - PAD_TOP) * fraction}
          stroke="var(--color-ink-soft)"
          strokeDasharray="3 5"
          strokeOpacity="0.14"
        />
      ))}
      <path d={bandPath(controlPoints)} fill="var(--color-ink-soft)" fillOpacity="0.1" />
      <path d={bandPath(variantPoints)} fill="var(--color-brand)" fillOpacity="0.11" />
      <path d={linePath(controlPoints)} fill="none" stroke="var(--color-ink-soft)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={linePath(variantPoints)} fill="none" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {labelIndexes.map((index) => (
        <text
          key={index}
          x={x(index, variant.length)}
          y={100}
          fill="var(--color-ink-soft)"
          fontSize="9"
          textAnchor={index === 0 ? 'start' : index === variant.length - 1 ? 'end' : 'middle'}
        >
          Day {index + 1}
        </text>
      ))}
    </svg>
  );
}
