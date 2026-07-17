'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalibrationRound } from '@/components/significant/CalibrationRound';
import { campaignSeed, generateScenario } from '@/lib/engine/scenario';
import { resolveCall } from '@/lib/engine/level';

const calibrationScenario = generateScenario(campaignSeed(1, 1), 'clean-win');

function CalibrationInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialCall = resolveCall(params.get('call'));

  return (
    <CalibrationRound
      scenario={calibrationScenario}
      initialCall={initialCall}
      onContinue={() => router.push('/significant?calibrated=1')}
    />
  );
}

export default function CalibrationPage() {
  return (
    <Suspense fallback={<main className="calibration-screen px-5 py-4" aria-busy="true" />}>
      <CalibrationInner />
    </Suspense>
  );
}
