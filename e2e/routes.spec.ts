import { expect, test } from './fixtures/app';

const routes = [
  { path: '/', marker: /Pick a field test/i },
  { path: '/significant', marker: /Start the field test/i },
  { path: '/significant/calibration', marker: /Does this result support a release/i },
  { path: '/significant/about?from=significant', marker: /how this game was designed|Significant/i },
  { path: '/ship-it', marker: /Free run/i },
  { path: '/ship-it/play', marker: /Week 1/i },
  { path: '/ship-it/daily', marker: /Daily run/i },
  { path: '/ship-it/about', marker: /how this game was designed|Ship It/i },
  { path: '/exception-room', marker: /Practice the decisions/i },
  { path: '/exception-room/about', marker: /How Exception Room was designed/i },
  { path: '/exception-room/play?preview=selected', marker: /EXCEPTION QUEUE/i },
] as const;

test.describe('public route health', () => {
  for (const route of routes) {
    test(`${route.path} settles into product content`, async ({ appPage }) => {
      const response = await appPage.goto(route.path);

      expect(response?.status()).toBeLessThan(400);
      await expect(appPage.getByText(route.marker).first()).toBeVisible();
      await expect(appPage.locator('main[aria-busy="true"]')).toHaveCount(0);
    });
  }
});
