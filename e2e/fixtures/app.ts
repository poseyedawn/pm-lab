import { expect, test as base, type Page } from '@playwright/test';

export const APP_STORAGE_KEYS = [
  'pmlab:profile:v1',
  'pmlab:profile:v2',
  'pmlab:preferences:v1',
  'pmlab:significant:v1',
  'pmlab:shipit:v1',
  'pmlab:exception-room:v1',
  'pmlab:exception-room:active:v1',
] as const;

export interface BrowserIssue {
  kind: 'console' | 'page' | 'request';
  message: string;
}

interface AppFixtures {
  appPage: Page;
  browserIssues: BrowserIssue[];
}

export const test = base.extend<AppFixtures>({
  browserIssues: async ({ page }, provide) => {
    const issues: BrowserIssue[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        issues.push({ kind: 'console', message: message.text() });
      }
    });
    page.on('pageerror', (error) => {
      issues.push({ kind: 'page', message: error.message });
    });
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText ?? 'unknown failure';
      if (!failure.includes('ERR_ABORTED')) {
        issues.push({ kind: 'request', message: `${request.method()} ${request.url()}: ${failure}` });
      }
    });

    await provide(issues);
  },

  appPage: async ({ context, page, browserIssues }, provide) => {
    await context.addInitScript((keys) => {
      try {
        if (window.sessionStorage.getItem('pmlab:e2e:initialized')) return;
        for (const key of keys) window.localStorage.removeItem(key);
        window.sessionStorage.setItem('pmlab:e2e:initialized', 'true');
      } catch {
        // Opaque documents such as about:blank do not expose web storage.
      }
    }, APP_STORAGE_KEYS);

    await provide(page);

    expect.soft(browserIssues, 'Browser console, page, and request failures').toEqual([]);
  },
});

export { expect } from '@playwright/test';

export async function stageLocalStorage(
  page: Page,
  entries: Readonly<Record<string, unknown>>,
): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((records) => {
    for (const [key, value] of Object.entries(records)) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, entries);
}

export async function expectRequiredRegionReachable(page: Page, selector: string): Promise<void> {
  const region = page.locator(selector);
  const measure = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return {
      horizontallyVisible: rect.left >= -1
        && rect.right <= window.innerWidth + 1
        && rect.width <= window.innerWidth + 1,
      rectLeft: rect.left,
      rectRight: rect.right,
      rectTop: rect.top,
      rectBottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  };

  await region.evaluate((element) => element.scrollIntoView({ block: 'start', inline: 'nearest' }));
  const atStart = await region.evaluate(measure);
  await region.evaluate((element) => element.scrollIntoView({ block: 'end', inline: 'nearest' }));
  const atEnd = await region.evaluate(measure);

  const topReachable = atStart.rectTop >= -1 && atStart.rectTop <= atStart.viewportHeight + 1;
  const bottomReachable = atEnd.rectBottom >= -1 && atEnd.rectBottom <= atEnd.viewportHeight + 1;

  expect(
    atStart.horizontallyVisible && atEnd.horizontallyVisible && topReachable && bottomReachable,
    `Required region must fit horizontally and be reachable by vertical scroll within ${atStart.viewportWidth} x ${atStart.viewportHeight}. Start: ${atStart.rectLeft}-${atStart.rectRight} x ${atStart.rectTop}-${atStart.rectBottom}. End: ${atEnd.rectLeft}-${atEnd.rectRight} x ${atEnd.rectTop}-${atEnd.rectBottom}.`,
  ).toBe(true);
}

export async function attachViewportScreenshot(
  page: Page,
  name: string,
  attach: (name: string, options: { body: Buffer; contentType: string }) => Promise<void>,
): Promise<void> {
  const body = await page.screenshot({ animations: 'disabled', fullPage: false });
  await attach(name, { body, contentType: 'image/png' });
}
