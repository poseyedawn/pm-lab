import {
  attachViewportScreenshot,
  expect,
  expectRequiredRegionReachable,
  stageLocalStorage,
  test,
} from './fixtures/app';

type TestRun = {
  seed: number;
  product: string;
  week: number;
  meters: { users: number; business: number; team: number; tech: number };
  flags: string[];
  drawn: string[];
  history: Array<{ cardId: string; dir: 'left' | 'right' }>;
  currentCardId: string | null;
  status: 'active' | 'dead' | 'complete';
  deadMeter: 'users' | 'business' | 'team' | 'tech' | null;
  overshootsTriggered: Array<'users' | 'business' | 'team' | 'tech'>;
  exhausted: boolean;
};

const makeRun = (over: Partial<TestRun> = {}): TestRun => ({
  seed: 42,
  product: 'Plumage, a B2B invoicing tool',
  week: 1,
  meters: { users: 50, business: 50, team: 50, tech: 50 },
  flags: [],
  drawn: ['roadmap-vs-refactor'],
  history: [],
  currentCardId: 'roadmap-vs-refactor',
  status: 'active',
  deadMeter: null,
  overshootsTriggered: [],
  exhausted: false,
  ...over,
});

const makeShipState = (run: TestRun | null, xp = 0) => ({
  xp,
  soundOn: true,
  dailyStreak: 0,
  lastDailyDate: null,
  lastDailyRating: null,
  shields: 0,
  bestRatingFree: null,
  bestRatingDaily: null,
  activeFreeRun: run ? { run, failureSeen: false } : null,
  activeDailyRun: null,
  rewardedRunKeys: [],
});

const hapticsOff = {
  version: 1,
  preferences: { sound: false, haptics: false, motion: 'reduced' },
};

async function readShipState(page: Parameters<typeof stageLocalStorage>[0]) {
  return page.evaluate(() => JSON.parse(window.localStorage.getItem('pmlab:shipit:v1') ?? 'null') as {
    xp: number;
    lastDailyDate: string | null;
    activeFreeRun: { run: TestRun; failureSeen: boolean } | null;
    activeDailyRun: { date: string; snapshot: { run: TestRun; failureSeen: boolean } } | null;
    rewardedRunKeys: string[];
  });
}

