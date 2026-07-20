import { describe, expect, it } from 'vitest';
import { DECK, PRODUCTS } from '@/lib/ship-it/cards';
import { choose, startRun } from '@/lib/ship-it/engine';
import { generateReview } from '@/lib/ship-it/review';
import { mulberry32 } from '@/lib/prng';
import type { Dir } from '@/lib/ship-it/types';

const integrityRiskPolicy: Record<string, Dir> = {
  'dark-pattern-growth': 'left',
  'gdpr-list': 'right',
  'demo-vaporware': 'left',
  'a11y-audit': 'right',
  'data-pipeline': 'right',
  'bounty-report': 'right',
  'founder-livestream': 'left',
  'enterprise-checkbox': 'left',
  'seo-content-farm': 'left',
};

describe('Ship It integrity policy diagnostic', () => {
  it('prevents every affected run in the audited 10,000-seed policy from earning a top rating', () => {
    let affected = 0;
    let affectedTopRatings = 0;

    for (let seed = 1; seed <= 10_000; seed += 1) {
      const randomPolicy = mulberry32(seed ^ 0x9e3779b9);
      let run = startRun(seed, DECK, PRODUCTS);
      let usedRiskChoice = false;

      while (run.status === 'active' && run.currentCardId) {
        const forced = integrityRiskPolicy[run.currentCardId];
        const dir = forced ?? (randomPolicy() < 0.5 ? 'left' : 'right');
        usedRiskChoice ||= forced !== undefined;
        run = choose(run, dir, DECK);
      }

      if (!usedRiskChoice) continue;
      affected += 1;
      const rating = generateReview(run, DECK).rating;
      if (rating === 'Promoted' || rating === 'CEO-in-waiting') affectedTopRatings += 1;
    }

    expect(affected).toBeGreaterThan(9_000);
    expect(affectedTopRatings).toBe(0);
  });
});
