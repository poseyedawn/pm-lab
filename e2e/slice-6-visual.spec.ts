import path from 'node:path';
import type { Page } from '@playwright/test';
import { expect, stageLocalStorage, test } from './fixtures/app';

type Dir = 'left' | 'right';

const evidenceDirectory = path.resolve(process.cwd(), 'docs/qa/evidence/slice-6');
const shipEmojiPattern = /(📈|💰|🧡|⚙️|👩‍💻|🤵|📣|🎨|📊|🧑‍💼|🎧|🧢|⚖️|🏛️|🏢|🔥|🛡)/u;

const makeRun = (over: Record<string, unknown> = {}) => ({
  seed: 42,
  product: 'Plumage, a B2B invoicing tool',
  week: 1,
  meters: { users: 50, business: 50, team: 50, tech: 50 },
  flags: [],
  drawn: ['roadmap-vs-refactor'],
  history: [] as Array<{ cardId: string; dir: Dir }>,
  currentCardId: 'roadmap-vs-refactor' as string | null,
  status: 'active' as 'active' | 'dead' | 'complete',
  deadMeter: null,
  overshootsTriggered: [],
  exhausted: false,
  ...over,
});

const makeShipState = (run: ReturnType<typeof makeRun> | null) => ({
  xp: 0,
  soundOn: true,
  dailyStreak: 7,
  lastDailyDate: '2000-01-01',
  lastDailyRating: 'Meets Expectations',
  shields: 1,
  bestRatingFree: null,
  bestRatingDaily: 'Meets Expectations',
  activeFreeRun: run ? { run, failureSeen: false } : null,
  activeDailyRun: null,
  rewardedRunKeys: [],
});

async function capture(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: path.join(evidenceDirectory, name),
    animations: 'disabled',
    fullPage: false,
  });
}

async function expectNoRenderedShipEmoji(page: Page): Promise<void> {
  expect(await page.locator('body').innerText()).not.toMatch(shipEmojiPattern);
}

test.describe('Slice 6 authored assets', () => {
  test('captures Ship It vector icon states and the optimized hub title', async ({ appPage }) => {
    await appPage.setViewportSize({ width: 390, height: 844 });
    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(null) });
    await appPage.goto('/ship-it');
    await expect(appPage.locator('[data-testid^="ship-meter-icon-"]')).toHaveCount(4);
    await expect(appPage.getByTestId('ship-daily-streak-icon')).toBeVisible();
    await expectNoRenderedShipEmoji(appPage);
    await capture(appPage, '01-ship-it-entry-icons-390x844.png');

    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(makeRun()) });
    await appPage.goto('/ship-it/play');
    await expect(appPage.getByTestId('ship-it-dilemma')).toHaveCSS('opacity', '1');
    await expect(appPage.getByTestId('ship-avatar-icon')).toBeVisible();
    await expect(appPage.locator('[data-testid^="ship-meter-icon-"]')).toHaveCount(4);
    await expectNoRenderedShipEmoji(appPage);
    await capture(appPage, '02-ship-it-first-card-icons-390x844.png');

    const failureRun = makeRun({
      week: 4,
      meters: { users: 50, business: 5, team: 50, tech: 50 },
      currentCardId: 'price-increase',
      drawn: ['price-increase'],
    });
    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(failureRun) });
    await appPage.goto('/ship-it/play');
    await expect(appPage.getByTestId('ship-it-dilemma')).toHaveCSS('opacity', '1');
    await appPage.getByRole('button', { name: 'Hold pricing' }).click();
    await expect(appPage.getByRole('alertdialog')).toBeVisible();
    await expect(appPage.getByTestId('ship-meter-icon-business')).toBeVisible();
    await expectNoRenderedShipEmoji(appPage);
    await capture(appPage, '03-ship-it-failure-icon-390x844.png');

    await appPage.getByRole('button', { name: /See your review/i }).click();
    await expect(appPage.getByRole('heading', { name: /PIP/i })).toBeVisible();
    await expect(appPage.locator('[data-testid^="ship-meter-icon-"]')).toHaveCount(4);
    await expectNoRenderedShipEmoji(appPage);
    await capture(appPage, '04-ship-it-review-icons-390x844.png');

    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(null) });
    await appPage.goto('/ship-it/daily');
    await expect(appPage.getByTestId('ship-daily-streak-icon')).toBeVisible();
    await expect(appPage.getByTestId('ship-daily-shield-icon')).toBeVisible();
    await expectNoRenderedShipEmoji(appPage);
    await capture(appPage, '05-ship-it-daily-icons-390x844.png');

    await appPage.evaluate(() => {
      window.localStorage.removeItem('pmlab:profile:v1');
      window.localStorage.removeItem('pmlab:profile:v2');
      window.localStorage.setItem('pmlab:preferences:v1', JSON.stringify({
        version: 1,
        preferences: { sound: true, haptics: true, motion: 'reduced' },
      }));
    });
    await appPage.goto('/');
    await expect(appPage.getByRole('heading', { name: /Pick a field test/i })).toBeVisible();
    await capture(appPage, '06-hub-optimized-title-390x844.png');

    await appPage.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function setItem(key: string, value: string) {
        if (this === window.localStorage) throw new DOMException('Storage unavailable', 'QuotaExceededError');
        originalSetItem.call(this, key, value);
      };
    });
    await appPage.goto('/significant');
    await appPage.locator('summary[aria-label="Settings"]').click();
    await appPage.getByRole('switch', { name: 'Sound' }).click();
    await expect(appPage.getByRole('status')).toHaveText(
      'Saved for this visit only. Browser storage is unavailable.',
    );
    await capture(appPage, '08-preference-storage-warning-390x844.png');
  });
});
