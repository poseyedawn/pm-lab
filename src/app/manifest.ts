import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alvin's Product Lab",
    short_name: 'Product Lab',
    description: 'Mobile-first games that make product judgment visible.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ff4969',
    theme_color: '#ff4969',
    icons: [{
      src: '/favicon.ico',
      sizes: 'any',
      type: 'image/x-icon',
    }],
  };
}
