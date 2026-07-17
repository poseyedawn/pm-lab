import { describe, expect, it } from 'vitest';
import { resolveCall, resolveCampaignLevel } from '@/lib/engine/level';

describe('resolveCampaignLevel', () => {
  it.each(Array.from({ length: 10 }, (_, index) => String(index + 1)))('accepts campaign level %s', (rawLevel) => {
    expect(resolveCampaignLevel(rawLevel)).toEqual({ levelId: Number(rawLevel), isCanonical: true });
  });

  it.each([null, '', '1.5', '-1', 'NaN', '0', '11', '999', '01', ' 1 '])(
    'falls back safely for invalid value %s',
    (rawLevel) => {
      expect(resolveCampaignLevel(rawLevel)).toEqual({ levelId: 1, isCanonical: false });
    },
  );
});

describe('resolveCall', () => {
  it.each(['ship', 'kill', 'keep'] as const)('accepts the call %s', (call) => {
    expect(resolveCall(call)).toBe(call);
  });

  it.each([null, '', 'Ship', 'continue', ' ship '])('rejects the invalid call %s', (call) => {
    expect(resolveCall(call)).toBeNull();
  });
});