test.describe('Ship It', () => {
  test('explains time, operating rules, Customer meaning, and integrity before play', async ({ appPage }) => {
    await appPage.goto('/ship-it');
    await expect(appPage.getByText(/about three minutes/i)).toBeVisible();
    await expect(appPage.getByText(/extend the run to eighteen weeks/i)).toBeVisible();
    await expect(appPage.getByText(/above zero/i)).toBeVisible();
    await expect(appPage.getByText(/balanced roadmap cannot erase an integrity breach/i)).toBeVisible();
    await expect(appPage.getByText('Customer', { exact: true })).toBeVisible();
  });

  test('advances exactly one week and exposes a complete decision receipt', async ({ appPage }, testInfo) => {
    await appPage.goto('/ship-it/play');
    await expect(appPage.getByText('Week 1', { exact: true })).toBeVisible();
    const choices = appPage.locator('main').getByRole('button');
    await expect(choices).toHaveCount(2);
    const selectedLabel = (await choices.first().textContent())?.trim() ?? '';
    await choices.first().click();
    await expect(appPage.getByText('Week 2', { exact: true })).toBeVisible();
    const receipt = appPage.getByRole('region', { name: 'Decision receipt' });
    await expect(receipt).toContainText(selectedLabel);
    await expect(receipt).toContainText('Model assumption:');
    await expect(receipt.locator('[aria-label="Meter changes"] span').first()).toBeVisible();
    await attachViewportScreenshot(appPage, 'ship-it-after-choice.png', testInfo.attach.bind(testInfo));
  });

  test('supports button play and disables drag under the manual reduced-motion preference', async ({ appPage }) => {
    await stageLocalStorage(appPage, { 'pmlab:preferences:v1': hapticsOff });
    await appPage.goto('/ship-it/play');
    const card = appPage.getByTestId('ship-it-dilemma');
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      await appPage.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await appPage.mouse.down();
      await appPage.mouse.move(box.x + box.width / 2 + 140, box.y + box.height / 2, { steps: 5 });
      await appPage.mouse.up();
    }
    await expect(appPage.getByText('Week 1', { exact: true })).toBeVisible();
    const buttons = appPage.locator('main').getByRole('button');
    await expect(buttons).toHaveCount(2);
    await buttons.first().click();
    await expect(appPage.getByText('Week 2', { exact: true })).toBeVisible();
  });

  test('honors Haptics Off during a choice', async ({ appPage }) => {
    await stageLocalStorage(appPage, { 'pmlab:preferences:v1': hapticsOff });
    await appPage.addInitScript(() => {
      Object.defineProperty(navigator, 'vibrate', {
        configurable: true,
        value: (pattern: number | number[]) => {
          const testWindow = window as Window & { __vibrationCalls?: Array<number | number[]> };
          testWindow.__vibrationCalls ??= [];
          testWindow.__vibrationCalls.push(pattern);
          return true;
        },
      });
    });
    await appPage.goto('/ship-it/play');
    await appPage.locator('main').getByRole('button').first().click();
    const calls = await appPage.evaluate(() => (
      (window as Window & { __vibrationCalls?: Array<number | number[]> }).__vibrationCalls ?? []
    ));
    expect(calls).toEqual([]);
  });

  test('restores the exact active run after refresh and browser history navigation', async ({ appPage }) => {
    await appPage.goto('/ship-it/play');
    await appPage.locator('main').getByRole('button').first().click();
    await expect(appPage.getByText('Week 2', { exact: true })).toBeVisible();
    const before = (await readShipState(appPage)).activeFreeRun?.run;
    expect(before).toBeTruthy();

    await appPage.reload();
    await expect(appPage.getByText('Week 2', { exact: true })).toBeVisible();
    expect((await readShipState(appPage)).activeFreeRun?.run).toEqual(before);

    await appPage.goto('/ship-it');
    await appPage.goBack({ waitUntil: 'domcontentloaded' });
    await expect(appPage).toHaveURL(/\/ship-it\/play$/);
    await expect(appPage.getByText('Week 2', { exact: true })).toBeVisible();
    expect((await readShipState(appPage)).activeFreeRun?.run).toEqual(before);
  });

  test('restores a Daily run and records its terminal reward once', async ({ appPage }) => {
    await appPage.goto('/ship-it/daily');
    await expect(appPage.getByRole('heading', { name: /Daily run #/i })).toBeVisible();
    await appPage.locator('main').getByRole('button').first().click();
    await expect(appPage.getByText('Week 2', { exact: true })).toBeVisible();
    const activeBefore = (await readShipState(appPage)).activeDailyRun;
    expect(activeBefore).toBeTruthy();

    await appPage.reload();
    await expect(appPage.getByText('Week 2', { exact: true })).toBeVisible();
    expect((await readShipState(appPage)).activeDailyRun).toEqual(activeBefore);

    await appPage.evaluate(() => {
      const key = 'pmlab:shipit:v1';
      const state = JSON.parse(window.localStorage.getItem(key) ?? 'null');
      state.activeDailyRun.snapshot = {
        run: {
          ...state.activeDailyRun.snapshot.run,
          week: 12,
          meters: { users: 55, business: 58, team: 52, tech: 61 },
          currentCardId: null,
          status: 'complete',
          deadMeter: null,
        },
        failureSeen: true,
      };
      window.localStorage.setItem(key, JSON.stringify(state));
    });
    await appPage.reload();
    await expect(appPage.getByText('Operating balance', { exact: true })).toBeVisible();
    await expect(appPage.getByText('Integrity', { exact: true })).toBeVisible();
    await expect(appPage.getByRole('button', { name: 'Share result' })).toBeVisible();
    await expect.poll(async () => (await readShipState(appPage)).lastDailyDate).toBe(activeBefore?.date);
    const rewarded = await readShipState(appPage);
    expect(rewarded.xp).toBeGreaterThan(0);
    expect(rewarded.rewardedRunKeys).toEqual([`daily:${activeBefore?.date}:${activeBefore?.snapshot.run.seed}`]);

    await appPage.reload();
    await expect(appPage.getByText(/Today's review is filed/i)).toBeVisible();
    const afterReload = await readShipState(appPage);
    expect(afterReload.xp).toBe(rewarded.xp);
    expect(afterReload.rewardedRunKeys).toEqual(rewarded.rewardedRunKeys);
  });

  test('marks a dark pattern as an integrity breach and lowers Customer health', async ({ appPage }) => {
    const run = makeRun({
      currentCardId: 'dark-pattern-growth',
      drawn: ['dark-pattern-growth'],
    });
    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(run) });
    await appPage.goto('/ship-it/play');
    await appPage.getByRole('button', { name: 'Ship the pre-check' }).click();
    const receipt = appPage.getByRole('region', { name: 'Decision receipt' });
    await expect(receipt).toContainText('Integrity breach');
    await expect(receipt).toContainText('clear opt-in');
    await expect(receipt).toContainText('Customer −10');
    await expect(appPage.getByRole('meter', { name: 'Customer' })).toHaveAttribute('aria-valuenow', '40');

    const beforeNavigation = (await readShipState(appPage)).activeFreeRun;
    await appPage.goto('/ship-it');
    await appPage.goBack({ waitUntil: 'domcontentloaded' });
    await expect(receipt).toContainText('Integrity breach');
    expect((await readShipState(appPage)).activeFreeRun).toEqual(beforeNavigation);
  });

  test('prevents the audited four-risk path from earning a top rating and does not duplicate XP after reload', async ({ appPage }) => {
    await appPage.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            (window as Window & { __copiedShipItText?: string }).__copiedShipItText = value;
          },
        },
      });
    });
    const history: TestRun['history'] = [
      { cardId: 'incident-sev1', dir: 'right' },
      { cardId: 'incident-runbook', dir: 'left' },
      { cardId: 'big-customer-ask', dir: 'right' },
      { cardId: 'big-customer-renewal', dir: 'left' },
      { cardId: 'founder-livestream', dir: 'left' },
      { cardId: 'dark-pattern-growth', dir: 'left' },
      { cardId: 'gdpr-list', dir: 'right' },
      { cardId: 'a11y-audit', dir: 'right' },
    ];
    const run = makeRun({
      seed: 4275,
      week: 18,
      meters: { users: 62, business: 52, team: 42, tech: 54 },
      flags: ['arc:incident:resolved', 'arc:big-customer:resolved'],
      drawn: history.map((entry) => entry.cardId),
      history,
      currentCardId: null,
      status: 'complete',
    });
    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(run) });
    await appPage.goto('/ship-it/play');
    const rating = appPage.getByRole('heading', { name: /Needs Review/i });
    await expect(rating).toBeVisible();
    await expect(rating).toBeFocused();
    await expect(appPage.getByText('Balanced', { exact: true })).toBeVisible();
    await expect(appPage.getByText('4 to review', { exact: true })).toBeVisible();
    await expect(appPage.getByText('Set up the stream:', { exact: true })).toBeVisible();
    await expect(appPage.getByText('Ship the pre-check:', { exact: true })).toBeVisible();
    await expect(appPage.getByText('One more campaign first:', { exact: true })).toBeVisible();
    await expect(appPage.getByText('Blockers only:', { exact: true })).toBeVisible();
    await expect(appPage.getByText('Promoted', { exact: true })).toHaveCount(0);
    await expect(appPage.getByText('CEO-in-waiting', { exact: true })).toHaveCount(0);
    await expect.poll(async () => (await readShipState(appPage)).xp).toBe(180);

    await appPage.reload();
    await expect(appPage.getByRole('heading', { name: /Needs Review/i })).toBeVisible();
    expect((await readShipState(appPage)).xp).toBe(180);
    expect((await readShipState(appPage)).rewardedRunKeys).toEqual(['free:4275']);

    await appPage.getByRole('button', { name: 'Share result' }).click();
    const copied = await appPage.evaluate(() => (
      (window as Window & { __copiedShipItText?: string }).__copiedShipItText ?? ''
    ));
    expect(copied).toContain('Customer 62');
    expect(copied).toContain('Business 52');
    expect(copied).toContain('Team 42');
    expect(copied).toContain('Tech 54');
    expect(copied).toContain('Integrity review 4');

    await appPage.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async () => {
            throw new DOMException('Clipboard permission denied', 'NotAllowedError');
          },
        },
      });
    });
    await appPage.getByRole('button', { name: 'Copied!' }).click();
    await expect(appPage.getByRole('textbox', { name: 'Share text' })).toHaveValue(/Customer 62/);
    await expect(appPage.getByText('Copy did not work. Select the text above instead.')).toBeVisible();
  });

  test('names overshoot backlash and earlier-choice causality', async ({ appPage }) => {
    const overshoot = makeRun({
      meters: { users: 90, business: 50, team: 50, tech: 50 },
      currentCardId: 'viral-spike',
      drawn: ['viral-spike'],
      overshootsTriggered: ['users'],
    });
    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(overshoot) });
    await appPage.goto('/ship-it/play');
    await expect(appPage.getByText(/Backlash: Customer reached 85 or higher/i)).toBeVisible();

    const continuation = makeRun({
      week: 6,
      flags: ['promised-sso'],
      currentCardId: 'sso-bill-due',
      drawn: ['enterprise-checkbox', 'sso-bill-due'],
      history: [{ cardId: 'enterprise-checkbox', dir: 'left' }],
    });
    await stageLocalStorage(appPage, { 'pmlab:shipit:v1': makeShipState(continuation) });
    await appPage.goto('/ship-it/play');
    await expect(appPage.getByText(/Earlier choice: You promised SSO before Engineering scoped it/i)).toBeVisible();
  });

  test('holds XP behind the focused failure dialog and applies the post-choice danger state without haptics', async ({ appPage }) => {
    const run = makeRun({
      week: 4,
      meters: { users: 50, business: 5, team: 50, tech: 50 },
      currentCardId: 'price-increase',
      drawn: ['price-increase'],
    });
    await stageLocalStorage(appPage, {
      'pmlab:shipit:v1': makeShipState(run, 100),
      'pmlab:preferences:v1': hapticsOff,
    });
    await appPage.addInitScript(() => {
      Object.defineProperty(navigator, 'vibrate', {
        configurable: true,
        value: (pattern: number | number[]) => {
          const testWindow = window as Window & { __vibrationCalls?: Array<number | number[]> };
          testWindow.__vibrationCalls ??= [];
          testWindow.__vibrationCalls.push(pattern);
          return true;
        },
      });
    });
    await appPage.goto('/ship-it/play');
    await appPage.getByRole('button', { name: 'Hold pricing' }).click();
    const dialog = appPage.getByRole('alertdialog');
    const reviewAction = appPage.getByRole('button', { name: 'See your review' });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(reviewAction).toBeFocused();
    expect((await readShipState(appPage)).xp).toBe(100);
    expect(await appPage.evaluate(() => (
      (window as Window & { __vibrationCalls?: Array<number | number[]> }).__vibrationCalls ?? []
    ))).toEqual([]);

    await appPage.reload();
    await expect(appPage.getByRole('alertdialog')).toBeVisible();
    await expect(appPage.getByRole('button', { name: 'See your review' })).toBeFocused();
    expect((await readShipState(appPage)).xp).toBe(100);

    await appPage.keyboard.press('Escape');
    await expect(appPage.getByRole('heading', { name: /PIP/i })).toBeVisible();
    await expect.poll(async () => (await readShipState(appPage)).xp).toBe(140);
    await appPage.reload();
    expect((await readShipState(appPage)).xp).toBe(140);
  });

  test('accepts only one rapid choice and restores the resulting state after an immediate reload', async ({ appPage }) => {
    await appPage.goto('/ship-it/play');
    const buttons = appPage.locator('main').getByRole('button');
    await buttons.evaluateAll((choices) => {
      choices[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      choices[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await appPage.reload();
    await expect(appPage.getByText('Week 2', { exact: true })).toBeVisible();
    const run = (await readShipState(appPage)).activeFreeRun?.run;
    expect(run?.week).toBe(2);
    expect(run?.history).toHaveLength(1);
  });

  test('recovers from a malformed active-run object stored as valid JSON', async ({ appPage }) => {
    await stageLocalStorage(appPage, {
      'pmlab:shipit:v1': {
        ...makeShipState(null),
        activeFreeRun: { run: { seed: 'wrong' }, failureSeen: false },
      },
    });
    await appPage.goto('/ship-it/play');
    await expect(appPage.getByText('Week 1', { exact: true })).toBeVisible();
    await appPage.locator('main').getByRole('button').first().click();
    const recovered = (await readShipState(appPage)).activeFreeRun?.run;
    expect(recovered?.seed).toEqual(expect.any(Number));
    expect(recovered?.history).toHaveLength(1);
  });

  test('applies changed haptics and motion preferences without resetting an active run', async ({ appPage }) => {
    await appPage.addInitScript(() => {
      Object.defineProperty(navigator, 'vibrate', {
        configurable: true,
        value: (pattern: number | number[]) => {
          const testWindow = window as Window & { __vibrationCalls?: Array<number | number[]> };
          testWindow.__vibrationCalls ??= [];
          testWindow.__vibrationCalls.push(pattern);
          return true;
        },
      });
    });
    await appPage.goto('/ship-it/play');
    await appPage.locator('main').getByRole('button').first().click();
    await expect(appPage.getByText('Week 2', { exact: true })).toBeVisible();
    const beforePreferences = (await readShipState(appPage)).activeFreeRun?.run;
    await appPage.evaluate(() => {
      (window as Window & { __vibrationCalls?: Array<number | number[]> }).__vibrationCalls = [];
    });

    const settings = appPage.locator('summary[aria-label="Settings"]');
    await settings.click();
    await appPage.getByRole('switch', { name: 'Haptics' }).click();
    await appPage.getByRole('combobox', { name: 'Motion' }).selectOption('reduced');
    await expect(appPage.getByText('Week 2', { exact: true })).toBeVisible();
    expect((await readShipState(appPage)).activeFreeRun?.run).toEqual(beforePreferences);
    await settings.click();

    const card = appPage.getByTestId('ship-it-dilemma');
    await expect(card).toHaveCount(1);
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      await appPage.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await appPage.mouse.down();
      await appPage.mouse.move(box.x + box.width / 2 + 140, box.y + box.height / 2, { steps: 5 });
      await appPage.mouse.up();
    }
    await expect(appPage.getByText('Week 2', { exact: true })).toBeVisible();
    await appPage.locator('main').getByRole('button').first().click();
    await expect(appPage.getByText('Week 3', { exact: true })).toBeVisible();
    expect(await appPage.evaluate(() => (
      (window as Window & { __vibrationCalls?: Array<number | number[]> }).__vibrationCalls ?? []
    ))).toEqual([]);
  });

  test('keeps both choices reachable at simulated 200 percent zoom', async ({ appPage }) => {
    await appPage.setViewportSize({ width: 195, height: 422 });
    await appPage.goto('/ship-it/play');
    await expectRequiredRegionReachable(appPage, 'main .grid.grid-cols-2');
    await appPage.locator('main').getByRole('button').first().click();
    await expect(appPage.getByText('Week 2', { exact: true })).toBeVisible();
    await expectRequiredRegionReachable(appPage, '[aria-label="Decision receipt"]');
  });
});
