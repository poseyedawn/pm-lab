import { attachViewportScreenshot, expect, test } from './fixtures/app';

const hubViewports = [
  { name: 'mobile-primary', width: 390, height: 844 },
  { name: 'mobile-large', width: 430, height: 932 },
  { name: 'desktop-mobile-canvas', width: 1200, height: 900 },
  { name: 'zoom-200-percent', width: 195, height: 422 },
] as const;

const surfaces = [
  { name: 'hub', path: '/' },
  { name: 'significant', path: '/significant' },
  { name: 'ship-it', path: '/ship-it' },
  { name: 'exception-room', path: '/exception-room' },
] as const;

test.describe('representative visual contracts', () => {
  for (const viewport of hubViewports) {
    test(`all entry surfaces at ${viewport.name}`, async ({ appPage }, testInfo) => {
      await appPage.setViewportSize(viewport);
      await appPage.emulateMedia({ reducedMotion: 'reduce' });
      for (const surface of surfaces) {
        await appPage.goto(surface.path);

        const frame = appPage.locator('.lab-frame');
        const box = await frame.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
        if (viewport.name === 'desktop-mobile-canvas') {
          expect(box!.width).toBe(390);
          expect(Math.abs((viewport.width - box!.width) / 2 - box!.x)).toBeLessThanOrEqual(1);
        }

        await attachViewportScreenshot(
          appPage,
          `${surface.name}-${viewport.width}x${viewport.height}.png`,
          testInfo.attach.bind(testInfo),
        );
      }
    });
  }
});
