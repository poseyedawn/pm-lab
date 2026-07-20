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

test.describe('Significant', () => {
  test('guides a first-time player through all three calibration calls', async ({ appPage }, testInfo) => {
    await appPage.goto('/significant');
    await expect(appPage.getByRole('heading', { name: 'Significant' })).toBeVisible();
    await appPage.getByRole('link', { name: 'Start the field test' }).click();
    await expect(appPage).toHaveURL(/\/significant\/calibration/);

    await expect(appPage.getByLabel('Calibration step 1 of 3')).toBeVisible();
    await appPage.getByRole('button', { name: /Ship: Evidence supports release/i }).click();
    await expect(appPage.locator('[data-outcome="correct"]')).toBeVisible();
    await appPage.getByRole('button', { name: /Next calibration round/i }).click();

    await expect(appPage.getByLabel('Calibration step 2 of 3')).toBeVisible();
    await appPage.getByRole('button', { name: /Kill: Evidence supports stopping/i }).click();
    await expect(appPage.locator('[data-outcome="correct"]')).toBeVisible();
    await appPage.getByRole('button', { name: /Next calibration round/i }).click();

    await expect(appPage.getByLabel('Calibration step 3 of 3')).toBeVisible();
    await appPage.getByRole('button', { name: /Keep Running: More valid evidence/i }).click();
    await expect(appPage.locator('[data-outcome="correct"]')).toBeVisible();
    await expect(appPage.getByText('+20 calibration XP')).toBeVisible();
    await attachViewportScreenshot(appPage, 'significant-calibration-round-3-result.png', testInfo.attach.bind(testInfo));
    await appPage.getByRole('button', { name: /Enter the campaign/i }).click();

    await expect(appPage).toHaveURL(/\/significant(?:\?calibrated=1)?$/);
    await expect(appPage.getByText(/Calibration complete/i)).toBeVisible();
    const stored = await appPage.evaluate(() => JSON.parse(localStorage.getItem('pmlab:significant:v1') ?? '{}'));
    expect(stored).toMatchObject({
      warmupDone: true,
      calibrationStep: 0,
      pendingCalibrationCall: null,
      xp: 60,
    });
  });

  test('renders an incorrect result as review, without win reward language', async ({ appPage }, testInfo) => {
    await stageLocalStorage(appPage, { 'pmlab:significant:v1': significantReady });
    await appPage.goto('/significant/play?level=1');
    await appPage.getByRole('button', { name: /^Kill:/i }).click();

    const review = appPage.locator('[data-outcome="review"]');
    await expect(review).toBeVisible();
    await expect(review).toContainText('That call missed the signal.');
    await expect(review).toContainText('Better call');
    await expect(review).not.toContainText(/\+\d+ XP/);
    await expect(appPage.getByRole('heading', { name: 'That call missed the signal.' })).toBeFocused();
    await attachViewportScreenshot(appPage, 'significant-incorrect-result.png', testInfo.attach.bind(testInfo));
  });

  test('opens the Daily experiment from calibrated state', async ({ appPage }) => {
    await stageLocalStorage(appPage, { 'pmlab:significant:v1': significantReady });
    await appPage.goto('/significant/daily');

    await expect(appPage.getByRole('heading', { name: /Daily #/i })).toBeVisible();
    await expect(appPage.getByRole('button', { name: /^Ship:/i })).toBeVisible();
    await expect(appPage.getByRole('button', { name: /^Kill:/i })).toBeVisible();
    await expect(appPage.getByRole('button', { name: /^Keep Running:/i })).toBeVisible();
  });

  test('ignores calibration answer query parameters in production', async ({ appPage }) => {
    for (const call of ['ship', 'kill', 'keep']) {
      await appPage.goto(`/significant/calibration?call=${call}`);
      await expect(appPage.getByLabel('Calibration step 1 of 3')).toBeVisible();
      await expect(appPage.locator('[data-outcome]')).toHaveCount(0);
      const stored = await appPage.evaluate(() => localStorage.getItem('pmlab:significant:v1'));
      expect(stored === null || JSON.parse(stored).pendingCalibrationCall === null).toBe(true);
    }
  });

  test('restores a calibration review and advances exactly one step', async ({ appPage }) => {
    await appPage.goto('/significant/calibration');
    await appPage.getByRole('button', { name: /Kill: Evidence supports stopping/i }).click();
    await expect(appPage.locator('[data-outcome="review"]')).toBeVisible();

    const committed = await appPage.evaluate(() => JSON.parse(localStorage.getItem('pmlab:significant:v1') ?? '{}'));
    expect(committed).toMatchObject({ calibrationStep: 0, pendingCalibrationCall: 'kill', warmupDone: false, xp: 0 });
    await appPage.reload();
    await expect(appPage.locator('[data-outcome="review"]')).toBeVisible();
    await expect(appPage.getByRole('heading', { name: 'That call missed the signal.' })).toBeFocused();
    await appPage.getByRole('button', { name: /Next calibration round/i }).click();
    await expect(appPage.getByLabel('Calibration step 2 of 3')).toBeVisible();

    const advanced = await appPage.evaluate(() => JSON.parse(localStorage.getItem('pmlab:significant:v1') ?? '{}'));
    expect(advanced).toMatchObject({ calibrationStep: 1, pendingCalibrationCall: null, warmupDone: false, xp: 0 });
  });

  test('commits and restores a missed campaign decision before continuation', async ({ appPage }) => {
    await stageLocalStorage(appPage, { 'pmlab:significant:v1': significantReady });
    await appPage.goto('/significant/play?level=1');
    await appPage.getByRole('button', { name: /^Kill:/i }).click();
    await expect(appPage.locator('[data-outcome="review"]')).toBeVisible();

    const committed = await appPage.evaluate(() => JSON.parse(localStorage.getItem('pmlab:significant:v1') ?? '{}'));
    expect(committed).toMatchObject({
      campaign: { 1: { attempts: 1, stars: 0, correct: false } },
      pendingCampaignReveal: { levelId: 1, call: 'kill', correct: false, xpEarned: 0 },
      xp: 50,
    });

    await appPage.reload();
    await expect(appPage.locator('[data-outcome="review"]')).toBeVisible();
    await expect(appPage.getByRole('button', { name: /^Kill:/i })).toHaveCount(0);
    const restored = await appPage.evaluate(() => JSON.parse(localStorage.getItem('pmlab:significant:v1') ?? '{}'));
    expect(restored).toEqual(committed);

    await appPage.getByRole('button', { name: /Return to campaign/i }).click();
    await expect(appPage).toHaveURL(/\/significant$/);
    const cleared = await appPage.evaluate(() => JSON.parse(localStorage.getItem('pmlab:significant:v1') ?? '{}'));
    expect(cleared).toMatchObject({
      campaign: { 1: { attempts: 1, stars: 0, correct: false } },
      pendingCampaignReveal: null,
      xp: 50,
    });
  });

  test('restores the exact successful reward without rerolling XP', async ({ appPage }) => {
    await stageLocalStorage(appPage, { 'pmlab:significant:v1': significantReady });
    await appPage.goto('/significant/play?level=1');
    await appPage.getByRole('button', { name: /^Ship:/i }).click();
    await expect(appPage.locator('[data-outcome="correct"]')).toBeVisible();

    const first = await appPage.evaluate(() => JSON.parse(localStorage.getItem('pmlab:significant:v1') ?? '{}'));
    expect(first.pendingCampaignReveal).toMatchObject({ levelId: 1, call: 'ship', correct: true });
    expect(first.campaign[1]).toMatchObject({ attempts: 1, stars: 3, correct: true });

    await appPage.reload();
    await expect(appPage.locator('[data-outcome="correct"]')).toContainText(`+${first.pendingCampaignReveal.xpEarned} XP`);
    await appPage.reload();
    const second = await appPage.evaluate(() => JSON.parse(localStorage.getItem('pmlab:significant:v1') ?? '{}'));
    expect(second).toEqual(first);
  });

  test('grades Winner\'s Curse from the evidence visible before the call', async ({ appPage }, testInfo) => {
    await stageLocalStorage(appPage, { 'pmlab:significant:v1': significantReady });
    await appPage.goto('/significant/play?level=3');

    await expect(appPage.getByText('Day 3 of 14')).toBeVisible();
    const chart = appPage.getByRole('img', { name: /Daily .* across 3 days/i });
    await expect(chart).toHaveAccessibleName(/Variant (rose|fell|stayed)/i);
    await expect(chart).toHaveAccessibleName(/95% confidence bands overlap/i);
    await expect(chart).toHaveAccessibleName(/Sample:/i);
    await attachViewportScreenshot(appPage, 'significant-winners-curse-readout.png', testInfo.attach.bind(testInfo));

    await appPage.getByRole('button', { name: /^Keep Running:/i }).click();
    await expect(appPage.locator('[data-outcome="correct"]')).toContainText("Winner's curse");
    await expect(appPage.locator('[data-outcome="correct"]')).toContainText('Follow the planned stopping rule');
  });

  test('removes successful confetti before a later review result', async ({ appPage }) => {
    await stageLocalStorage(appPage, { 'pmlab:significant:v1': significantReady });
    await appPage.goto('/significant/play?level=1');
    await appPage.getByRole('button', { name: /^Ship:/i }).click();
    await expect(appPage.locator('[data-outcome="correct"]')).toBeVisible();
    await expect.poll(() => appPage.locator('[data-confetti-layer="true"]').count()).toBeGreaterThan(0);

    await appPage.getByRole('button', { name: /Return to campaign/i }).click();
    await appPage.goto('/significant/play?level=2');
    await appPage.getByRole('button', { name: /^Ship:/i }).click();
    await expect(appPage.locator('[data-outcome="review"]')).toBeVisible();
    await expect(appPage.locator('[data-confetti-layer="true"]')).toHaveCount(0);
  });

  test('commits and restores the daily result before its summary', async ({ appPage }) => {
    await stageLocalStorage(appPage, { 'pmlab:significant:v1': significantReady });
    await appPage.goto('/significant/daily');
    await appPage.getByRole('button', { name: /^Ship:/i }).click();
    const outcome = appPage.locator('[data-outcome]');
    await expect(outcome).toBeVisible();
    const outcomeType = await outcome.getAttribute('data-outcome');

    const committed = await appPage.evaluate(() => JSON.parse(localStorage.getItem('pmlab:significant:v1') ?? '{}'));
    expect(committed.pendingDailyReveal).toMatchObject({ date: committed.lastDailyDate, call: 'ship' });
    await appPage.reload();
    await expect(appPage.locator(`[data-outcome="${outcomeType}"]`)).toBeVisible();
    const restored = await appPage.evaluate(() => JSON.parse(localStorage.getItem('pmlab:significant:v1') ?? '{}'));
    expect(restored).toEqual(committed);

    await appPage.getByRole('button', { name: /See today's result/i }).click();
    await expect(appPage.getByText(/new experiment arrives tomorrow|see you tomorrow/i)).toBeVisible();
    const summarized = await appPage.evaluate(() => JSON.parse(localStorage.getItem('pmlab:significant:v1') ?? '{}'));
    expect(summarized.pendingDailyReveal).toBeNull();
  });

  test('keeps all campaign decisions reachable at simulated 200 percent zoom', async ({ appPage }) => {
    await stageLocalStorage(appPage, { 'pmlab:significant:v1': significantReady });
    await appPage.setViewportSize({ width: 195, height: 422 });
    await appPage.goto('/significant/play?level=1');

    await expectRequiredRegionReachable(appPage, '.significant-call-grid');
  });
});
