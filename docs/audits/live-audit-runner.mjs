import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// The audit environment supplies Playwright without adding it to the product's
// dependency graph. Set PLAYWRIGHT_MODULE to a file URL when it is not locally
// installed, and optionally point CHROME_EXECUTABLE at the user's chosen Chrome.
const playwrightModule = process.env.PLAYWRIGHT_MODULE ?? 'playwright';
const { chromium } = await import(playwrightModule);

const ORIGIN = 'https://alvns-productlab.vercel.app';
const OUT = new URL('./assets/2026-07-15-product-lab/', import.meta.url);
const STATE_KEY = 'pmlab:significant:v1';
const CHROME = process.env.CHROME_EXECUTABLE;
const captures = [];
const checks = [];
const actions = [];

await mkdir(OUT, { recursive: true });

const today = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
})();

const defaultState = (overrides = {}) => ({
  campaign: {},
  warmupDone: false,
  dailyStreak: 0,
  lastDailyDate: null,
  lastDailyCorrect: null,
  shields: 0,
  xp: 0,
  soundOn: true,
  campaignStreak: 0,
  campaignCompleteTracked: false,
  ...overrides,
});

const doneCampaign = (count = 10) => Object.fromEntries(
  Array.from({ length: count }, (_, index) => [
    String(index + 1),
    { stars: index % 3 === 1 ? 1 : 3, attempts: index % 3 === 1 ? 2 : 1, correct: true },
  ]),
);

const addState = async (context, state) => {
  await context.addInitScript(({ key, value }) => {
    if (!window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, { key: STATE_KEY, value: state });
};

const ready = async (page) => {
  await page.waitForLoadState('domcontentloaded');
  await page.locator('main:not([aria-busy="true"])').waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
};

const pageFacts = async (page) => page.evaluate(() => {
  const root = document.documentElement;
  const main = document.querySelector('main');
  const active = document.activeElement;
  const rect = main?.getBoundingClientRect();
  return {
    url: window.location.href,
    title: document.title,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    document: {
      clientWidth: root.clientWidth,
      clientHeight: root.clientHeight,
      scrollWidth: root.scrollWidth,
      scrollHeight: root.scrollHeight,
      canScrollX: root.scrollWidth > root.clientWidth,
      canScrollY: root.scrollHeight > root.clientHeight,
    },
    mainRect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height, bottom: rect.bottom } : null,
    activeElement: active ? {
      tag: active.tagName,
      text: active.textContent?.trim().replace(/\s+/g, ' ').slice(0, 180),
      ariaLabel: active.getAttribute('aria-label'),
      outline: getComputedStyle(active).outline,
      boxShadow: getComputedStyle(active).boxShadow,
    } : null,
    headings: [...document.querySelectorAll('h1,h2,h3')].map((node) => node.textContent?.trim()),
    buttons: [...document.querySelectorAll('button')].map((node) => node.textContent?.trim().replace(/\s+/g, ' ')),
    links: [...document.querySelectorAll('a')].map((node) => ({
      text: node.textContent?.trim().replace(/\s+/g, ' '),
      href: node.getAttribute('href'),
    })),
    bodyText: document.body.innerText.replace(/\n{3,}/g, '\n\n').slice(0, 8000),
  };
});

const before = async (id, page) => {
  actions.push({ id, phase: 'before', facts: await pageFacts(page) });
};

const record = (id, passed, details) => {
  checks.push({ id, passed, details });
  if (!passed) console.error(`FAIL ${id}: ${details}`);
};

const capture = async (filename, page, note) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(450);
  const path = fileURLToPath(new URL(filename, OUT));
  await page.screenshot({ path, type: 'png', fullPage: false, animations: 'disabled' });
  captures.push({ filename, note, facts: await pageFacts(page) });
};

const contextFor = async (browser, options = {}) => {
  const context = await browser.newContext({
    viewport: options.viewport ?? { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: options.isMobile ?? true,
    hasTouch: options.hasTouch ?? true,
    reducedMotion: options.reducedMotion ?? 'no-preference',
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
  });
  if (options.clipboard) {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: ORIGIN });
  }
  if (options.noClipboard) {
    await context.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'clipboard', { configurable: true, get: () => undefined });
    });
  }
  await addState(context, options.state ?? defaultState());
  return context;
};

const browser = await chromium.launch({
  ...(CHROME ? { executablePath: CHROME } : {}),
  headless: true,
  args: [
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-gpu',
    '--disable-sync',
    '--metrics-recording-only',
    '--no-first-run',
    '--no-zygote',
  ],
});

