'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowBendDownLeft,
  ArrowBendDownRight,
  ArrowRight,
  ChartBar,
  Check,
  Clock,
  Minus,
  Pause,
  User,
} from '@phosphor-icons/react';
import { Sparkline } from '@/components/significant/Sparkline';
import { useLabLanding } from '@/hooks/lab/useLabLanding';
import { labLandingHref } from '@/lib/labLanding';
import type { Call, Scenario } from '@/lib/engine/types';
import { track } from '@/services/analyticsService';

interface LabLandingProps {
  scenario: Scenario;
}

const CALLS = [
  { id: 'ship', label: 'Ship', detail: 'Launch it to everyone', icon: Check, color: 'border-win-deep text-win-text', iconColor: 'bg-win-deep' },
  { id: 'kill', label: 'Kill', detail: 'Not enough evidence', icon: Minus, color: 'border-lose-deep text-lose-deep', iconColor: 'bg-lose-deep' },
  { id: 'keep', label: 'Keep Running', detail: 'More data could change it', icon: Pause, color: 'border-ink/70 text-ink', iconColor: 'bg-ink/80' },
] satisfies Array<{
  id: Call;
  label: string;
  detail: string;
  icon: typeof Check;
  color: string;
  iconColor: string;
}>;

const percent = (value: number): string => `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;

export function LabLanding({ scenario }: LabLandingProps) {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const { ready, totalXp, completedCases, isReturning, nextLevel } = useLabLanding();
  const progress = { completedCases, isReturning, nextLevel };
  const href = labLandingHref(progress, selectedCall);
  const totalUsers = scenario.totals.nA + scenario.totals.nB;
  const showFirstCall = !ready || !isReturning;

  const handleStart = () => {
    track('game_selected', { gameId: 'significant', placement: 'lab_primary' });
  };

  return (
    <section className="lab-landing px-5 pb-8 pt-5 min-[360px]:px-7">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-deep">
        Significant · Field test 01
      </p>
      <h1 className="lab-landing-title mt-3 text-[1.75rem] font-extrabold leading-8 text-ink min-[360px]:text-[2rem]">
        Can you spot the signal before it ships?
      </h1>
      <p className="lab-landing-promise mt-2 text-base leading-5 text-ink-soft">
        Look at the data. Find the truth.<br />Make a call. See how you do.
      </p>

      <div className="relative">
        <article className="lab-landing-evidence mt-3 rounded-[var(--radius-card)] bg-surface p-4 shadow-lg shadow-ink/10 min-[360px]:mr-14">
          <p className="landing-evidence-label text-xs font-extrabold uppercase tracking-wide text-ink-soft">Hypothesis</p>
          <h2 className="landing-evidence-hypothesis mt-2 text-sm font-extrabold leading-5 text-ink">{scenario.hypothesis}</h2>

          <div className="landing-evidence-stats mt-3 grid grid-cols-[42%_58%] border-t border-dashed border-ink/20 pt-3">
            <div className="border-r border-dashed border-ink/20 pr-3">
              <p className="text-[0.625rem] font-extrabold uppercase tracking-wide text-ink-soft">Observed lift</p>
              <p className="mt-1 text-3xl font-extrabold leading-8 text-brand-deep">{percent(scenario.observed.relLift)}</p>
            </div>
            <div className="pl-3">
              <p className="text-[0.625rem] font-extrabold uppercase tracking-wide text-ink-soft">95% confidence interval</p>
              <p className="mt-1 text-sm font-extrabold leading-4 text-brand-deep">
                {percent(scenario.observed.ciLow)} to {percent(scenario.observed.ciHigh)}
              </p>
            </div>
          </div>

          <div className="landing-evidence-legend mt-3 grid gap-1 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-2"><span className="h-1 w-4 rounded-full bg-brand" />Variant</span>
            <span className="inline-flex items-center gap-2"><span className="h-1 w-4 rounded-full bg-ink-soft" />Control</span>
          </div>

          <div className="landing-evidence-chart mt-2" aria-hidden>
            <Sparkline control={scenario.control} variant={scenario.variant} />
          </div>

          <p className="landing-evidence-footer mt-1 text-[0.8125rem] font-extrabold leading-4 text-ink">
            {totalUsers.toLocaleString()} users in test · {scenario.daysRun} days
          </p>
          <p className="landing-evidence-footer text-[0.6875rem] leading-4 text-ink-soft">{scenario.metricName} is the primary metric.</p>
        </article>

        <aside className="absolute -top-7 right-0 hidden w-16 text-center text-xl leading-5 text-ink-soft min-[360px]:block" aria-hidden>
          <p className="font-hand -rotate-2">One clue changes the call.</p>
          <ArrowBendDownLeft className="mx-auto mt-1 -rotate-12" size={32} weight="regular" />
        </aside>
      </div>

      {showFirstCall && (
        <fieldset className="lab-landing-decisions mt-3">
          <legend className="landing-decisions-legend mx-auto flex items-center justify-center gap-3 font-hand text-xl leading-6 text-ink-soft">
            <ArrowBendDownLeft size={24} aria-hidden />
            What&apos;s your call?
            <ArrowBendDownRight size={24} aria-hidden />
          </legend>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {CALLS.map(({ id, label, detail, icon: Icon, color, iconColor }) => {
              const selected = selectedCall === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedCall(id)}
                  className={`landing-decision-button min-h-[5.5rem] rounded-2xl border-2 bg-surface px-1 py-1 text-center transition-colors ${color} ${selected ? 'ring-4 ring-brand/20' : ''}`}
                >
                  <span className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-white ${iconColor}`}>
                    <Icon size={14} weight="bold" aria-hidden />
                  </span>
                  <span className="mt-1 block text-[0.8125rem] font-extrabold leading-4">{label}</span>
                  <span className="decision-detail mt-1 block text-xs leading-3 text-ink-soft">{detail}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <Link
        href={href}
        onClick={handleStart}
        className="lab-landing-primary mt-3 flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brand px-4 text-base font-extrabold text-white shadow-lg shadow-brand/25 transition-transform active:scale-[0.98]"
      >
        {ready && isReturning ? `Continue level ${nextLevel}` : 'Make your first call'}
        <ArrowRight size={20} weight="bold" aria-hidden />
      </Link>

      <div className="lab-landing-cues mt-1 flex items-center justify-center gap-2 text-xs text-ink-soft" aria-label="Real simulated data, 30 seconds, no signup">
        <span className="inline-flex items-center gap-1"><ChartBar size={18} aria-hidden />Real simulated data</span>
        <span className="h-4 border-l border-ink/20" aria-hidden />
        <span className="inline-flex items-center gap-1"><Clock size={18} aria-hidden />30 sec</span>
        <span className="h-4 border-l border-ink/20" aria-hidden />
        <span className="inline-flex items-center gap-1"><User size={18} aria-hidden />No signup</span>
      </div>

      {ready && isReturning && (
        <p className="mt-2 text-center text-xs text-ink-soft">
          {completedCases} of 10 cases complete · {totalXp} XP ·{' '}
          <Link href="/significant/calibration?replay=1" className="inline-flex min-h-11 items-center font-extrabold underline underline-offset-4">
            Restart calibration
          </Link>
        </p>
      )}

      <p className="lab-landing-signature mt-2 text-center font-hand text-lg text-ink-soft">
        Built to make product judgment visible. — Alvin
      </p>

      <div className="mt-10 border-t border-ink/10 pt-6">
        <p className="text-xs font-extrabold uppercase tracking-wide text-brand-deep">In the Lab</p>
        <Link href="/significant" className="mt-3 flex items-center justify-between border-b border-ink/10 py-3">
          <span>
            <span className="block font-extrabold">Significant</span>
            <span className="block text-sm text-ink-soft">A/B-testing judgment · 10 cases</span>
          </span>
          <span className="text-sm font-extrabold text-brand-deep">Play</span>
        </Link>
        <div className="flex items-center justify-between py-3">
          <span>
            <span className="block font-extrabold">Ship It</span>
            <span className="block text-sm text-ink-soft">Product trade-offs under pressure</span>
          </span>
          <span className="text-sm font-extrabold text-ink-soft">In progress</span>
        </div>
      </div>
    </section>
  );
}
