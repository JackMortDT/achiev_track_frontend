'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { games as gamesApi, Game, ApiError } from '@/lib/api'
import { PixelCard } from '@/components/PixelCard'
import { PlatformBadge } from '@/components/PlatformBadge'
import { ProgressBar } from '@/components/ProgressBar'

const TABS = [
  { value: 'in_progress', label: 'EN PROGRESO' },
  { value: 'beaten', label: 'BEATEN' },
  { value: 'mastered', label: 'MASTERY' },
  { value: 'all', label: 'TODOS' },
] as const
type TabValue = typeof TABS[number]['value']

export default function JuegosPage() {
  const { token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<Game[]>([])
  const [tab, setTab] = useState<TabValue>('in_progress')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !token) { router.push('/login'); return }
    if (!token) return

    setLoading(true)
    gamesApi
      .list(tab === 'all' ? undefined : tab)
      .then(setItems)
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) router.push('/login')
      })
      .finally(() => setLoading(false))
  }, [token, authLoading, tab, router])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-pixel-cyan text-xl font-mono">JUEGOS</h1>

        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-1 text-xs font-mono border transition-colors ${
                tab === t.value
                  ? 'border-pixel-cyan text-pixel-cyan bg-pixel-surface'
                  : 'border-pixel-border text-pixel-muted hover:border-pixel-cyan'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-pixel-muted font-mono">LOADING...</p>}

      {!loading && items.length === 0 && (
        <PixelCard>
          <p className="text-pixel-muted font-mono text-sm text-center py-8">
            No games in this category yet.
          </p>
        </PixelCard>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map(game => (
          <PixelCard key={game.user_game_id} className="space-y-3">
            <div className="flex items-start gap-3">
              {game.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={game.image_url} alt={game.title} className="w-12 h-12 object-contain flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-pixel-border flex items-center justify-center text-pixel-muted flex-shrink-0">◻</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-pixel-text font-mono text-sm truncate">{game.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <PlatformBadge platform={game.platform as 'steam' | 'retroachievements'} />
                  {game.is_mastered && (
                    <span className="text-xs text-pixel-cyan border border-pixel-cyan px-1">★ MASTERY</span>
                  )}
                  {game.is_beaten && !game.is_mastered && (
                    <span className="text-xs text-pixel-red border border-pixel-red px-1">✓ BEATEN</span>
                  )}
                </div>
              </div>
            </div>
            <ProgressBar value={game.unlocked_count} max={game.total_achievements} />
          </PixelCard>
        ))}
      </div>
    </div>
  )
}
