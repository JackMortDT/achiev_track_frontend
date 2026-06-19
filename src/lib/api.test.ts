import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { auth } from './api'

function mockFetch(body: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response)
}

describe('apiFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends credentials: include on every request', async () => {
    mockFetch({ user: {} })
    await auth.login('a@b.com', 'pass')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/login'),
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('does not send Authorization header', async () => {
    mockFetch({ user: {} })
    await auth.login('a@b.com', 'pass')
    const [, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(opts.headers?.Authorization).toBeUndefined()
  })

  it('auth.logout sends DELETE to /api/logout with credentials', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.resolve({}),
    } as Response)
    await auth.logout()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/logout'),
      expect.objectContaining({ method: 'DELETE', credentials: 'include' }),
    )
  })
})
