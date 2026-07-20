import { expect, test } from './fixtures/app';

const gameMetadata = [
  {
    path: '/significant',
    title: "Significant | Alvin's Product Lab",
    description: /experiment judgment/i,
    canonical: 'https://alvns-productlab.vercel.app/significant',
    image: '/lab/significant-depth-card.webp',
    loadingHeading: 'Significant',
  },
  {
    path: '/ship-it',
    title: "Ship It | Alvin's Product Lab",
    description: /product tradeoffs/i,
    canonical: 'https://alvns-productlab.vercel.app/ship-it',
    image: '/lab/ship-it-depth-card.webp',
    loadingHeading: 'Ship It',
  },
  {
    path: '/exception-room',
    title: "Exception Room | Alvin's Product Lab",
    description: /AI operations/i,
    canonical: 'https://alvns-productlab.vercel.app/exception-room',
    image: '/lab/exception-room-depth-card.webp',
    loadingHeading: 'Exception Room',
  },
] as const;

test.describe('public Product Lab platform surface', () => {
  for (const game of gameMetadata) {
    test(`${game.path} exposes game-specific metadata and server loading content`, async ({ appPage }) => {
      const response = await appPage.request.get(game.path);
      const html = await response.text();
      expect(response.status()).toBe(200);
      expect(html).toContain(`>${game.loadingHeading}</h1>`);
      expect(html).toContain('Checking saved progress...');

      await appPage.goto(game.path);
      await expect(appPage).toHaveTitle(game.title);
      await expect(appPage.locator('link[rel="canonical"]')).toHaveAttribute('href', game.canonical);
      await expect(appPage.locator('meta[property="og:description"]')).toHaveAttribute('content', game.description);
      await expect(appPage.locator('meta[property="og:image"]')).toHaveAttribute('content', new RegExp(`${game.image.replaceAll('/', '\\/')}$`));
      await expect(appPage.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    });
  }

  test('publishes discovery files and intentional browser policies', async ({ appPage }) => {
    const root = await appPage.request.get('/');
    expect(root.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(root.headers()['permissions-policy']).toBe('camera=(), geolocation=(), microphone=()');
    expect(root.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(root.headers()['x-content-type-options']).toBe('nosniff');
    expect(root.headers()['x-frame-options']).toBe('DENY');

    const robots = await appPage.request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    await expect(robots.text()).resolves.toContain('Sitemap: https://alvns-productlab.vercel.app/sitemap.xml');

    const sitemap = await appPage.request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const sitemapText = await sitemap.text();
    expect(sitemapText).toContain('https://alvns-productlab.vercel.app/significant');
    expect(sitemapText).toContain('https://alvns-productlab.vercel.app/ship-it');
    expect(sitemapText).toContain('https://alvns-productlab.vercel.app/exception-room');

    const manifest = await appPage.request.get('/manifest.webmanifest');
    expect(manifest.status()).toBe(200);
    expect(await manifest.json()).toMatchObject({
      name: "Alvin's Product Lab",
      display: 'standalone',
      theme_color: '#ff4969',
    });
  });
});
