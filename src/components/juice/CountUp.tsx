'use client';

import { useEffect, useRef, useState } from 'react';
import { usePreferences } from '@/hooks/lab/usePreferences';

interface CountUpProps {
  value: number;
  durationMs?: number;
  className?: string;
}

export function CountUp({ value, durationMs = 600, className }: CountUpProps) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  const { reducedMotion } = usePreferences();

  useEffect(() => {
    const from = fromRef.current;
    fromRef.current = value;
    if (reducedMotion || durationMs === 0 || from === value) {
      setShown(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / durationMs);
      const eased = 1 - (1 - k) ** 3;
      setShown(Math.round(from + (value - from) * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs, reducedMotion]);

  return <span className={className}>{shown}</span>;
}
