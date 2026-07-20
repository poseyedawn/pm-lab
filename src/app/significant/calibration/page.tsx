'use client';

import { useRouter } from 'next/navigation';
import { CalibrationRound } from '@/components/significant/CalibrationRound';

export default function CalibrationPage() {
  const router = useRouter();

  return (
    <CalibrationRound onContinue={() => router.push('/significant?calibrated=1')} />
  );
}
