const FALLBACK_SITE_ORIGIN = 'https://alvns-productlab.vercel.app';

const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;

export const SITE_URL = new URL(
  configuredOrigin && URL.canParse(configuredOrigin)
    ? configuredOrigin
    : FALLBACK_SITE_ORIGIN,
);

export function absoluteSiteUrl(path: `/${string}`): string {
  return new URL(path, SITE_URL).toString();
}
