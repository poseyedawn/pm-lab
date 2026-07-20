import type { MetadataRoute } from 'next';
import { absoluteSiteUrl } from '@/lib/site';

const publicRoutes = [
  '/',
  '/significant',
  '/significant/calibration',
  '/significant/daily',
  '/significant/about',
  '/ship-it',
  '/ship-it/play',
  '/ship-it/daily',
  '/ship-it/about',
  '/exception-room',
  '/exception-room/play',
  '/exception-room/about',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((path) => ({
    url: absoluteSiteUrl(path),
    lastModified: new Date('2026-07-20T00:00:00.000Z'),
    changeFrequency: path === '/' ? 'monthly' : 'yearly',
    priority: path === '/' ? 1 : path.endsWith('/about') ? 0.5 : 0.8,
  }));
}
