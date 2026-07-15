'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { achievements as achievementsApi, games as gamesApi, LockedAchievement, AchievementsPage, ApiError } from '@/lib/api'
import { PlatformTabs } from '@/components/PlatformTabs'
import { ProgressBar } from '@/components/ProgressBar'

// Rarity border class for unlocked achievements
function rarityClass(rarity_pct: number | null | undefined, is_mastery: boolean | undefined): string {
  if (is_mastery) return 'mastery-glow border-2'
  if (rarity_pct != null && rarity_pct <= 10) return 'border-2 border-[#ffd700]'
  return 'border border-[#00e5ff] border-opacity-50'
}

export default function LogrosPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [platforms, setPlatforms] = useState<string[]>([])
  const [platform, setPlatform] = useState('all')

  const [locked, setLocked] = useState<LockedAchievement[]>([])
  const [unlockedData, setUnlockedData] = useState<AchievementsPage | null>(null)
  const [page, setPage] = useState(1)

  const [loadingLocked, setLoadingLocked] = useState(false)
  const [loadingUnlocked, setLoadingUnlocked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    gamesApi.platforms().then(r => setPlatforms(r.platforms)).catch(() => {})
  }, [user])

  const fetchLocked = useCallback(() => {
    setLoadingLocked(true)
    achievementsApi.locked({ platform: platform === 'all' ? undefined : platform })
      .then(r => setLocked(r.items))
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) router.push('/login')
        else setError('Error al cargar logros bloqueados')
      })
      .finally(() => setLoadingLocked(false))
  }, [platform, router])

  const fetchUnlocked = useCallback(() => {
    setLoadingUnlocked(true)
    achievementsApi.list({ platform: platform === 'all' ? undefined : platform, page, per_page: 48 })
      .then(setUnlockedData)
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) router.push('/login')
        else setError('Error al cargar logros')
      })
      .finally(() => setLoadingUnlocked(false))
  }, [platform, page, router])

  useEffect(() => {
    if (!user) return
    setPage(1)
    fetchLocked()
  }, [platform, user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return
    fetchUnlocked()
  }, [platform, page, user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading || !user) return <div className="text-pixel-muted font-mono p-8">LOADING...</div>
  if (error) return <div className="text-pixel-red font-mono p-8">{error}</div>

  const totalPages = unlockedData ? Math.ceil(unlockedData.total / 48) : 0

  return (
    <div className="space-y-6">
      {/* Platform filter */}
      {platforms.length > 0 && (
        <PlatformTabs
          platforms={platforms}
          selected={platform}
          onChange={p => { setPlatform(p); setPage(1) }}
        />
      )}

      {/* Block 1: Próximos a desbloquear */}
      <section>
        <h2 className="text-pixel-cyan text-xs uppercase tracking-widest border-l-2 border-pixel-red pl-3 mb-3">
          Próximos a desbloquear
        </h2>
        {loadingLocked ? (
          <p className="text-pixel-muted text-xs font-mono">LOADING...</p>
        ) : locked.length === 0 ? (
          <p className="text-pixel-muted text-xs font-mono">No hay logros bloqueados.</p>
        ) : (
          <div className="space-y-2">
            {locked.map(a => (
              <div key={a.achievement_id} className="bg-pixel-surface border border-pixel-border p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-pixel-border flex items-center justify-center flex-shrink-0">
                  {a.image_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={a.image_url} alt={a.title} className="w-full h-full object-cover opacity-40 grayscale" />
                    : <span className="text-pixel-muted text-xs">?</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-pixel-text text-xs truncate">{a.title}</p>
                  <p className="text-pixel-muted text-xs mt-0.5 truncate">{a.game_title}</p>
                  {a.rarity_pct != null && (
                    <div className="mt-1">
                      <ProgressBar value={a.rarity_pct} max={100} showLabel={false} />
                      <p className="text-pixel-muted text-xs mt-0.5">{a.rarity_pct}% de jugadores lo tienen</p>
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-mono px-1 py-0.5 border ${
                    a.rarity_pct != null && a.rarity_pct <= 10
                      ? 'border-[#ffd700] text-[#ffd700]'
                      : 'border-pixel-muted text-pixel-muted'
                  }`}>
                    {a.rarity_pct != null ? `${a.rarity_pct}%` : 'RARO'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Block 2: Vitrina de logros */}
      <section>
        <h2 className="text-pixel-cyan text-xs uppercase tracking-widest border-l-2 border-pixel-red pl-3 mb-3">
          Vitrina de logros
        </h2>
        {loadingUnlocked ? (
          <p className="text-pixel-muted text-xs font-mono">LOADING...</p>
        ) : !unlockedData || unlockedData.items.length === 0 ? (
          <p className="text-pixel-muted text-xs font-mono">Sin logros desbloqueados aún.</p>
        ) : (
          <>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
              {unlockedData.items.map(a => (
                <div
                  key={a.user_achievement_id ?? a.achievement_id}
                  className={`relative group w-full aspect-square ${rarityClass(a.rarity_pct, a.is_mastery)}`}
                >
                  {a.image_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-pixel-border flex items-center justify-center">
                        <span className="text-pixel-muted text-xs">★</span>
                      </div>}
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 hidden group-hover:block w-40 bg-pixel-surface border border-pixel-border p-2 text-xs font-mono pointer-events-none">
                    <p className="text-pixel-text truncate">{a.title}</p>
                    <p className="text-pixel-muted truncate mt-0.5">{a.game_title}</p>
                    {a.unlocked_at && (
                      <p className="text-pixel-muted mt-0.5">{new Date(a.unlocked_at).toLocaleDateString()}</p>
                    )}
                    <p className="text-pixel-red mt-0.5">+{a.points} pts</p>
                    {a.rarity_pct != null && (
                      <p className="text-pixel-muted mt-0.5">{a.rarity_pct}% jugadores</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-3 mt-4 justify-center">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-pixel-muted text-xs font-mono border border-pixel-border px-3 py-1 hover:border-pixel-cyan disabled:opacity-30"
                >
                  ← PREV
                </button>
                <span className="text-pixel-muted text-xs font-mono">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-pixel-muted text-xs font-mono border border-pixel-border px-3 py-1 hover:border-pixel-cyan disabled:opacity-30"
                >
                  NEXT →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
