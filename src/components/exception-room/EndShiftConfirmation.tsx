'use client';

import { useEffect, useRef } from 'react';
import type { ShiftEndForecast } from '@/lib/exception-room/presentation';
import type { ShiftNumber } from '@/lib/exception-room/types';

interface EndShiftConfirmationProps {
  shift: ShiftNumber;
  forecast: ShiftEndForecast;
  onCancel: () => void;
  onConfirm: () => void;
}

export function EndShiftConfirmation({
  shift,
  forecast,
  onCancel,
  onConfirm,
}: EndShiftConfirmationProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="exception-shift-dialog-backdrop">
      <section
        className="exception-shift-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="end-shift-title"
        aria-describedby="end-shift-copy"
      >
        <p className="exception-kicker">SHIFT {shift} FORECAST</p>
        <h2 id="end-shift-title" ref={headingRef} tabIndex={-1}>End this shift?</h2>
        <p id="end-shift-copy">
          {forecast.expires} {forecast.expires === 1 ? 'case expires' : 'cases expire'}.
          {' '}{forecast.carries} {forecast.carries === 1 ? 'case carries' : 'cases carry'} into the next shift.
        </p>
        <p className="exception-shift-dialog-note">
          Expired cases reduce service performance. Carried cases keep their existing deadline pressure.
        </p>
        <div>
          <button type="button" className="exception-confirm-primary" onClick={onCancel}>KEEP REVIEWING</button>
          <button type="button" className="exception-confirm-risk" onClick={onConfirm}>END SHIFT</button>
        </div>
      </section>
    </div>
  );
}
