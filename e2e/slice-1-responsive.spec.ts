import type { Locator, Page } from '@playwright/test';
import {
  attachViewportScreenshot,
  expect,
  expectRequiredRegionReachable,
  stageLocalStorage,
  test,
} from './fixtures/app';

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

const entrySurfaces = [
  { name: 'hub', path: '/' },
  { name: 'significant', path: '/significant' },
  { name: 'ship-it', path: '/ship-it' },
  { name: 'exception-room', path: '/exception-room' },
] as const;

async function expectNoHorizontalCanvasOverflow(page: Page): Promise<void> {
  const geometry = await page.locator('.lab-frame').evaluate((frame) => ({
    clientWidth: frame.clientWidth,
    scrollWidth: frame.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
}

async function expectLocatorFitsViewport(locator: Locator): Promise<void> {
  const geometry = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.top).toBeGreaterThanOrEqual(0);
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight);
}

test.describe('Slice 1 mobile canvas and chrome', () => {
  for (const viewport of [
    { name: 'mobile-primary', width: 390, height: 844 },
    { name: 'mobile-large', width: 430, height: 932 },
  ] as const) {
    test(`fills ${viewport.name} without desktop gutters`, async ({ appPage }) => {
      await appPage.setViewportSize(viewport);
      for (const surface of entrySurfaces) {
        await appPage.goto(surface.path);
        const box = await appPage.locator('.lab-frame').boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBe(0);
        expect(box!.y).toBe(0);
        expect(box!.width).toBe(viewport.width);
        expect(box!.height).toBe(viewport.height);
        await expectNoHorizontalCanvasOverflow(appPage);
      }
    });
  }

  test('keeps every surface in an exact centered desktop mobile canvas', async ({ appPage }) => {
    const viewport = { width: 1200, height: 900 };
    await appPage.setViewportSize(viewport);

    for (const surface of entrySurfaces) {
      await appPage.goto(surface.path);
      const box = await appPage.locator('.lab-frame').boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBe(390);
      expect(Math.abs((viewport.width - box!.width) / 2 - box!.x)).toBeLessThanOrEqual(1);
      await expectNoHorizontalCanvasOverflow(appPage);

      if (surface.name === 'exception-room') {
        const shell = await appPage.locator('.exception-shell').boundingBox();
        expect(shell).not.toBeNull();
        expect(shell!.width).toBe(390);
        expect(shell!.x).toBe(box!.x);
      }
    }
  });

  test('shows one shared game control layer', async ({ appPage }) => {
    for (const surface of entrySurfaces.slice(1)) {
      await appPage.goto(surface.path);
      await expect(appPage.locator('.lab-frame > header')).toBeHidden();
      await expect(appPage.locator('.game-header')).toHaveCount(1);
      await expect(appPage.locator('.game-header')).toBeVisible();
      await expect(appPage.locator('.significant-entry-controls, .exception-topbar, .exception-run-header')).toHaveCount(0);
    }
  });

  test('keeps shared settings inside the 200 percent zoom canvas', async ({ appPage }, testInfo) => {
    await appPage.setViewportSize({ width: 195, height: 422 });
    await appPage.goto('/significant');
    await appPage.locator('summary[aria-label="Settings"]').click();

    const popover = appPage.locator('.game-settings-popover');
    await expect(popover).toBeVisible();
    await expectLocatorFitsViewport(popover);
    await appPage.getByRole('switch', { name: 'Sound' }).click();
    await appPage.getByRole('switch', { name: 'Haptics' }).click();
    await appPage.locator('.game-settings-popover select').selectOption('reduced');
    await appPage.locator('summary[aria-label="Settings"]').click();
    await expectRequiredRegionReachable(appPage, '.significant-entry-cta');
    await attachViewportScreenshot(appPage, 'slice-1-settings-195x422.png', testInfo.attach.bind(testInfo));
  });

  test('keeps active game titles readable at 200 percent zoom', async ({ appPage }) => {
    await appPage.setViewportSize({ width: 195, height: 422 });

    for (const surface of entrySurfaces.slice(1)) {
      await appPage.goto(surface.path);
      const title = appPage.locator('.game-header-title');
      await expect(title).toBeVisible();
      const width = await title.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
      expect(width.scrollWidth).toBeLessThanOrEqual(width.clientWidth);
    }
  });

  test('moves keyboard focus from shared chrome to the required action', async ({ appPage }) => {
    await appPage.setViewportSize({ width: 195, height: 422 });
    await appPage.goto('/significant');

    await appPage.keyboard.press('Tab');
    await expect(appPage.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
    await appPage.keyboard.press('Tab');
    await expect(appPage.getByRole('link', { name: 'Back to Product Lab' })).toBeFocused();
    await appPage.keyboard.press('Tab');
    await expect(appPage.locator('summary[aria-label="Settings"]')).toBeFocused();
    await appPage.keyboard.press('Tab');
    const action = appPage.getByRole('link', { name: 'Start the field test' });
    await expect(action).toBeFocused();
    await expectLocatorFitsViewport(action);
  });

  test('resets the inner canvas scroll when a hub card opens a game', async ({ appPage }) => {
    await appPage.setViewportSize({ width: 195, height: 422 });
    await appPage.goto('/');
    await appPage.locator('.lab-frame').evaluate((frame) => {
      frame.scrollTop = frame.scrollHeight;
    });
    await appPage.locator('[data-game-tile="significant"]').click({ force: true });
    await expect(appPage).toHaveURL(/\/significant$/);
    await expect.poll(() => appPage.locator('.lab-frame').evaluate((frame) => frame.scrollTop)).toBe(0);
    await expect(appPage.locator('.game-header')).toBeVisible();
  });
});

test.describe('Slice 1 narrow reflow', () => {
  test.beforeEach(async ({ appPage }) => {
    await appPage.setViewportSize({ width: 195, height: 422 });
    await appPage.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('keeps every hub game and entry action reachable', async ({ appPage }) => {
    await appPage.goto('/');
    await expectNoHorizontalCanvasOverflow(appPage);
    for (const gameId of ['significant', 'ship-it', 'exception-room']) {
      await expectRequiredRegionReachable(appPage, `[data-game-tile="${gameId}"]`);
    }

    await appPage.goto('/significant');
    await expectRequiredRegionReachable(appPage, '.significant-entry-cta');

    await appPage.goto('/ship-it');
    await expectRequiredRegionReachable(appPage, 'a[href="/ship-it/play"]');
    await expectRequiredRegionReachable(appPage, 'a[href="/ship-it/daily"]');

    await appPage.goto('/exception-room');
    await expectRequiredRegionReachable(appPage, '.exception-mode-primary');
    await expectRequiredRegionReachable(appPage, '.exception-disclosure');
  });

  test('reflows Significant decisions and review actions without clipping', async ({ appPage }, testInfo) => {
    await stageLocalStorage(appPage, { 'pmlab:significant:v1': significantReady });
    await appPage.setViewportSize({ width: 195, height: 422 });
    await appPage.goto('/significant/play?level=1');
    await expectNoHorizontalCanvasOverflow(appPage);
    await expectRequiredRegionReachable(appPage, '.significant-call-grid');
    await appPage.getByRole('button', { name: /^Kill:/i }).click();
    await expectRequiredRegionReachable(appPage, '.significant-review-button');
    await attachViewportScreenshot(appPage, 'slice-1-significant-review-195x422.png', testInfo.attach.bind(testInfo));
  });

  test('keeps the Exception Room case, evidence, and decisions in one internal scroll surface', async ({ appPage }, testInfo) => {
    await appPage.goto('/exception-room/play?preview=selected');
    await expectNoHorizontalCanvasOverflow(appPage);
    const runScroll = appPage.locator('.exception-run-scroll');
    const scrollGeometry = await runScroll.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(scrollGeometry.scrollHeight).toBeGreaterThan(scrollGeometry.clientHeight);
    await expect(appPage.locator('.exception-case-summary')).toBeVisible();
    await expectRequiredRegionReachable(appPage, '.exception-evidence-list');
    await expectRequiredRegionReachable(appPage, '.exception-decision-buttons');
    await attachViewportScreenshot(appPage, 'slice-1-exception-decisions-195x422.png', testInfo.attach.bind(testInfo));
  });

  test('preserves Exception Room selection and focus after resizing', async ({ appPage }) => {
    await appPage.setViewportSize({ width: 390, height: 844 });
    await appPage.goto('/exception-room/play?preview=selected');
    const evidence = appPage.locator('.exception-evidence-item').first();
    await evidence.click();
    await expect(appPage.getByText('1/2 REQUIRED REVIEWED')).toBeVisible();

    await appPage.setViewportSize({ width: 195, height: 422 });
    await expect(appPage.getByText('1/2 REQUIRED REVIEWED')).toBeVisible();
    await expectRequiredRegionReachable(appPage, '.exception-decision-buttons');
    await appPage.getByRole('button', { name: /ESCALATE/i }).focus();
    await expect(appPage.getByRole('button', { name: /ESCALATE/i })).toBeFocused();
    await expectLocatorFitsViewport(appPage.getByRole('button', { name: /ESCALATE/i }));
  });
});
