import {
  attachViewportScreenshot,
  expect,
  expectRequiredRegionReachable,
  stageLocalStorage,
  test,
} from './fixtures/app';
import type { Page } from '@playwright/test';

const significantReady = {
  campaign: {},
  warmupDone: true,
  dailyStreak: 0,
  lastDailyDate: null,
  lastDailyCorrect: null,
  shields: 0,
  xp: 50,
  soundOn: true,
  campaignStreak: 0,
  campaignCompleteTracked: false,
};

const viewports = [
  { name: 'zoom-195x422', width: 195, height: 422, expectedCanvasWidth: 195 },
  { name: 'mobile-390x844', width: 390, height: 844, expectedCanvasWidth: 390 },
  { name: 'mobile-430x932', width: 430, height: 932, expectedCanvasWidth: 430 },
  { name: 'desktop-1200x900', width: 1200, height: 900, expectedCanvasWidth: 390 },
] as const;

async function expectCanvasContract(
  appPage: Page,
  expectedCanvasWidth: number,
): Promise<void> {
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

test.describe('Slice 2 Significant visual states', () => {
  for (const viewport of viewports) {
    test(`keeps calibration readable at ${viewport.name}`, async ({ appPage }, testInfo) => {
      await appPage.setViewportSize(viewport);
      await appPage.goto('/significant/calibration');
      await expect(appPage.getByLabel('Calibration step 1 of 3')).toBeVisible();
      await expectCanvasContract(appPage, viewport.expectedCanvasWidth);
      await expectRequiredRegionReachable(appPage, '.calibration-decision-grid');
      await attachViewportScreenshot(
        appPage,
        `slice-2-calibration-${viewport.name}.png`,
        testInfo.attach.bind(testInfo),
      );
    });
  }

  for (const viewport of viewports) {
    test(`keeps Winner's Curse evidence and actions readable at ${viewport.name}`, async ({ appPage }, testInfo) => {
      await stageLocalStorage(appPage, { 'pmlab:significant:v1': significantReady });
      await appPage.setViewportSize(viewport);
      await appPage.goto('/significant/play?level=3');
      await expectCanvasContract(appPage, viewport.expectedCanvasWidth);
      await expect(appPage.getByRole('img', { name: /Daily .* across 3 days/i })).toBeVisible();
      await expectRequiredRegionReachable(appPage, '.significant-call-grid');
      await attachViewportScreenshot(
        appPage,
        `slice-2-winners-curse-${viewport.name}.png`,
        testInfo.attach.bind(testInfo),
      );
    });
  }
});
