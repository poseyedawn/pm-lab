import { HourglassMedium, Stack } from '@phosphor-icons/react';
import { shiftConfig } from '@/lib/exception-room/config';
import type { ExceptionRunState } from '@/lib/exception-room/types';

interface CapacityHeaderProps {
  run: ExceptionRunState;
  nextDueIn: number | null;
}

export function CapacityHeader({ run, nextDueIn }: CapacityHeaderProps) {
  const maximum = shiftConfig(run.shift).capacity;
  return (
    <section className="exception-capacity" aria-label={`Shift ${run.shift} capacity`}>
      <div className="exception-capacity-row">
        <div className="exception-capacity-core">
          <div className="exception-capacity-label-row">
            <span className="exception-mini-label"><Stack size={14} weight="fill" /> REVIEW CAPACITY</span>
            <b>{run.capacityRemaining}<small>/{maximum}</small></b>
          </div>
          <div className="exception-segments" role="progressbar" aria-valuemin={0} aria-valuemax={maximum} aria-valuenow={run.capacityRemaining}>
            {Array.from({ length: maximum }, (_, index) => (
              <i key={index} className={index < run.capacityRemaining ? 'is-full' : ''} />
            ))}
          </div>
        </div>
        {nextDueIn !== null && (
          <p className={`exception-due-alert ${nextDueIn <= 1 ? 'is-urgent' : ''}`}>
            <HourglassMedium size={20} weight="fill" />
            <span>{nextDueIn <= 0 ? <>1 CASE<br />DUE NOW</> : <>1 CASE DUE<br />NEXT TICK</>}</span>
          </p>
        )}
      </div>
    </section>
  );
}
