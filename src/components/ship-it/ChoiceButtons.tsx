'use client';

import { PressButton } from '@/components/juice/PressButton';
import { HintDots } from '@/components/ship-it/HintDots';
import type { Card, Dir } from '@/lib/ship-it/types';

interface ChoiceButtonsProps {
  card: Card;
  onChoose: (dir: Dir) => void;
  disabled?: boolean;
}

export function ChoiceButtons({ card, onChoose, disabled }: ChoiceButtonsProps) {
  return (
    <div className="ship-it-choice-grid grid grid-cols-2 gap-3">
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
