import { describe, expect, it } from 'vitest';
import { CAMPAIGN_CASES } from '@/lib/exception-room/cases';
import { availableCases, startExceptionRun } from '@/lib/exception-room/engine';
import { nextDueSummary, shiftEndForecast } from '@/lib/exception-room/presentation';

describe('Exception Room queue presentation', () => {
  it('reports the exact nearest deadline and every case sharing it', () => {
    const run = startExceptionRun(6240, 'campaign', CAMPAIGN_CASES);
    expect(nextDueSummary(availableCases(run, CAMPAIGN_CASES), run.tick)).toEqual({
      remaining: 2,
      count: 2,
    });
  });

  it('forecasts expirations and carryover before a shift is ended', () => {
    const run = startExceptionRun(6240, 'campaign', CAMPAIGN_CASES);
    const forecast = shiftEndForecast(run, CAMPAIGN_CASES);
    expect(forecast.unresolved).toBe(3);
    expect(forecast.expires + forecast.carries).toBe(3);
    expect(forecast.expires).toBeGreaterThan(0);
    expect(forecast.carries).toBeGreaterThan(0);
  });
});
