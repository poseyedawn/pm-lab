import { ArrowBendUpRight } from '@phosphor-icons/react';
import { Sparkline } from '@/components/significant/Sparkline';
import type { Scenario } from '@/lib/engine/types';

interface CalibrationEvidenceProps {
  scenario: Scenario;
  prompt: string;
  stepNumber: number;
  totalSteps: number;
  coaching: boolean;
  revealed: boolean;
}

const percent = (value: number): string => `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;

export function CalibrationEvidence({
  scenario,
  prompt,
  stepNumber,
  totalSteps,
  coaching,
  revealed,
}: CalibrationEvidenceProps) {
  const variantUsers = scenario.totals.nB.toLocaleString();
  const controlUsers = scenario.totals.nA.toLocaleString();

  return (
    <>
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral-deep">
        Round {stepNumber} of {totalSteps} · Calibration
      </p>
      <h1 className="calibration-title mt-3 text-2xl font-extrabold leading-7 text-ink">
        {prompt}
      </h1>

      {coaching && (
        <div className="calibration-coach mt-3">
          <div className="flex items-center gap-4" aria-label={`Calibration step ${stepNumber} of ${totalSteps}`}>
            <p className="shrink-0 text-sm font-extrabold text-coral-deep">
              Calibration <span className="text-ink-soft">· {stepNumber} of {totalSteps}</span>
            </p>
            <div className="flex flex-1 items-center" aria-hidden>
              {Array.from({ length: totalSteps }, (_, index) => (
                <span key={index} className="contents">
                  {index > 0 && <span className="h-px flex-1 bg-ink/20" />}
                  <span className={`h-3 w-3 rounded-full ${index < stepNumber ? 'bg-coral' : 'border-2 border-ink/25 bg-surface'}`} />
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 text-sm leading-5 text-ink-soft">
            <strong className="text-win-text">Ship</strong> when the evidence supports release.{' '}
            <strong className="text-lose-deep">Kill</strong> when it supports stopping this version.{' '}
            <strong className="text-ink">Keep Running</strong> when more valid evidence can change the call.
          </p>
        </div>
      )}

      <div className="calibration-divider mt-5 border-t border-dashed pt-3">
        <p className="text-[0.6875rem] font-extrabold uppercase tracking-wide text-coral-deep">Hypothesis</p>
        <h2 className="calibration-hypothesis mt-1 text-base font-extrabold leading-5 text-ink">
          {scenario.hypothesis}
        </h2>
      </div>

      <article
        className="calibration-evidence mt-3"
        data-seed={scenario.seed}
        aria-describedby="calibration-chart-summary"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-extrabold text-ink">{scenario.metricName}</p>
          <p className="rounded-full bg-bg px-3 py-1 text-xs font-extrabold text-ink">
            Day {scenario.daysRun} of {scenario.daysPlanned}
          </p>
        </div>

        <div className="calibration-chart">
          <Sparkline metricName={scenario.metricName} control={scenario.control} variant={scenario.variant} />
        </div>
        <div className="mt-1 flex gap-4 text-xs text-ink-soft" aria-hidden>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand" />Variant</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ink-soft" />Control</span>
        </div>

        <div className="calibration-stats mt-2 grid grid-cols-[48%_52%] border-t border-dashed border-ink/15 pt-3">
          <div className="border-r border-dashed border-ink/15 pr-3">
            <p className="text-[0.625rem] font-extrabold uppercase tracking-wide text-ink-soft">Observed lift</p>
            <p className="mt-1 text-3xl font-extrabold leading-8 text-win-deep">
              {percent(scenario.observed.relLift)}
            </p>
            <p className="calibration-sample mt-2 text-xs leading-4 text-ink-soft">
              {variantUsers} variant vs {controlUsers} control users
            </p>
          </div>
          <div
            id="calibration-confidence"
            aria-describedby={coaching ? 'calibration-coaching-note' : undefined}
            className={`ml-3 rounded-xl px-1 transition-colors ${revealed ? 'bg-win/15 ring-2 ring-win-deep/40' : ''}`}
          >
            <p className="text-[0.625rem] font-extrabold uppercase tracking-wide text-ink-soft">95% confidence interval</p>
            <p className="mt-1 text-base font-extrabold leading-5 text-brand-deep">
              {percent(scenario.observed.ciLow)} to {percent(scenario.observed.ciHigh)}
            </p>
          </div>
        </div>

        <p className="sr-only" id="calibration-chart-summary">
          Variant and control {scenario.metricName.toLowerCase()} are shown across {scenario.daysRun} days. The observed lift is{' '}
          {percent(scenario.observed.relLift)}, with a 95% confidence interval from{' '}
          {percent(scenario.observed.ciLow)} to {percent(scenario.observed.ciHigh)}.
        </p>
      </article>

      {coaching && (
        <aside
          id="calibration-coaching-note"
          className="calibration-note mt-2 flex items-start gap-4 px-2 font-hand text-base leading-5 text-ink-soft"
        >
          <p className="max-w-[10rem]">
            {revealed
              ? 'The whole range stays above zero. That is the decisive signal.'
              : 'The confidence interval is the range of likely lift. Look for whether the whole range clears zero.'}
          </p>
          <ArrowBendUpRight className="mt-1 shrink-0 -rotate-6" size={34} aria-hidden />
        </aside>
      )}
    </>
  );
}
