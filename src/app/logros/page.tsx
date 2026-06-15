'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { achievements as achievementsApi, Achievement, ApiError } from '@/lib/api'
import { PixelCard } from '@/components/PixelCard'
import { PlatformBadge } from '@/components/PlatformBadge'

const PLATFORMS = ['all', 'steam', 'retroachievements'] as const
type PlatformFilter = typeof PLATFORMS[number]

const SORTS = [
  { value: 'date', label: 'DATE' },
  { value: 'points', label: 'POINTS' },
  { value: 'game', label: 'GAME' },
] as const
type SortOption = typeof SORTS[number]['value']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export default function LogrosPage() {
  const { token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<Achievement[]>([])
  const [platform, setPlatform] = useState<PlatformFilter>('all')
  const [sort, setSort] = useState<SortOption>('date')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !token) { router.push('/login'); return }
    if (!token) return

    setLoading(true)
    achievementsApi
      .list({ platform: platform === 'all' ? undefined : platform, sort })
      .then(setItems)
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) router.push('/login')
      })
      .finally(() => setLoading(false))
  }, [token, authLoading, platform, sort, router])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-pixel-cyan text-xl font-mono">LOGROS</h1>

        {/* Platform tabs */}
        <div className="flex gap-2">
          {PLATFORMS.map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-3 py-1 text-xs font-mono border transition-colors ${
                platform === p
                  ? 'border-pixel-cyan text-pixel-cyan bg-pixel-surface'
                  : 'border-pixel-border text-pixel-muted hover:border-pixel-cyan'
              }`}
            >
              {p === 'retroachievements' ? 'RA' : p.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="bg-pixel-surface border border-pixel-border text-pixel-text font-mono text-xs p-1 focus:border-pixel-cyan focus:outline-none"
        >
          {SORTS.map(s => (
            <option key={s.value} value={s.value}>SORT: {s.label}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-pixel-muted font-mono">LOADING...</p>}

      {!loading && items.length === 0 && (
        <PixelCard>
          <p className="text-pixel-muted font-mono text-sm text-center py-8">
            No achievements yet. Run a sync from your profile!
          </p>
        </PixelCard>
      )}

      <div className="space-y-2">
        {items.map(ach => (
          <PixelCard key={ach.achievement_id} className="flex items-center gap-4">
            {ach.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ach.image_url} alt={ach.title} className="w-10 h-10 object-contain flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 bg-pixel-border flex items-center justify-center text-pixel-cyan flex-shrink-0">★</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-pixel-text font-mono text-sm truncate">{ach.title}</div>
              <div className="text-pixel-muted text-xs truncate">{ach.game_title}</div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-pixel-red text-xs font-mono">{ach.points}pts</span>
              <PlatformBadge platform={ach.platform as 'steam' | 'retroachievements'} />
              <span className="text-pixel-muted text-xs">{formatDate(ach.unlocked_at)}</span>
            </div>
          </PixelCard>
        ))}
      </div>
    </div>
  )
}
