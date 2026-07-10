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
