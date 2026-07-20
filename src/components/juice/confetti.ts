'use client';

interface ConfettiOptions {
  big?: boolean;
  reducedMotion?: boolean;
  container?: HTMLElement | null;
  particleCount?: number;
}

export function fireConfetti(opts: ConfettiOptions = {}): () => void {
  if (opts.reducedMotion) return () => undefined;

  let cancelled = false;
  let canvas: HTMLCanvasElement | null = null;
  let reset: (() => void) | null = null;

  void import('canvas-confetti').then(({ default: confetti }) => {
    if (cancelled) return;
    const container = opts.container;

    const fire = container
      ? (() => {
          canvas = document.createElement('canvas');
          canvas.className = 'game-confetti-layer';
          canvas.dataset.confettiLayer = 'true';
          container.appendChild(canvas);
          const scoped = confetti.create(canvas, { resize: true, useWorker: false });
          reset = () => scoped.reset();
          return scoped;
        })()
      : confetti;

    reset ??= () => confetti.reset();
    const completion = fire({
      particleCount: opts.particleCount ?? (opts.big ? 220 : 70),
      spread: opts.big ? 110 : 65,
      startVelocity: opts.big ? 45 : 32,
      origin: { y: 0.7 },
      colors: ['#7c3aed', '#22c55e', '#f59e0b', '#3b82f6', '#f43f5e'],
    });
    if (completion) {
      void completion.then(() => {
        if (!cancelled) canvas?.remove();
      });
    } else {
      canvas?.remove();
    }
  });

  return () => {
    cancelled = true;
    reset?.();
    canvas?.remove();
  };
}
