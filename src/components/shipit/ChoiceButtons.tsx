'use client';

import { PressButton } from '@/components/juice/PressButton';
import { HintDots } from '@/components/shipit/HintDots';
import type { Card, Dir } from '@/lib/shipit/types';

interface ChoiceButtonsProps {
  card: Card;
  onChoose: (dir: Dir) => void;
  disabled?: boolean;
}

export function ChoiceButtons({ card, onChoose, disabled }: ChoiceButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(['left', 'right'] as const).map((dir) => {
        const choice = card[dir];
        return (
          <div key={dir} className="flex flex-col gap-2">
            <PressButton color={dir === 'left' ? 'sky' : 'brand'} disabled={disabled} onClick={() => onChoose(dir)} className="min-h-16">
              {choice.label}
            </PressButton>
            <HintDots effects={choice.effects} />
          </div>
        );
      })}
    </div>
  );
}
