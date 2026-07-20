import path from 'node:path';
import type { Page } from '@playwright/test';
import { expect, stageLocalStorage, test } from './fixtures/app';

const evidenceDirectory = path.resolve(process.cwd(), 'docs/qa/evidence/slice-5');

const reducedPreferences = {
  version: 1,
  preferences: { sound: true, haptics: true, motion: 'reduced' },
};

async function capture(
  page: Page,
  name: string,
  animations: 'allow' | 'disabled' = 'disabled',
): Promise<void> {
  await page.screenshot({
    path: path.join(evidenceDirectory, name),
    animations,
    fullPage: false,
  });
}

test.describe('Slice 5 rendered evidence', () => {
  test('captures the repaired hub and shared entry surfaces', async ({ appPage }) => {
    await stageLocalStorage(appPage, { 'pmlab:preferences:v1': reducedPreferences });
    await appPage.goto('/');
    await expect(appPage.getByRole('heading', { name: /Pick a field test/i })).toBeVisible();
    await capture(appPage, '01-hub-390x844.png');

    await appPage.setViewportSize({ width: 430, height: 932 });
    await appPage.goto('/');
    await capture(appPage, '02-hub-430x932.png');

    await appPage.setViewportSize({ width: 1200, height: 900 });
    await appPage.goto('/');
    await capture(appPage, '03-hub-desktop-1200x900.png');

    await appPage.setViewportSize({ width: 195, height: 422 });
    await appPage.goto('/');
    await expect(appPage.locator('[data-game-tile="significant"]')).toBeVisible();
    await capture(appPage, '04-hub-195x422.png');
    await appPage.locator('[data-game-tile="exception-room"]').scrollIntoViewIfNeeded();
    await expect(appPage.locator('[data-game-tile="exception-room"]')).toBeVisible();
    await capture(appPage, '09-hub-195x422-scrolled.png');

    await appPage.setViewportSize({ width: 390, height: 844 });
    await appPage.goto('/significant');
    await expect(appPage.getByRole('link', { name: /Start the field test/i })).toBeVisible();
    await capture(appPage, '05-significant-entry-390x844.png');

    const settings = appPage.locator('summary[aria-label="Settings"]');
    await settings.click();
    await expect(settings).toHaveAttribute('aria-expanded', 'true');
    await capture(appPage, '06-settings-open-390x844.png');
    await appPage.keyboard.press('Escape');

    await appPage.goto('/ship-it');
    await expect(appPage.getByRole('link', { name: /Free run/i })).toBeVisible();
    await capture(appPage, '07-ship-it-entry-390x844.png');

    await stageLocalStorage(appPage, {
      'pmlab:preferences:v1': {
        version: 1,
        preferences: { sound: true, haptics: true, motion: 'full' },
      },
    });
    await appPage.goto('/');
    await appPage.evaluate(() => window.scrollTo(0, 0));
    const dragSurface = appPage.locator('.lab-hub-card-drag').first();
    const box = await dragSurface.boundingBox();
    if (!box) throw new Error('Significant card drag surface is not measurable.');
    await appPage.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await appPage.mouse.down();
    await appPage.mouse.move(box.x + box.width / 2 + 16, box.y + box.height / 2 - 8, { steps: 5 });
    await capture(appPage, '08-hub-card-drag-390x844.png', 'allow');
    await appPage.mouse.up();
    await expect(appPage).toHaveURL(/\/$/);
  });
});