try {
  // Cold landing -> keyboard entry -> first Significant visit.
  {
    const context = await contextFor(browser);
    const page = await context.newPage();
    await page.goto(ORIGIN);
    await ready(page);
    await capture('01-lab-home.png', page, 'Cold mobile Lab landing before interaction.');

    await before('LAB-02-keyboard-enter', page);
    await page.keyboard.press('Tab');
    const focusedCard = await page.evaluate(() => document.activeElement?.textContent?.includes('Significant') ?? false);
    record('LAB-02-focus-card', focusedCard, `Focused Significant card: ${focusedCard}`);
    await page.keyboard.press('Enter');
    await ready(page);
    record('LAB-02-enter-navigates', page.url().endsWith('/significant'), page.url());
    await capture('02-significant-first.png', page, 'First visit after keyboard activation from Lab home.');

    const firstState = JSON.parse(await page.evaluate((key) => localStorage.getItem(key), STATE_KEY));
    record('SIG-01-endowed-state', firstState.warmupDone && firstState.xp === 50, JSON.stringify(firstState));
    record('SIG-04-locked-nodes', await page.getByLabel(/locked$/).count() === 9, `locked=${await page.getByLabel(/locked$/).count()}`);

    await before('SIG-02-toggle-sound', page);
    const soundButton = page.getByRole('button', { name: /Sound on/i });
    await soundButton.click();
    record('SIG-02-label-updates', await page.getByRole('button', { name: /Sound off/i }).isVisible(), 'Sound off label visible');
    await page.reload();
    await ready(page);
    record('SIG-02-persists', await page.getByRole('button', { name: /Sound off/i }).isVisible(), 'Sound preference survived reload');

    // Enumerate keyboard order and capture an actual focus state.
    await page.evaluate(() => document.body.focus());
    const focusOrder = [];
    for (let index = 0; index < 4; index += 1) {
      await page.keyboard.press('Tab');
      focusOrder.push(await page.evaluate(() => ({
        tag: document.activeElement?.tagName,
        text: document.activeElement?.textContent?.trim().replace(/\s+/g, ' '),
        label: document.activeElement?.getAttribute('aria-label'),
      })));
    }
    record('A11Y-05-keyboard-order', focusOrder.length === 4, JSON.stringify(focusOrder));
    await capture('05-significant-focus.png', page, 'Fourth keyboard stop on Significant home: the About link has the browser default 1px auto focus outline.');

    // Return to level 1 using actual link activation.
    await page.goto(`${ORIGIN}/significant`);
    await ready(page);
    await before('SIG-03-play-level-1', page);
    await page.getByRole('link', { name: 'Play level 1' }).click();
    await ready(page);
    record('SIG-03-level-link', page.url().includes('/significant/play?level=1'), page.url());
    record('PLAY-02-04-three-calls', (await page.getByRole('button', { name: /Ship|Kill|Keep Running/ }).count()) === 3, 'All decision controls present');
    await capture('06-round-default.png', page, 'Level 1 readout reached through the campaign link.');

    await before('PLAY-02-ship', page);
    await page.getByRole('button', { name: 'Ship', exact: true }).click();
    const correctVisible = await page.getByRole('heading', { name: 'Correct call!' }).isVisible();
    record('REV-01-level-1-correct', correctVisible, 'Ship on clean-win produced correct reveal');
    await capture('08-reveal-correct.png', page, 'Correct campaign reveal after a real decision click.');
    await before('REV-03-next', page);
    await page.getByRole('button', { name: 'Next' }).click();
    await ready(page);
    record('REV-03-next-persists', page.url().endsWith('/significant') && await page.getByRole('link', { name: 'Play level 2' }).isVisible(), page.url());

    await context.close();
  }

  // Progressed campaign map.
  {
    const context = await contextFor(browser, {
      state: defaultState({
        campaign: doneCampaign(3),
        warmupDone: true,
        xp: 550,
        campaignStreak: 2,
        soundOn: false,
      }),
    });
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/significant`);
    await ready(page);
    await capture('03-significant-progressed.png', page, 'Mixed done, open, and locked campaign state.');
    record('PROG-03-replay-link', await page.getByRole('link', { name: 'Play level 1' }).isVisible(), 'Completed level remains replayable');
    await context.close();
  }

  // Completed campaign + clipboard interaction.
  {
    const state = defaultState({
      campaign: doneCampaign(10),
      warmupDone: true,
      xp: 2450,
      dailyStreak: 6,
      shields: 1,
      soundOn: false,
      campaignStreak: 5,
      campaignCompleteTracked: true,
    });
    const context = await contextFor(browser, { state, clipboard: true });
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/significant`);
    await ready(page);
    await capture('04-significant-complete.png', page, 'All ten levels complete with IQ card visible.');
    await before('IQ-01-copy-result', page);
    await page.getByRole('button', { name: 'Copy result to share' }).click();
    await page.waitForTimeout(200);
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '');
    record('IQ-01-copy-success', clipboardText.includes('Experimentation IQ'), clipboardText);
    record('IQ-02-no-confirmation', await page.getByRole('button', { name: 'Copy result to share' }).isVisible(), 'Button label remains unchanged after successful copy');
    await context.close();
  }

  // Incorrect campaign reveal and invalid level query behavior.
  {
    const context = await contextFor(browser);
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/significant/play?level=1`);
    await ready(page);
    await before('PLAY-03-wrong-call', page);
    await page.getByRole('button', { name: 'Kill', exact: true }).click();
    record('REV-02-incorrect-visible', await page.getByRole('heading', { name: 'Not this time' }).isVisible(), 'Incorrect heading visible');
    await capture('09-reveal-incorrect.png', page, 'Incorrect campaign reveal after a real decision click.');
    await page.getByRole('button', { name: 'Next' }).click();
    await ready(page);
    const failed = JSON.parse(await page.evaluate((key) => localStorage.getItem(key), STATE_KEY));
    record('REV-04-failure-recorded', failed.campaign['1']?.attempts === 1 && !failed.campaign['1']?.correct, JSON.stringify(failed.campaign['1']));

    await page.goto(`${ORIGIN}/significant/play?level=999`);
    await ready(page);
    const invalidFacts = await pageFacts(page);
    record('PLAY-08-invalid-header', invalidFacts.headings.includes('Level 999'), JSON.stringify(invalidFacts.headings));
    await page.getByRole('button', { name: 'Ship', exact: true }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await ready(page);
    const invalidState = JSON.parse(await page.evaluate((key) => localStorage.getItem(key), STATE_KEY));
    record('PLAY-08-invalid-persisted', Object.hasOwn(invalidState.campaign, '999'), JSON.stringify(invalidState.campaign['999']));
    await context.close();
  }

  // Segment-heavy level, reached via an unlocked real level link.
  {
    const context = await contextFor(browser, {
      state: defaultState({ campaign: doneCampaign(9), warmupDone: true, xp: 1900 }),
    });
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/significant`);
    await ready(page);
    await page.getByRole('link', { name: 'Play level 10' }).click();
    await ready(page);
    record('A11Y-07-segment-table', await page.locator('table').isVisible(), 'Segment table visible');
    record('A11Y-07-no-headers', await page.locator('table th').count() === 0, 'No table headers');
    await capture('07-round-segments.png', page, 'Simpson segment readout at level 10.');
    await context.close();
  }

  // Reduced-motion context.
  {
    const context = await contextFor(browser, { reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/significant/play?level=1`);
    await ready(page);
    const reduce = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    record('REV-07-reduced-motion-context', reduce, `matchMedia=${reduce}`);
    await capture('10-round-reduced-motion.png', page, 'Campaign readout under prefers-reduced-motion: reduce.');
    await context.close();
  }

  // Discover today's correct daily call through real clicks in isolated contexts.
  let dailyCorrectCall = null;
  let dailyIncorrectCall = null;
  for (const call of ['Ship', 'Kill', 'Keep Running']) {
    const context = await contextFor(browser);
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/significant/daily`);
    await ready(page);
    await page.getByRole('button', { name: call, exact: true }).click();
    if (await page.getByRole('heading', { name: 'Correct call!' }).isVisible()) dailyCorrectCall = call;
    else dailyIncorrectCall ??= call;
    await context.close();
  }
  record('DAY-03-daily-call-discovered', Boolean(dailyCorrectCall && dailyIncorrectCall), `correct=${dailyCorrectCall}, incorrect=${dailyIncorrectCall}`);

  // Daily unplayed.
  {
    const context = await contextFor(browser);
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/significant/daily`);
    await ready(page);
    await capture('11-daily-unplayed.png', page, 'Unplayed daily experiment before making a call.');
    await before('DAY-02-toggle-sound', page);
    await page.getByRole('button', { name: /Sound on/i }).click();
    record('DAY-02-sound-toggle', await page.getByRole('button', { name: /Sound off/i }).isVisible(), 'Daily sound label updated');
    await context.close();
  }

  // Correct daily completion and successful share feedback.
  {
    const context = await contextFor(browser, { clipboard: true });
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/significant/daily`);
    await ready(page);
    await before('DAY-03-correct-decision', page);
    await page.getByRole('button', { name: dailyCorrectCall, exact: true }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Nailed it. See you tomorrow.').waitFor();
    await before('DAY-11-share-result', page);
    await page.getByRole('button', { name: 'Share result' }).click();
    await page.getByText('Copied!').waitFor();
    record('DAY-11-copy-feedback', true, 'Copied! appeared after share');
    await capture('12-daily-correct.png', page, 'Correct completed daily with copied feedback visible.');
    const stored = JSON.parse(await page.evaluate((key) => localStorage.getItem(key), STATE_KEY));
    record('DAY-04-correct-stored', stored.lastDailyDate === today && stored.lastDailyCorrect === true, JSON.stringify(stored));
    await before('DAY-14-back-to-campaign', page);
    await page.getByRole('link', { name: 'Back to campaign' }).click();
    await ready(page);
    record('DAY-14-back-link', page.url().endsWith('/significant'), page.url());
    await context.close();
  }

  // Incorrect daily completion.
  {
    const context = await contextFor(browser);
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/significant/daily`);
    await ready(page);
    await page.getByRole('button', { name: dailyIncorrectCall, exact: true }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Missed it — tomorrow is a new experiment.').waitFor();
    await capture('13-daily-incorrect.png', page, 'Incorrect completed daily state and recovery options.');
    const stored = JSON.parse(await page.evaluate((key) => localStorage.getItem(key), STATE_KEY));
    record('DAY-04-incorrect-stored', stored.lastDailyDate === today && stored.lastDailyCorrect === false, JSON.stringify(stored));
    await context.close();
  }

  // Clipboard-unavailable fallback.
  {
    const context = await contextFor(browser, {
      noClipboard: true,
      state: defaultState({
        warmupDone: true,
        dailyStreak: 4,
        lastDailyDate: today,
        lastDailyCorrect: true,
        xp: 450,
      }),
    });
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/significant/daily`);
    await ready(page);
    record('DAY-12-textarea-fallback', await page.getByRole('textbox', { name: 'Share text' }).isVisible(), 'Read-only share textarea visible');
    await capture('14-daily-share-fallback.png', page, 'Clipboard-unavailable fallback with read-only share text.');
    await context.close();
  }

  // About page via actual link and back navigation.
  {
    const context = await contextFor(browser);
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/significant`);
    await ready(page);
    await before('SIG-07-about-link', page);
    await page.getByRole('link', { name: 'How this game was designed' }).click();
    await ready(page);
    record('ABOUT-01-route', page.url().endsWith('/significant/about'), page.url());
    await capture('15-about.png', page, 'About/case-study page reached through Significant home.');
    await before('ABOUT-02-back-link', page);
    await page.getByRole('link', { name: 'Back to the game' }).click();
    await ready(page);
    record('ABOUT-02-back', page.url().endsWith('/significant'), page.url());
    await context.close();
  }

  // Wide desktop composition.
  {
    const context = await contextFor(browser, {
      viewport: { width: 1600, height: 900 },
      isMobile: false,
      hasTouch: false,
    });
    const page = await context.newPage();
    await page.goto(ORIGIN);
    await ready(page);
    await capture('16-desktop-lab.png', page, 'Wide desktop Lab landing.');
    await page.getByRole('link', { name: /Significant/ }).click();
    await ready(page);
    await page.getByRole('link', { name: 'Play level 1' }).click();
    await ready(page);
    await capture('17-desktop-round.png', page, 'Wide desktop campaign readout.');
    await context.close();
  }

  // Narrow 320px pass with touch input.
  {
    const context = await contextFor(browser, {
      viewport: { width: 320, height: 568 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/significant/play?level=1`);
    await ready(page);
    await capture('18-mobile-320.png', page, 'Narrow 320px campaign readout.');
    const facts = await pageFacts(page);
    record('A11Y-09-no-horizontal-overflow', !facts.document.canScrollX, JSON.stringify(facts.document));
    record('A11Y-09-primary-controls-present', facts.buttons.includes('Ship') && facts.buttons.includes('Kill') && facts.buttons.includes('Keep Running'), JSON.stringify(facts.buttons));
    await context.close();
  }
} finally {
  await browser.close();
}

const report = {
  capturedAt: new Date().toISOString(),
  origin: ORIGIN,
  timezone: 'America/Los_Angeles',
  today,
  browser: 'Google Chrome via bundled Playwright 1.61.1',
  summary: {
    captureCount: captures.length,
    checkCount: checks.length,
    passed: checks.filter((check) => check.passed).length,
    failed: checks.filter((check) => !check.passed).length,
  },
  captures,
  checks,
  actions,
};

await writeFile(new URL('live-evidence.json', OUT), `${JSON.stringify(report)}\n`);
console.log(JSON.stringify(report.summary));
if (report.summary.failed > 0) process.exitCode = 1;
