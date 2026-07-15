/** Lab-wide profile shared by all pm-lab games: pmlab:profile:v1 = { xp: sum of all games }. */
const GAME_KEYS = ['pmlab:significant:v1', 'pmlab:shipit:v1'];

export function syncLabProfile(): void {
  try {
    if (typeof window === 'undefined') return;
    let xp = 0;
    for (const key of GAME_KEYS) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { xp?: unknown };
      if (typeof parsed.xp === 'number') xp += parsed.xp;
    }
    window.localStorage.setItem('pmlab:profile:v1', JSON.stringify({ xp }));
  } catch {
    /* profile is best-effort; never break a game over it */
  }
}
