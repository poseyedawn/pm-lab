'use client';

export function fireConfetti(opts: { big?: boolean; reducedMotion?: boolean } = {}): void {
  if (opts.reducedMotion) return;
  import('canvas-confetti').then(({ default: confetti }) => {
    confetti({
      particleCount: opts.big ? 220 : 70,
      spread: opts.big ? 110 : 65,
      startVelocity: opts.big ? 45 : 32,
      origin: { y: 0.7 },
      colors: ['#7c3aed', '#22c55e', '#f59e0b', '#3b82f6', '#f43f5e'],
    });
  });
}
