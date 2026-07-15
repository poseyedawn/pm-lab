import '@testing-library/jest-dom/vitest';

// Node >= 22 defines an experimental global `localStorage` getter that returns
// undefined unless --localstorage-file is passed; it shadows jsdom's storage in
// the test environment. Replace it with a real in-memory implementation.
// Methods live on a prototype so tests can spy on them like jsdom's Storage
// (e.g. vi.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')).
if (globalThis.localStorage == null) {
  const store = new Map<string, string>();
  const proto = {
    getItem: (k: string) => (store.has(String(k)) ? store.get(String(k))! : null),
    setItem: (k: string, v: string) => { store.set(String(k), String(v)); },
    removeItem: (k: string) => { store.delete(String(k)); },
    clear: () => { store.clear(); },
    key: (i: number) => [...store.keys()][i] ?? null,
  };
  const impl = Object.create(proto, {
    length: { get: () => store.size },
  }) as Storage;
  Object.defineProperty(globalThis, 'localStorage', { value: impl, configurable: true });
}
