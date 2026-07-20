import type { Page } from '@playwright/test';
import {
  attachViewportScreenshot,
  expect,
  expectRequiredRegionReachable,
  stageLocalStorage,
  test,
} from './fixtures/app';

type Dir = 'left' | 'right';

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

const makeShipState = (run: ReturnType<typeof makeRun>, rewarded = false) => ({
  xp: rewarded ? 120 : 0,
  soundOn: true,
  dailyStreak: 0,
  lastDailyDate: null,
  lastDailyRating: null,
  shields: 0,
  bestRatingFree: null,
  bestRatingDaily: null,
  activeFreeRun: { run, failureSeen: run.status === 'complete' },
  activeDailyRun: null,
  rewardedRunKeys: rewarded ? [`free:${run.seed}`] : [],
});

const receiptRun = makeRun({
  week: 2,
  meters: { users: 46, business: 42, team: 50, tech: 66 },
  drawn: ['roadmap-vs-refactor', 'onboarding-friction'],
  history: [{ cardId: 'roadmap-vs-refactor', dir: 'left' as const }],
  currentCardId: 'onboarding-friction',
});

const riskHistory = [
  { cardId: 'incident-sev1', dir: 'right' as const },
  { cardId: 'incident-runbook', dir: 'left' as const },
  { cardId: 'big-customer-ask', dir: 'right' as const },
  { cardId: 'big-customer-renewal', dir: 'left' as const },
  { cardId: 'founder-livestream', dir: 'left' as const },
  { cardId: 'dark-pattern-growth', dir: 'left' as const },
  { cardId: 'gdpr-list', dir: 'right' as const },
  { cardId: 'a11y-audit', dir: 'right' as const },
];

const needsReviewRun = makeRun({
  seed: 4275,
  week: 18,
  meters: { users: 62, business: 52, team: 42, tech: 54 },
  flags: ['arc:incident:resolved', 'arc:big-customer:resolved'],
  drawn: riskHistory.map((entry) => entry.cardId),
  history: riskHistory,
  currentCardId: null,
  status: 'complete',
});

const viewports = [
  { name: 'zoom-195x422', width: 195, height: 422, expectedCanvasWidth: 195 },
  { name: 'mobile-390x844', width: 390, height: 844, expectedCanvasWidth: 390 },
  { name: 'mobile-430x932', width: 430, height: 932, expectedCanvasWidth: 430 },
  { name: 'desktop-1200x900', width: 1200, height: 900, expectedCanvasWidth: 390 },
] as const;

async function expectCanvasContract(appPage: Page, expectedCanvasWidth: number): Promise<void> {
  const frame = appPage.locator('.lab-frame');
  const box = await frame.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBe(expectedCanvasWidth);
  const overflow = await frame.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
}

async function expectDilemmaReady(appPage: Page): Promise<void> {
  await expect(appPage.getByTestId('ship-it-dilemma')).toHaveCSS('opacity', '1');
}

