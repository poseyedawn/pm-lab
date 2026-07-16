'use client';

import { useRef } from 'react';
import { CalibrationDecisionControls } from '@/components/significant/CalibrationDecisionControls';
import { CalibrationEvidence } from '@/components/significant/CalibrationEvidence';
import { CalibrationReveal } from '@/components/significant/CalibrationReveal';
import { useCalibration } from '@/hooks/significant/useCalibration';
import type { Call, Scenario } from '@/lib/engine/types';

interface CalibrationRoundProps {
  scenario: Scenario;
  initialCall: Call | null;
  onContinue: () => void;
}

export function CalibrationRound({ scenario, initialCall, onContinue }: CalibrationRoundProps) {
  const calibration = useCalibration({ scenario, initialCall });
  const continuedRef = useRef(false);

  const handleContinue = () => {
    if (continuedRef.current) return;
    continuedRef.current = true;
    calibration.continueToCampaign();
    onContinue();
  };

  if (!calibration.ready) {
    return <main className="calibration-screen px-5 py-4" aria-busy="true" />;
  }

  if (calibration.phase === 'revealed') {
    return (
      <main className="significant-result">
        <CalibrationReveal
          scenario={scenario}
          call={calibration.call!}
          correct={calibration.correct!}
          earnedBaseline={calibration.earnedBaseline}
          baselineXp={calibration.baselineXp}
          onContinue={handleContinue}
        />
      </main>
    );
  }

  return (
    <main className="calibration-screen px-5 pb-0 pt-4 min-[360px]:px-7">
      <CalibrationEvidence
        scenario={scenario}
        coaching={calibration.coaching}
        revealed={false}
      />

      <CalibrationDecisionControls
        coaching={calibration.coaching}
        onCall={calibration.decide}
        onToggleCoaching={() => calibration.setCoaching(!calibration.coaching)}
      />
    </main>
  );
}
