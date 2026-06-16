'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { games as gamesApi, GameAchievementsResponse, GameAchievement, ApiError } from '@/lib/api'
import { PixelCard } from '@/components/PixelCard'
import { PlatformBadge } from '@/components/PlatformBadge'
import { ProgressBar } from '@/components/ProgressBar'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

function AchievementRow({ ach }: { ach: GameAchievement }) {
  return (
    <div className={`flex items-center gap-3 py-3 border-t border-pixel-border ${!ach.unlocked ? 'opacity-40' : ''}`}>
      {/* Left border indicator for unlocked achievements */}
      <div className={`w-1 self-stretch flex-shrink-0 ${ach.unlocked ? 'bg-pixel-cyan' : ''}`} />

      {ach.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ach.image_url}
          alt={ach.title}
          className={`w-10 h-10 object-contain flex-shrink-0 ${ach.unlocked ? '' : 'grayscale'}`}
        />
      ) : (
        <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 text-xs font-mono ${
          ach.unlocked ? 'bg-pixel-surface text-pixel-cyan' : 'bg-pixel-border text-pixel-muted'
        }`}>
          {ach.unlocked ? '★' : '○'}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className={`font-mono text-sm truncate ${ach.unlocked ? 'text-pixel-text' : 'text-pixel-muted'}`}>
          {ach.title}
        </div>
        {ach.description && (
          <div className="text-pixel-muted text-xs truncate">{ach.description}</div>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {ach.points > 0 && (
          <span className={`text-xs font-mono ${ach.unlocked ? 'text-pixel-red' : 'text-pixel-muted'}`}>
            {ach.points}pts
          </span>
        )}
        {ach.unlocked && ach.unlocked_at && (
          <span className="text-pixel-muted text-xs">{formatDate(ach.unlocked_at)}</span>
        )}
      </div>
    </div>
  )
}

export default function GameAchievementsPage() {
  const { token, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams<{ platform: string; id: string }>()
  const [data, setData] = useState<GameAchievementsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!authLoading && !token) { router.push('/login'); return }
    if (!token || !params) return

    gamesApi
      .gameAchievements(params.platform, params.id)
      .then(result => setData(result))
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) router.push('/login')
        else if (err instanceof ApiError && err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [token, authLoading, params, router])

  const unlockedCount = data ? data.items.filter(a => a.unlocked).length : 0

  if (loading) {
    return <p className="text-pixel-muted font-mono">LOADING...</p>
  }

  if (notFound) {
    return (
      <PixelCard>
        <div className="text-center py-8 space-y-3">
          <p className="text-pixel-muted font-mono text-sm">Game not found.</p>
          <Link href="/juegos" className="text-pixel-cyan font-mono text-xs hover:underline">
            ← VOLVER A JUEGOS
          </Link>
        </div>
      </PixelCard>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/juegos" className="text-pixel-muted font-mono text-xs hover:text-pixel-cyan transition-colors">
          ← JUEGOS
        </Link>
      </div>

      <PixelCard className="space-y-3">
        <div className="flex items-start gap-4">
          {data.game.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.game.image_url} alt={data.game.title} className="w-16 h-16 object-contain flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 bg-pixel-border flex items-center justify-center text-pixel-muted flex-shrink-0 text-2xl">◻</div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-pixel-cyan font-mono text-lg">{data.game.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <PlatformBadge platform={data.game.platform as 'steam' | 'retroachievements'} />
              <span className="text-pixel-muted font-mono text-xs">
                {unlockedCount} / {data.game.total_achievements} logros
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar value={unlockedCount} max={data.game.total_achievements} showLabel={false} />
            </div>
          </div>
        </div>
      </PixelCard>

      {/* Achievement list */}
      <PixelCard>
        {data.items.length === 0 ? (
          <p className="text-pixel-muted font-mono text-sm text-center py-8">No achievements found.</p>
        ) : (
          data.items.map(ach => (
            <AchievementRow key={ach.achievement_id} ach={ach} />
          ))
        )}
      </PixelCard>
    </div>
  )
}
