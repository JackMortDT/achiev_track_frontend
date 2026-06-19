'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import {
  profile as profileApi, profileCustomization, games, achievements,
  Profile, ShowcaseGame, ShowcaseAchievement, Game, Achievement, ApiError
} from '@/lib/api'
import { useSSE } from '@/lib/useSSE'
import { PixelCard } from '@/components/PixelCard'
import { PlatformBadge } from '@/components/PlatformBadge'
import { SyncButton } from '@/components/SyncButton'
import { NotificationToast } from '@/components/NotificationToast'
import { ShowcasePicker } from '@/components/ShowcasePicker'

type PickerState =
  | { mode: 'closed' }
  | { mode: 'favorite-game' }
  | { mode: 'game-showcase'; current: string[] }
  | { mode: 'achievement-showcase'; current: string[] }

export default function PerfilPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [picker, setPicker] = useState<PickerState>({ mode: 'closed' })
  const [gamesList, setGamesList] = useState<Game[]>([])
  const [achievementsList, setAchievementsList] = useState<Achievement[]>([])
  const sseMessages = useSSE(!!user)

  function loadProfile() {
    profileApi.get()
      .then(setData)
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) router.push('/login')
        else setError('Error al cargar el perfil')
      })
  }

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!user) return
    loadProfile()
    games.list().then(setGamesList)
    achievements.list({ per_page: 200, sort: 'points' }).then(r => setAchievementsList(r.items))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  async function handleSetFavoriteGame(ids: string[]) {
    await profileCustomization.setFavoriteGame(ids[0] ?? null)
    setPicker({ mode: 'closed' })
    loadProfile()
  }

  async function handleSetGameShowcase(ids: string[]) {
    await profileCustomization.setGameShowcase(ids)
    setPicker({ mode: 'closed' })
    loadProfile()
  }

  async function handleSetAchievementShowcase(ids: string[]) {
    await profileCustomization.setAchievementShowcase(ids)
    setPicker({ mode: 'closed' })
    loadProfile()
  }

  if (error) return <div className="text-pixel-red font-mono p-8">{error}</div>
  if (authLoading || !data) return <div className="text-pixel-muted font-mono p-8">LOADING...</div>

  const { user: profileUser, stats, platforms, sync_status, customization } = data

  return (
    <div className="space-y-6">
      <NotificationToast messages={sseMessages} />

      {/* Header */}
      <PixelCard className="flex items-center gap-6">
        <div className="w-16 h-16 bg-pixel-border flex items-center justify-center text-pixel-cyan text-2xl">
          {profileUser.avatar_url || '●'}
        </div>
        <div>
          <h1 className="text-pixel-cyan text-xl font-mono">{profileUser.username}</h1>
          <p className="text-pixel-muted text-xs">Miembro desde {new Date(profileUser.inserted_at).getFullYear()}</p>
          <div className="flex gap-2 mt-2">
            {platforms.map(p => (
              <PlatformBadge key={p.platform} platform={p.platform} />
            ))}
          </div>
        </div>
      </PixelCard>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'POINTS', value: stats.total_points.toLocaleString() },
          { label: 'ACHIEVEMENTS', value: stats.total_achievements.toLocaleString() },
          { label: 'GAMES', value: stats.total_games.toLocaleString() },
        ].map(({ label, value }) => (
          <PixelCard key={label} className="text-center">
            <div className="text-pixel-cyan text-2xl font-mono">{value}</div>
            <div className="text-pixel-muted text-xs mt-1">{label}</div>
          </PixelCard>
        ))}
      </div>

      {/* Favorite Game */}
      <PixelCard>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-pixel-text text-sm font-mono">JUEGO FAVORITO</h2>
          <button
            onClick={() => setPicker({ mode: 'favorite-game' })}
            className="text-pixel-muted text-xs font-mono border border-pixel-border px-2 py-0.5 hover:border-pixel-cyan hover:text-pixel-cyan"
          >
            [EDITAR]
          </button>
        </div>
        {customization.favorite_game
          ? <FavoriteGameCard game={customization.favorite_game} />
          : <p className="text-pixel-muted text-xs">Sin juego favorito. Haz clic en EDITAR para elegir uno.</p>}
      </PixelCard>

      {/* Game Showcase */}
      <PixelCard>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-pixel-text text-sm font-mono">EXPOSITOR DE JUEGOS</h2>
          <button
            onClick={() => setPicker({
              mode: 'game-showcase',
              current: customization.game_showcase.map(g => g.id)
            })}
            className="text-pixel-muted text-xs font-mono border border-pixel-border px-2 py-0.5 hover:border-pixel-cyan hover:text-pixel-cyan"
          >
            [EDITAR]
          </button>
        </div>
        {customization.game_showcase.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {customization.game_showcase.map(g => (
              <ShowcaseGameCard key={g.id} game={g} />
            ))}
          </div>
        ) : (
          <p className="text-pixel-muted text-xs">Sin juegos en el expositor. Puedes añadir hasta 6.</p>
        )}
      </PixelCard>

      {/* Achievement Showcase */}
      <PixelCard>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-pixel-text text-sm font-mono">LOGROS DESTACADOS</h2>
          <button
            onClick={() => setPicker({
              mode: 'achievement-showcase',
              current: customization.achievement_showcase.map(a => a.id)
            })}
            className="text-pixel-muted text-xs font-mono border border-pixel-border px-2 py-0.5 hover:border-pixel-cyan hover:text-pixel-cyan"
          >
            [EDITAR]
          </button>
        </div>
        {customization.achievement_showcase.length > 0 ? (
          <div className="space-y-2">
            {customization.achievement_showcase.map(a => (
              <ShowcaseAchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        ) : (
          <p className="text-pixel-muted text-xs">Sin logros destacados. Puedes añadir hasta 5.</p>
        )}
      </PixelCard>

      {/* Sync */}
      <PixelCard>
        <h2 className="text-pixel-text text-sm font-mono mb-3">SINCRONIZAR</h2>
        <SyncButton initialStatus={sync_status} />
      </PixelCard>

      {/* Pickers */}
      {picker.mode === 'favorite-game' && (
        <ShowcasePicker
          mode="single-game"
          maxSelect={1}
          items={gamesList}
          onConfirm={handleSetFavoriteGame}
          onClose={() => setPicker({ mode: 'closed' })}
        />
      )}
      {picker.mode === 'game-showcase' && (
        <ShowcasePicker
          mode="multi-game"
          maxSelect={6}
          initialSelected={picker.current}
          items={gamesList}
          onConfirm={handleSetGameShowcase}
          onClose={() => setPicker({ mode: 'closed' })}
        />
      )}
      {picker.mode === 'achievement-showcase' && (
        <ShowcasePicker
          mode="multi-achievement"
          maxSelect={5}
          initialSelected={picker.current}
          items={achievementsList}
          onConfirm={handleSetAchievementShowcase}
          onClose={() => setPicker({ mode: 'closed' })}
        />
      )}
    </div>
  )
}

function FavoriteGameCard({ game }: { game: ShowcaseGame }) {
  const pct = game.total_achievements > 0
    ? Math.round((game.unlocked_count / game.total_achievements) * 100)
    : 0
  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-pixel-surface border border-pixel-border flex items-center justify-center flex-shrink-0">
        {game.image_url
          ? <img src={game.image_url} alt={game.title} className="w-full h-full object-cover" />
          : <span className="text-pixel-muted text-xs">?</span>}
      </div>
      <div className="flex-1">
        <p className="text-pixel-cyan text-sm font-mono">{game.title}</p>
        <p className="text-pixel-muted text-xs mt-0.5">{game.platform.toUpperCase()}</p>
        <div className="mt-1">
          <div className="h-1 bg-pixel-border">
            <div className="h-1 bg-pixel-cyan" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-pixel-muted text-xs mt-0.5">
            {game.unlocked_count} / {game.total_achievements} logros ({pct}%)
          </p>
        </div>
      </div>
    </div>
  )
}

