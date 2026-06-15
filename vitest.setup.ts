import '@testing-library/jest-dom'

// Node 26 declares localStorage/sessionStorage as experimental globals (undefined value).
// This prevents vitest's populateGlobal from copying jsdom's versions.
// Manually restore them from the jsdom object so localStorage works in tests.
if (typeof document !== 'undefined' && (globalThis as Record<string, unknown>).jsdom) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dom = (globalThis as any).jsdom
  if (globalThis.localStorage === undefined && dom.window) {
    const desc = Object.getOwnPropertyDescriptor(dom.window, 'localStorage')
    if (desc) Object.defineProperty(globalThis, 'localStorage', { ...desc, configurable: true })
  }
  if (globalThis.sessionStorage === undefined && dom.window) {
    const desc = Object.getOwnPropertyDescriptor(dom.window, 'sessionStorage')
    if (desc) Object.defineProperty(globalThis, 'sessionStorage', { ...desc, configurable: true })
  }
}
