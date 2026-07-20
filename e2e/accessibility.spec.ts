import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures/app';

const surfaces = [
  { name: 'hub', path: '/' },
  { name: 'Significant entry', path: '/significant' },
  { name: 'Ship It entry', path: '/ship-it' },
  { name: 'Exception Room entry', path: '/exception-room' },
] as const;

test.describe('automated accessibility baseline', () => {
  for (const surface of surfaces) {
    test(`${surface.name} has no serious or critical axe violations`, async ({ appPage }, testInfo) => {
      await appPage.goto(surface.path);
      const scan = await new AxeBuilder({ page: appPage })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const violations = scan.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');

      await testInfo.attach(`${surface.name}-axe.json`, {
        body: Buffer.from(JSON.stringify(violations, null, 2)),
        contentType: 'application/json',
      });
      expect(violations).toEqual([]);
    });
  }
});