function ShowcaseGameCard({ game }: { game: ShowcaseGame }) {
  const pct = game.total_achievements > 0
    ? Math.round((game.unlocked_count / game.total_achievements) * 100)
    : 0
  return (
    <div className="border border-pixel-border p-2 space-y-1">
      <div className="w-full h-12 bg-pixel-surface flex items-center justify-center overflow-hidden">
        {game.image_url
          ? <img src={game.image_url} alt={game.title} className="w-full h-full object-cover" />
          : <span className="text-pixel-muted text-xs">?</span>}
      </div>
      <p className="text-pixel-text text-xs font-mono truncate">{game.title}</p>
      <p className="text-pixel-muted text-xs">{game.unlocked_count}/{game.total_achievements}</p>
      <div className="h-1 bg-pixel-border">
        <div className="h-1 bg-pixel-cyan" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ShowcaseAchievementCard({ achievement }: { achievement: ShowcaseAchievement }) {
  return (
    <div className="flex items-center gap-3 border border-pixel-border p-2">
      <div className="w-10 h-10 bg-pixel-surface border border-pixel-border flex items-center justify-center flex-shrink-0">
        {achievement.image_url
          ? <img src={achievement.image_url} alt={achievement.name} className="w-full h-full object-cover" />
          : <span className="text-pixel-muted text-xs">🏆</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-pixel-cyan text-xs font-mono truncate">{achievement.name}</p>
        <p className="text-pixel-muted text-xs truncate">{achievement.game_title}</p>
      </div>
      <span className="text-pixel-cyan text-xs font-mono flex-shrink-0">+{achievement.points}</span>
    </div>
  )
}
