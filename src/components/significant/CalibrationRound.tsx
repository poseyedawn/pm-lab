'use client';
import { CalibrationDecisionControls } from '@/components/significant/CalibrationDecisionControls';
import { CalibrationEvidence } from '@/components/significant/CalibrationEvidence';
import { CalibrationReveal } from '@/components/significant/CalibrationReveal';
import { useCalibration } from '@/hooks/significant/useCalibration';
import { GameEntryLoading } from '@/components/game/GameEntryLoading';

interface CalibrationRoundProps {
  onContinue: () => void;
}

export function CalibrationRound({ onContinue }: CalibrationRoundProps) {
  const calibration = useCalibration();

  const handleContinue = () => {
    if (calibration.continueRound()) onContinue();
  };

  if (!calibration.ready) {
    return (
      <GameEntryLoading
        gameName="Significant Calibration"
        description="Preparing a guided experiment call."
        theme="significant"
      />
    );
  }

  if (calibration.phase === 'revealed') {
    return (
      <main
        className={`significant-result ${calibration.correct ? 'significant-result-correct' : 'significant-result-review'}`}
        data-outcome={calibration.correct ? 'correct' : 'review'}
      >
        <CalibrationReveal
          scenario={calibration.scenario}
          call={calibration.call!}
          correct={calibration.correct!}
          reason={calibration.reason}
          stepNumber={calibration.stepNumber}
          totalSteps={calibration.totalSteps}
          isFinalRound={calibration.isFinalRound}
          xpEarned={calibration.xpEarned}
          isReplay={calibration.isReplay}
          onContinue={handleContinue}
        />
      </main>
    );
  }

  return (
    <main className="calibration-screen px-5 pb-0 pt-4 min-[360px]:px-7">
      <CalibrationEvidence
        scenario={calibration.scenario}
        prompt={calibration.prompt}
        stepNumber={calibration.stepNumber}
        totalSteps={calibration.totalSteps}
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
