/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { auth, profile, achievements, games, friends, ApiError } from './api'

function mockFetch(body: unknown, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }))
}

describe('api client', () => {
  beforeEach(() => {
    localStorage.setItem('auth_token', 'test-token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('includes Authorization header when token is set', async () => {
    mockFetch({ token: 't', user: {} })
    await auth.login('a@b.com', 'pass')
    const [, opts] = vi.mocked(fetch).mock.calls[0]
    expect((opts as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-token',
    })
  })

  it('does not include Authorization header when no token', async () => {
    localStorage.clear()
    mockFetch({ token: 't', user: {} })
    await auth.login('a@b.com', 'pass')
    const [, opts] = vi.mocked(fetch).mock.calls[0]
    expect((opts as RequestInit & { headers: Record<string, string> }).headers).not.toHaveProperty('Authorization')
  })

  it('throws ApiError on non-ok response', async () => {
    mockFetch({ error: 'Unauthorized' }, 401)
    await expect(profile.get()).rejects.toThrow(ApiError)
  })

  it('ApiError carries the parsed server error body', async () => {
    mockFetch({ error: 'Unauthorized' }, 401)
    try {
      await profile.get()
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).data).toEqual({ error: 'Unauthorized' })
      expect((err as ApiError).status).toBe(401)
    }
  })

  it('achievements.list appends platform param', async () => {
    mockFetch([])
    await achievements.list({ platform: 'steam' })
    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(url as string).toContain('platform=steam')
  })

  it('games.list appends status param', async () => {
    mockFetch([])
    await games.list('mastered')
    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(url as string).toContain('status=mastered')
  })
})