test.describe('Slice 3 Ship It visual states', () => {
  for (const viewport of viewports) {
    test(`keeps the decision receipt and next action readable at ${viewport.name}`, async ({ appPage }, testInfo) => {
      await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(receiptRun) });
      await appPage.setViewportSize(viewport);
      await appPage.goto('/ship-it/play');
      await expectDilemmaReady(appPage);
      await expectCanvasContract(appPage, viewport.expectedCanvasWidth);
      await expect(appPage.getByRole('region', { name: 'Decision receipt' })).toBeVisible();
      await expectRequiredRegionReachable(appPage, 'main .grid.grid-cols-2');
      await attachViewportScreenshot(
        appPage,
        `slice-3-ship-it-receipt-${viewport.name}.png`,
        testInfo.attach.bind(testInfo),
      );
    });
  }

  for (const viewport of viewports) {
    test(`keeps the Needs Review evidence readable at ${viewport.name}`, async ({ appPage }, testInfo) => {
      await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(needsReviewRun, true) });
      await appPage.setViewportSize(viewport);
      await appPage.goto('/ship-it/play');
      await expectCanvasContract(appPage, viewport.expectedCanvasWidth);
      await expect(appPage.getByRole('heading', { name: /Needs Review/i })).toBeVisible();
      await expectRequiredRegionReachable(appPage, 'button:has-text("Share result")');
      await attachViewportScreenshot(
        appPage,
        `slice-3-ship-it-needs-review-${viewport.name}.png`,
        testInfo.attach.bind(testInfo),
      );
    });
  }

  test('captures the entry, first card, integrity receipt, causal context, warning, failure, and clean review at 390', async ({ appPage }, testInfo) => {
    await appPage.setViewportSize({ width: 390, height: 844 });
    await appPage.goto('/ship-it');
    await attachViewportScreenshot(appPage, 'slice-3-ship-it-entry-mobile-390x844.png', testInfo.attach.bind(testInfo));

    await appPage.goto('/ship-it/play');
    await expectDilemmaReady(appPage);
    await attachViewportScreenshot(appPage, 'slice-3-ship-it-first-card-mobile-390x844.png', testInfo.attach.bind(testInfo));

    const integrityReceiptRun = makeRun({
      week: 2,
      meters: { users: 40, business: 54, team: 42, tech: 50 },
      drawn: ['dark-pattern-growth', 'onboarding-friction'],
      history: [{ cardId: 'dark-pattern-growth', dir: 'left' as const }],
      currentCardId: 'onboarding-friction',
    });
    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(integrityReceiptRun) });
    await appPage.goto('/ship-it/play');
    await expectDilemmaReady(appPage);
    await attachViewportScreenshot(appPage, 'slice-3-ship-it-integrity-receipt-mobile-390x844.png', testInfo.attach.bind(testInfo));

    const causalRun = makeRun({
      week: 6,
      flags: ['promised-sso'],
      drawn: ['enterprise-checkbox', 'sso-bill-due'],
      history: [{ cardId: 'enterprise-checkbox', dir: 'left' as const }],
      currentCardId: 'sso-bill-due',
    });
    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(causalRun) });
    await appPage.goto('/ship-it/play');
    await expectDilemmaReady(appPage);
    await attachViewportScreenshot(appPage, 'slice-3-ship-it-causal-context-mobile-390x844.png', testInfo.attach.bind(testInfo));

    const warningRun = makeRun({
      week: 5,
      meters: { users: 50, business: 18, team: 50, tech: 50 },
      currentCardId: 'price-increase',
      drawn: ['price-increase'],
    });
    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(warningRun) });
    await appPage.goto('/ship-it/play');
    await expectDilemmaReady(appPage);
    await attachViewportScreenshot(appPage, 'slice-3-ship-it-low-warning-mobile-390x844.png', testInfo.attach.bind(testInfo));

    const failureRun = makeRun({
      week: 4,
      meters: { users: 50, business: 5, team: 50, tech: 50 },
      currentCardId: 'price-increase',
      drawn: ['price-increase'],
    });
    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(failureRun) });
    await appPage.goto('/ship-it/play');
    await expectDilemmaReady(appPage);
    await appPage.getByRole('button', { name: 'Hold pricing' }).click();
    await expect(appPage.getByRole('alertdialog')).toBeVisible();
    await attachViewportScreenshot(appPage, 'slice-3-ship-it-failure-mobile-390x844.png', testInfo.attach.bind(testInfo));

    const cleanReviewRun = makeRun({
      seed: 99,
      week: 12,
      meters: { users: 55, business: 58, team: 52, tech: 61 },
      drawn: ['roadmap-vs-refactor'],
      history: [{ cardId: 'roadmap-vs-refactor', dir: 'left' as const }],
      currentCardId: null,
      status: 'complete',
    });
    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(cleanReviewRun) });
    await appPage.goto('/ship-it/play');
    await expect(appPage.getByRole('heading', { name: /Exceeds Expectations/i })).toBeVisible();
    await appPage.waitForTimeout(120);
    await attachViewportScreenshot(appPage, 'slice-3-ship-it-clean-review-mobile-390x844.png', testInfo.attach.bind(testInfo));
  });
});
