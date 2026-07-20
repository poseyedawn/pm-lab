import { HourglassMedium, Stack } from '@phosphor-icons/react';
import { shiftConfig } from '@/lib/exception-room/config';
import type { DueSummary } from '@/lib/exception-room/presentation';
import type { ExceptionRunState } from '@/lib/exception-room/types';

interface CapacityHeaderProps {
  run: ExceptionRunState;
  dueSummary: DueSummary | null;
}

export function CapacityHeader({ run, dueSummary }: CapacityHeaderProps) {
  const maximum = shiftConfig(run.shift).capacity;
  return (
    <section className="exception-capacity" aria-label={`Shift ${run.shift} capacity`}>
      <div className="exception-capacity-heading">
        <p>SHIFT {run.shift} OF 3</p>
        <div className="exception-shift-progress" role="progressbar" aria-label="Campaign shift" aria-valuemin={1} aria-valuemax={3} aria-valuenow={run.shift}>
          {[1, 2, 3].map((shift) => <i key={shift} className={shift <= run.shift ? 'is-complete' : ''} />)}
        </div>
      </div>
      <div className="exception-capacity-row">
        <div className="exception-capacity-core">
          <div className="exception-capacity-label-row">
            <span className="exception-mini-label"><Stack size={14} weight="fill" /> REVIEW CAPACITY</span>
            <b>{run.capacityRemaining}<small>/{maximum}</small></b>
          </div>
          <div className="exception-segments" role="progressbar" aria-label="Review capacity remaining" aria-valuemin={0} aria-valuemax={maximum} aria-valuenow={run.capacityRemaining}>
            {Array.from({ length: maximum }, (_, index) => (
              <i key={index} className={index < run.capacityRemaining ? 'is-full' : ''} />
            ))}
          </div>
        </div>
        {dueSummary && (
          <p className={`exception-due-alert ${dueSummary.remaining <= 1 ? 'is-urgent' : ''}`}>
            <HourglassMedium size={20} weight="fill" />
            <span>
              {dueSummary.count} {dueSummary.count === 1 ? 'CASE' : 'CASES'}<br />
              {dueSummary.remaining <= 0
                ? 'DUE NOW'
                : dueSummary.remaining === 1
                  ? 'DUE NEXT TICK'
                  : `DUE IN ${dueSummary.remaining} TICKS`}
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
