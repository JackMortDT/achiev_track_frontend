const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  constructor(public status: number, public data: unknown) {
    super(`API Error ${status}`)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new ApiError(res.status, data)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  username: string
  email: string
  avatar_url: string | null
  inserted_at: string
}

export interface PlatformConnection {
  platform: 'steam' | 'retroachievements'
  external_id: string
  connected_at: string
}

export interface ProfileStats {
  total_achievements: number
  total_games: number
  total_points: number
}

export interface SyncStatus {
  allowed: boolean
  syncs_used: number
  syncs_remaining: number
  next_available_at: string | null
}

export interface ShowcaseGame {
  id: string
  title: string
  image_url: string | null
  platform: string
  unlocked_count: number
  total_achievements: number
  playtime_forever: number
  position?: number
}

export interface ShowcaseAchievement {
  id: string
  name: string
  description: string | null
  image_url: string | null
  game_title: string
  unlocked_at: string
  points: number
  position: number
}

export interface ProfileCustomization {
  favorite_game: ShowcaseGame | null
  game_showcase: ShowcaseGame[]
  achievement_showcase: ShowcaseAchievement[]
}

export interface Profile {
  user: User
  stats: ProfileStats
  platforms: PlatformConnection[]
  sync_status: SyncStatus
  customization: ProfileCustomization
}

export interface Achievement {
  user_achievement_id?: string
  unlocked_at: string
  achievement_id: string
  title: string
  description: string | null
  points: number
  image_url: string | null
  game_title: string
  platform: string
  game_external_id: string
}

export interface AchievementsPage {
  items: Achievement[]
  total: number
  page: number
  per_page: number
}

export interface Game {
  user_game_id: string
  game_id: string
  title: string
  platform: string
  external_id: string
  image_url: string | null
  total_achievements: number
  unlocked_count: number
  is_beaten: boolean
  is_mastered: boolean
  last_synced_at: string | null
}

export interface GameAchievement {
  achievement_id: string
  title: string
  description: string | null
  points: number
  image_url: string | null
  unlocked: boolean
  unlocked_at: string | null
}

export interface GameAchievementsResponse {
  game: {
    title: string
    platform: string
    external_id: string
    image_url: string | null
    total_achievements: number
  }
  items: GameAchievement[]
}

export interface Friend {
  friendship_id: string
  user_id: string
  username: string
  avatar_url: string | null
  status: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  total_points: number
  is_me: boolean
}

export interface CompareData {
  user: ProfileStats
  friend: ProfileStats & { username: string }
  shared_games: Array<{
    title: string
    platform: string
    user_unlocked: number
    friend_unlocked: number
    total: number
  }>
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  register: (username: string, email: string, password: string) =>
    apiFetch<{ user: User }>('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<{ user: User }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch<void>('/api/logout', { method: 'DELETE' }),
}

// ── Profile ──────────────────────────────────────────────────────────────────

export const profile = {
  get: () => apiFetch<Profile>('/api/profile'),
}

// ── Profile Customization ─────────────────────────────────────────────────────

export const profileCustomization = {
  setFavoriteGame: (game_id: string | null) =>
    apiFetch<{ ok: boolean }>('/api/me/favorite-game', {
      method: 'PATCH',
      body: JSON.stringify({ game_id }),
    }),

  setGameShowcase: (game_ids: string[]) =>
    apiFetch<{ ok: boolean }>('/api/me/showcase/games', {
      method: 'PUT',
      body: JSON.stringify({ game_ids }),
    }),

  setAchievementShowcase: (user_achievement_ids: string[]) =>
    apiFetch<{ ok: boolean }>('/api/me/showcase/achievements', {
      method: 'PUT',
      body: JSON.stringify({ user_achievement_ids }),
    }),
}

// ── Sync ─────────────────────────────────────────────────────────────────────

export const sync = {
  status: () => apiFetch<SyncStatus>('/api/sync/status'),
  trigger: () => apiFetch<{ ok: boolean; syncs_remaining: number; next_available_at: string | null }>('/api/sync', { method: 'POST' }),
}

// ── Achievements ─────────────────────────────────────────────────────────────

export const achievements = {
  list: (params?: { platform?: string; sort?: string; page?: number; per_page?: number }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      )
    ).toString() : ''
    return apiFetch<AchievementsPage>(`/api/achievements${qs}`)
  },
}

