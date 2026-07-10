import { track as vercelTrack } from '@vercel/analytics';

export function track(name: string, props?: Record<string, string | number | boolean>): void {
  try {
    vercelTrack(name, props);
  } catch {
    /* analytics must never break the game */
  }
}
