import { expect, stageLocalStorage, test } from './fixtures/app';

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

test.describe('focused exploratory regressions', () => {
  test('rapid Significant input produces one coherent result', async ({ appPage }) => {
    await stageLocalStorage(appPage, { 'pmlab:significant:v1': significantReady });
    await appPage.goto('/significant/play?level=1');
    await appPage.getByRole('button', { name: /^Kill:/i }).evaluate((button) => {
      const decision = button as HTMLButtonElement;
      decision.click();
      decision.click();
    });

    await expect(appPage.locator('[data-outcome="review"]')).toHaveCount(1);
    await expect(appPage.getByText('That call missed the signal.')).toHaveCount(1);
  });

  test('rapid Exception Room input resolves one case once', async ({ appPage }) => {
    await appPage.goto('/exception-room/play?preview=selected');
    const evidence = appPage.locator('.exception-evidence-item');
    const evidenceCount = await evidence.count();
    for (let index = 0; index < evidenceCount; index += 1) await evidence.nth(index).click();
    await appPage.getByRole('button', { name: /APPROVE/i }).evaluate((button) => {
      const decision = button as HTMLButtonElement;
      decision.click();
      decision.click();
    });

    await expect(appPage.getByText('CASE RESOLVED')).toHaveCount(1);
    await expect(appPage.locator('.exception-reveal')).toHaveCount(1);
    expect(await appPage.locator('.exception-error').count()).toBe(0);
  });
});