// ── Games ────────────────────────────────────────────────────────────────────

export const games = {
  list: (status?: string, platform?: string) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (platform && platform !== 'all') params.set('platform', platform)
    const qs = params.toString() ? `?${params}` : ''
    return apiFetch<Game[]>(`/api/games${qs}`)
  },
  platforms: () => apiFetch<{ platforms: string[] }>('/api/games/platforms'),
  gameAchievements: (platform: string, externalId: string) =>
    apiFetch<GameAchievementsResponse>(`/api/games/${platform}/${externalId}/achievements`),
}

// ── Friends ──────────────────────────────────────────────────────────────────

export const friends = {
  list: () => apiFetch<Friend[]>('/api/friends'),
  pending: () => apiFetch<Friend[]>('/api/friends/pending'),
  add: (username: string) =>
    apiFetch<Friend>('/api/friends', { method: 'POST', body: JSON.stringify({ username }) }),
  accept: (friendshipId: string) =>
    apiFetch<{ ok: boolean }>(`/api/friends/${friendshipId}/accept`, { method: 'PUT' }),
  remove: (friendshipId: string) =>
    apiFetch<void>(`/api/friends/${friendshipId}`, { method: 'DELETE' }),
  leaderboard: () => apiFetch<LeaderboardEntry[]>('/api/friends/leaderboard'),
  compare: (userId: string) => apiFetch<CompareData>(`/api/friends/${userId}/compare`),
}

// ── Platforms ─────────────────────────────────────────────────────────────────

export const platforms = {
  connect: (platform: 'steam' | 'retroachievements', external_id: string, api_key?: string) =>
    apiFetch<PlatformConnection>('/api/me/platforms', {
      method: 'POST',
      body: JSON.stringify({ platform, external_id, ...(api_key ? { api_key } : {}) }),
    }),
  disconnect: (platform: 'steam' | 'retroachievements') =>
    apiFetch<{ ok: boolean }>(`/api/me/platforms/${platform}`, { method: 'DELETE' }),
}

// ── Home ─────────────────────────────────────────────────────────────────────

export interface HomeStats {
  total_achievements: number
  total_games: number
  total_points: number
  friend_rank: number | null
}

export interface PopularGame {
  title: string
  platform: string
  external_id: string
  image_url: string | null
  total_achievements: number
  player_count: number
}

export interface HomeData {
  stats: HomeStats
  recent_achievements: Achievement[]
  active_games: Game[]
  popular_games: PopularGame[]
}

export const home = {
  get: () => apiFetch<HomeData>('/api/home'),
}

// ── Me (account settings) ─────────────────────────────────────────────────────

export interface UserWithConnections extends User {
  platform_connections: PlatformConnection[]
}

export const me = {
  get: () => apiFetch<UserWithConnections>('/api/me'),

  update: (attrs: { username?: string; avatar_url?: string }) =>
    apiFetch<User>('/api/me', {
      method: 'PATCH',
      body: JSON.stringify(attrs),
    }),

  updatePassword: (current_password: string, new_password: string) =>
    apiFetch<{ ok: boolean }>('/api/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ current_password, new_password }),
    }),

  delete: () =>
    apiFetch<void>('/api/me', { method: 'DELETE' }),
}

// ── Steam SSO ─────────────────────────────────────────────────────────────────

export const steamSSO = {
  getInitiateUrl: () =>
    apiFetch<{ steam_url: string }>('/api/auth/steam/initiate'),
}
