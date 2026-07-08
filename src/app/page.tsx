'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { home as homeApi, HomeData, ApiError } from '@/lib/api'
import { PixelCard } from '@/components/PixelCard'
import { PlatformBadge } from '@/components/PlatformBadge'
import { ProgressBar } from '@/components/ProgressBar'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<HomeData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!user) return

    homeApi.get()
      .then(setData)
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) router.push('/login')
        else setError('Error al cargar la página de inicio')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  if (error) return <div className="text-pixel-red font-mono p-8">{error}</div>
  if (authLoading || !data) return <div className="text-pixel-muted font-mono p-8">LOADING...</div>

  const { stats, recent_achievements, active_games, popular_games } = data

  return (
    <div className="space-y-6">
      {/* Hero */}
      <PixelCard>
        <div>
          <p className="text-pixel-muted text-xs uppercase tracking-widest mb-1">Bienvenido de vuelta</p>
          <h1 className="text-pixel-cyan text-xl font-mono mb-4">{user?.username?.toUpperCase()}</h1>
          <div className="flex gap-8">
            {[
              { label: 'PUNTOS', value: stats.total_points.toLocaleString() },
              { label: 'LOGROS', value: stats.total_achievements.toLocaleString() },
              { label: 'JUEGOS', value: stats.total_games.toLocaleString() },
              ...(stats.friend_rank ? [{ label: 'ENTRE AMIGOS', value: `#${stats.friend_rank}` }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-pixel-red text-xl font-mono">{value}</div>
                <div className="text-pixel-muted text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </PixelCard>

      {/* Últimos logros */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-pixel-cyan text-xs uppercase tracking-widest border-l-2 border-pixel-red pl-3">
            Últimos logros desbloqueados
          </h2>
          <Link href="/juegos" className="text-pixel-muted text-xs hover:text-pixel-cyan">ver todos →</Link>
        </div>
        <PixelCard className="divide-y divide-pixel-border p-0">
          {recent_achievements.length === 0 && (
            <p className="text-pixel-muted text-xs p-4">Sin logros aún. ¡Sincroniza tu cuenta!</p>
          )}
          {recent_achievements.map(a => (
            <div key={a.achievement_id} className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 bg-pixel-border flex items-center justify-center flex-shrink-0">
                {a.image_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                  : <span className="text-pixel-muted text-xs">?</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-pixel-text text-xs truncate">{a.title}</p>
                <p className="text-pixel-muted text-xs mt-0.5">
                  {a.game_title} <PlatformBadge platform={a.platform as 'steam' | 'retroachievements'} />
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-pixel-muted text-xs">
                  {new Date(a.unlocked_at).toLocaleDateString()}
                </p>
                <p className="text-pixel-red text-xs">+{a.points} pts</p>
              </div>
            </div>
          ))}
        </PixelCard>
      </div>

      {/* Juegos en progreso */}
      {active_games.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-pixel-cyan text-xs uppercase tracking-widest border-l-2 border-pixel-red pl-3">
              Juegos en progreso
            </h2>
            <Link href="/juegos" className="text-pixel-muted text-xs hover:text-pixel-cyan">ver todos →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {active_games.map(g => (
              <Link key={g.external_id} href={`/juegos/${g.platform}/${g.external_id}`}>
                <PixelCard className="hover:border-pixel-cyan transition-colors cursor-pointer">
                  <div className="w-full h-14 bg-pixel-border mb-2 flex items-center justify-center">
                    {g.image_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" />
                      : <span className="text-pixel-muted text-xs">🎮</span>}
                  </div>
                  <p className="text-pixel-text text-xs truncate mb-2">{g.title}</p>
                  <ProgressBar value={g.unlocked_count} max={g.total_achievements} />
                  <div className="flex justify-between text-pixel-muted text-xs mt-1">
                    <span>{g.unlocked_count}/{g.total_achievements}</span>
                    <PlatformBadge platform={g.platform as 'steam' | 'retroachievements'} />
                  </div>
                </PixelCard>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Populares en la plataforma */}
      {popular_games.length > 0 && (
        <div>
          <h2 className="text-pixel-cyan text-xs uppercase tracking-widest border-l-2 border-pixel-red pl-3 mb-3">
            Populares en la plataforma
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {popular_games.map(g => (
              <PixelCard key={g.external_id} className="flex items-center gap-3">
                <div className="w-11 h-11 bg-pixel-border flex items-center justify-center flex-shrink-0 text-xl">
                  {g.image_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" />
                    : '🎮'}
                </div>
                <div>
                  <p className="text-pixel-text text-xs">{g.title}</p>
                  <p className="text-pixel-muted text-xs mt-1">{g.player_count} jugadores</p>
                </div>
              </PixelCard>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
