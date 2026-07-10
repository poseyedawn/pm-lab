export interface Flavor {
  product: string;
  hypothesis: string;
  metricName: string;
}

export const FLAVORS: readonly Flavor[] = [
  { product: 'Wavelength, a music app', hypothesis: 'A one-tap "play my mix" button on the home screen increases daily listens', metricName: 'Listen-through rate' },
  { product: 'Cartful, a grocery app', hypothesis: 'Showing delivery ETA before checkout increases order completion', metricName: 'Checkout conversion' },
  { product: 'Loop, a fitness tracker', hypothesis: 'A weekly recap notification increases workout logging', metricName: 'Log rate' },
  { product: 'Nest Egg, a savings app', hypothesis: 'Rounding-up purchases by default increases first deposits', metricName: 'Deposit conversion' },
  { product: 'Papertrail, a docs tool', hypothesis: 'Inline comments (vs. sidebar) increase docs shared per user', metricName: 'Share rate' },
  { product: 'Hopscotch, a travel app', hypothesis: 'Price-drop alerts increase itinerary saves', metricName: 'Save rate' },
  { product: 'Brew, a coffee subscription', hypothesis: 'A quiz-based onboarding increases trial-to-paid conversion', metricName: 'Trial conversion' },
  { product: 'Kindling, a reading app', hypothesis: 'Progress streaks on the library screen increase daily reading sessions', metricName: 'Session rate' },
  { product: 'Relay, a team chat tool', hypothesis: 'Suggested replies increase response rate to @-mentions', metricName: 'Response rate' },
  { product: 'Patch, a plant-care app', hypothesis: 'Photo-based diagnosis increases premium upgrades', metricName: 'Upgrade conversion' },
] as const;
