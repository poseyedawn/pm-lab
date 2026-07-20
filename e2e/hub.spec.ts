import {
  attachViewportScreenshot,
  expect,
  expectRequiredRegionReachable,
  test,
} from './fixtures/app';

test.describe('Product Lab hub', () => {
  test('presents three distinct playable field tests', async ({ appPage }, testInfo) => {
    await appPage.goto('/');

    await expect(appPage.getByRole('heading', { name: /Pick a field test/i })).toBeVisible();
    const games = appPage.getByRole('navigation', { name: 'Games' });
    await expect(games.getByRole('link')).toHaveCount(3);
    await expect(games.getByRole('link', { name: /Significant/i })).toBeVisible();
    await expect(games.getByRole('link', { name: /Ship It/i })).toBeVisible();
    await expect(games.getByRole('link', { name: /Exception Room/i })).toBeVisible();

    for (const gameId of ['significant', 'ship-it', 'exception-room']) {
      await expect(appPage.locator(`[data-game-tile="${gameId}"] .lab-hub-card-action`)).toBeVisible();
      await expect(appPage.locator(`[data-game-tile="${gameId}"] .lab-hub-card-meta`)).toBeVisible();
    }
    await attachViewportScreenshot(appPage, 'hub-390x844.png', testInfo.attach.bind(testInfo));
  });

  test('keeps the portfolio exit explicit and safe', async ({ appPage }) => {
    await appPage.goto('/');
    const portfolio = appPage.getByRole('link', { name: /Portfolio.*new tab/i });

    await expect(portfolio).toHaveAttribute('href', 'https://alvn.io');
    await expect(portfolio).toHaveAttribute('target', '_blank');
    await expect(portfolio).toHaveAttribute('rel', /noopener/);
    await expect(portfolio).toHaveAttribute('rel', /noreferrer/);
  });

  test('persists shared preferences between game surfaces', async ({ appPage }, testInfo) => {
    await appPage.goto('/significant');
    await appPage.locator('summary[aria-label="Settings"]').click();
    const sound = appPage.getByRole('switch', { name: 'Sound' });
    const haptics = appPage.getByRole('switch', { name: 'Haptics' });
    await sound.click();
    await haptics.click();
    await appPage.locator('.game-settings-popover select').selectOption('reduced');

    await appPage.goto('/ship-it');
    await appPage.locator('summary[aria-label="Settings"]').click();
    await expect(appPage.getByRole('switch', { name: 'Sound' })).toHaveAttribute('aria-checked', 'false');
    await expect(appPage.getByRole('switch', { name: 'Haptics' })).toHaveAttribute('aria-checked', 'false');
    await expect(appPage.locator('.game-settings-popover select')).toHaveValue('reduced');
    await attachViewportScreenshot(appPage, 'shared-settings.png', testInfo.attach.bind(testInfo));
  });

  test('explains when browser storage cannot persist a preference', async ({ appPage }) => {
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
    await expect(appPage.getByRole('switch', { name: 'Sound' })).toHaveAttribute('aria-checked', 'false');
  });

  test('uses only the actionable link as a keyboard stop for each game', async ({ appPage }) => {
    await appPage.goto('/');

    const interactiveStops = await appPage.locator('.lab-hub-card-float').evaluateAll((cards) => cards.map((card) => (
      card.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').length
    )));
    expect(interactiveStops).toEqual([1, 1, 1]);
  });

  test('keeps vertical browsing available over draggable cards', async ({ appPage }) => {
    await appPage.emulateMedia({ reducedMotion: 'reduce' });
    await appPage.setViewportSize({ width: 195, height: 422 });
    await appPage.goto('/');

    const dragSurface = appPage.locator('.lab-hub-card-drag').first();
    await expect(dragSurface).toHaveCSS('touch-action', 'pan-y');
    await dragSurface.hover();
    await appPage.mouse.wheel(0, 240);
    await expect.poll(() => appPage.locator('.lab-frame').evaluate((frame) => frame.scrollTop)).toBeGreaterThan(0);
  });

  test('dismisses Settings with outside click and Escape', async ({ appPage }) => {
    await appPage.goto('/significant');
    const trigger = appPage.locator('summary[aria-label="Settings"]');

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await appPage.locator('.significant-entry-status').click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await appPage.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });

  test('keeps every game reachable at simulated 200 percent zoom', async ({ appPage }) => {
    await appPage.emulateMedia({ reducedMotion: 'reduce' });
    await appPage.setViewportSize({ width: 195, height: 422 });
    await appPage.goto('/');

    for (const gameId of ['significant', 'ship-it', 'exception-room']) {
      await expectRequiredRegionReachable(appPage, `[data-game-tile="${gameId}"]`);
    }
  });
});
