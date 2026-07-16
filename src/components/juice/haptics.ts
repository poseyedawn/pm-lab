'use client';

export function vibrate(pattern: number | number[], enabled = true): void {
  if (enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* unsupported — ignore */
    }
  }
}
