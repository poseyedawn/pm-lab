'use client';

import { Check, Pause, X } from '@phosphor-icons/react';
import type { Call } from '@/lib/engine/types';
import { PressButton } from '@/components/juice/PressButton';

interface DecisionButtonsProps {
  onCall: (call: Call) => void;
  disabled?: boolean;
}

export function DecisionButtons({ onCall, disabled }: DecisionButtonsProps) {
  return (
    <div className="significant-call-grid grid grid-cols-3">
      <PressButton color="win" onClick={() => onCall('ship')} disabled={disabled} className="significant-call-button">
        <Check size={24} weight="bold" aria-hidden />Ship
      </PressButton>
      <PressButton color="lose" onClick={() => onCall('kill')} disabled={disabled} className="significant-call-button">
        <X size={24} weight="bold" aria-hidden />Kill
      </PressButton>
      <PressButton color="sky" onClick={() => onCall('keep')} disabled={disabled} className="significant-call-button text-sm leading-tight">
        <Pause size={24} weight="fill" aria-hidden />Keep Running
      </PressButton>
    </div>
  );
}
