'use client';

import type { Call } from '@/lib/engine/types';
import { PressButton } from '@/components/juice/PressButton';

interface DecisionButtonsProps {
  onCall: (call: Call) => void;
  disabled?: boolean;
}

export function DecisionButtons({ onCall, disabled }: DecisionButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <PressButton color="win" onClick={() => onCall('ship')} disabled={disabled}>Ship</PressButton>
      <PressButton color="lose" onClick={() => onCall('kill')} disabled={disabled}>Kill</PressButton>
      <PressButton color="sky" onClick={() => onCall('keep')} disabled={disabled} className="text-sm leading-tight">Keep Running</PressButton>
    </div>
  );
}
