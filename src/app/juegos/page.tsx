'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { games as gamesApi, Game, ApiError } from '@/lib/api'
import { PixelCard } from '@/components/PixelCard'
import { PlatformBadge } from '@/components/PlatformBadge'
import { ProgressBar } from '@/components/ProgressBar'

const TABS = [
  { value: 'in_progress', label: 'EN PROGRESO' },
  { value: 'beaten', label: 'COMPLETADOS' },
  { value: 'mastered', label: 'MAESTRÍA' },
  { value: 'all', label: 'TODOS' },
] as const
type TabValue = typeof TABS[number]['value']

export default function JuegosPage() {
  const { token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<Game[]>([])
  const [tab, setTab] = useState<TabValue>('in_progress')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !token) { router.push('/login'); return }
    if (!token) return

    gamesApi
      .list(tab === 'all' ? undefined : tab)
      .then(data => { setItems(data); setLoading(false) })
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) router.push('/login')
        else setLoading(false)
      })
  }, [token, authLoading, tab, router])

  const filtered = search.trim()
    ? items.filter(g => g.title.toLowerCase().includes(search.trim().toLowerCase()))
    : items

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-pixel-cyan text-xl font-mono">JUEGOS</h1>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="BUSCAR JUEGO..."
          className="bg-pixel-surface border border-pixel-border text-pixel-text font-mono text-xs px-3 py-1 focus:border-pixel-cyan focus:outline-none w-48"
        />

        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => { setTab(t.value); setLoading(true) }}
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

      {!loading && filtered.length === 0 && (
        <PixelCard>
          <p className="text-pixel-muted font-mono text-sm text-center py-8">
            {search ? 'Ningún juego coincide con la búsqueda.' : 'Sin juegos en esta categoría.'}
          </p>
        </PixelCard>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map(game => (
          <Link
            key={game.user_game_id}
            href={`/juegos/${game.platform}/${game.external_id}`}
            className="block"
          >
            <PixelCard className="space-y-3 hover:border-pixel-cyan transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                {game.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={game.image_url} alt={game.title} className="w-12 h-12 object-contain flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-pixel-border flex items-center justify-center text-pixel-muted flex-shrink-0">◻</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-pixel-text font-mono text-sm truncate">{game.title}</div>
                    <span className="text-pixel-cyan text-xs font-mono flex-shrink-0">→</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <PlatformBadge platform={game.platform as 'steam' | 'retroachievements'} />
                    {game.is_mastered && (
                      <span className="text-xs text-pixel-cyan border border-pixel-cyan px-1">★ MAESTRÍA</span>
                    )}
                    {game.is_beaten && !game.is_mastered && (
                      <span className="text-xs text-pixel-red border border-pixel-red px-1">✓ COMPLETADO</span>
                    )}
                  </div>
                </div>
              </div>
              <ProgressBar value={game.unlocked_count} max={game.total_achievements} />
            </PixelCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
