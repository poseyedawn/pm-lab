'use client';

import { Check, Clock, Pause, X } from '@phosphor-icons/react';
import type { Call } from '@/lib/engine/types';

interface CalibrationDecisionControlsProps {
  coaching: boolean;
  onCall: (call: Call) => void;
  onToggleCoaching: () => void;
}

const CALLS = [
  { id: 'ship', label: 'Ship', detail: 'Evidence supports release', icon: Check, color: 'bg-win-deep' },
  { id: 'kill', label: 'Kill', detail: 'Evidence supports stopping', icon: X, color: 'bg-coral' },
  { id: 'keep', label: 'Keep Running', detail: 'More valid evidence can change it', icon: Pause, color: 'bg-cyan text-ink' },
] satisfies Array<{
  id: Call;
  label: string;
  detail: string;
  icon: typeof Check;
  color: string;
}>;

export function CalibrationDecisionControls({
  coaching,
  onCall,
  onToggleCoaching,
}: CalibrationDecisionControlsProps) {
  return (
    <>
      <fieldset className="calibration-decisions -mx-4 mt-3">
        <legend className="sr-only">Make your calibration call</legend>
        <div className="calibration-decision-grid grid grid-cols-3 gap-2">
          {CALLS.map(({ id, label, detail, icon: Icon, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => onCall(id)}
              aria-label={`${label}: ${detail}`}
              className={`calibration-decision min-h-[5.25rem] rounded-2xl px-1.5 py-1 text-center text-white transition-transform ${color}`}
            >
              <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink shadow-sm">
                <Icon size={17} weight="bold" aria-hidden />
              </span>
              <span className="mt-1 block text-sm font-extrabold leading-4">{label}</span>
              <span className="calibration-decision-detail mt-1 block text-xs leading-3 opacity-90">{detail}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="calibration-actions mt-2 flex min-h-11 items-center justify-center gap-3 text-xs text-ink-soft">
        <button
          type="button"
          onClick={onToggleCoaching}
          className="inline-flex min-h-11 items-center font-extrabold underline decoration-2 underline-offset-4"
        >
          {coaching ? 'Skip coaching' : 'Show coaching'}
        </button>
        <span className="h-5 border-l border-ink/20" aria-hidden />
        <span className="inline-flex items-center gap-1.5"><Clock size={18} aria-hidden />About 30 seconds</span>
      </div>
    </>
  );
}
