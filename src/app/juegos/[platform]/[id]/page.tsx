'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { games as gamesApi, GameAchievementsResponse, ApiError } from '@/lib/api'
import { PlatformBadge } from '@/components/PlatformBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { PixelCard } from '@/components/PixelCard'
import { AchievementTile } from '@/components/AchievementTile'
import { RareStrip } from '@/components/RareStrip'

export default function GameAchievementsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams<{ platform: string; id: string }>()
  const [data, setData] = useState<GameAchievementsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!user || !params) return

    gamesApi
      .gameAchievements(params.platform, params.id)
      .then(result => setData(result))
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) router.push('/login')
        else if (err instanceof ApiError && err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [user, authLoading, params, router])

  if (loading) return <p className="text-pixel-muted font-mono">LOADING...</p>

  if (notFound) {
    return (
      <PixelCard>
        <div className="text-center py-8 space-y-3">
          <p className="text-pixel-muted font-mono text-sm">Juego no encontrado.</p>
          <Link href="/juegos" className="text-pixel-cyan font-mono text-xs hover:underline">
            ← VOLVER A JUEGOS
          </Link>
        </div>
      </PixelCard>
    )
  }

  if (!data) return null

  const unlockedCount = data.items.filter(a => a.unlocked).length
  const playtimeHours = Math.round(data.game.playtime_forever / 60)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/juegos" className="text-pixel-muted font-mono text-xs hover:text-pixel-cyan transition-colors">
        ← JUEGOS
      </Link>

      {/* Hero */}
      <PixelCard>
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 flex-shrink-0 flex items-center justify-center border ${
            data.game.is_mastered
              ? 'border-[#b06aff] shadow-[0_0_16px_#b06aff50]'
              : 'border-pixel-border'
          }`}>
            {data.game.image_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={data.game.image_url} alt={data.game.title} className="w-full h-full object-contain" />
              : <span className="text-pixel-muted text-2xl">◻</span>}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-pixel-cyan font-mono text-lg">{data.game.title}</h1>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <PlatformBadge platform={data.game.platform as 'steam' | 'retroachievements'} />
              {data.game.is_mastered && (
                <span className="text-[10px] font-mono border border-[#b06aff] text-[#b06aff] px-1">
                  ★ MAESTRÍA
                </span>
              )}
              {playtimeHours > 0 && (
                <span className="text-pixel-muted font-mono text-xs">⏱ {playtimeHours}h jugadas</span>
              )}
            </div>

            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="text-pixel-muted font-mono text-xs">{unlockedCount} / {data.game.total_achievements} logros</span>
                <span className="text-pixel-cyan font-mono text-xs">
                  {data.game.total_achievements > 0
                    ? Math.round((unlockedCount / data.game.total_achievements) * 100)
                    : 0}%
                </span>
              </div>
              <ProgressBar value={unlockedCount} max={data.game.total_achievements} showLabel={false} />
            </div>
          </div>
        </div>
      </PixelCard>

      {/* Rare trophies strip */}
      <RareStrip items={data.items} isMastered={data.game.is_mastered} />

      {/* All achievements grid */}
      <section>
        <h2 className="text-pixel-cyan text-xs uppercase tracking-widest border-l-2 border-pixel-red pl-3 mb-3">
          Todos los logros
        </h2>
        {data.items.length === 0 ? (
          <p className="text-pixel-muted font-mono text-sm text-center py-8">Sin logros encontrados.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
            {data.items.map(ach => (
              <AchievementTile key={ach.achievement_id} ach={ach} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
