'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import {
  friends as friendsApi,
  Friend, LeaderboardEntry, CompareData, ApiError
} from '@/lib/api'
import { PixelCard } from '@/components/PixelCard'
import { ProgressBar } from '@/components/ProgressBar'

type TabType = 'leaderboard' | 'compare' | 'manage'

export default function AmigosPage() {
  const { token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<TabType>('leaderboard')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [friendsList, setFriendsList] = useState<Friend[]>([])
  const [compareData, setCompareData] = useState<CompareData | null>(null)
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [addUsername, setAddUsername] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !token) { router.push('/login'); return }
    if (!token) return

    Promise.all([
      friendsApi.leaderboard(),
      friendsApi.list(),
      friendsApi.pending(),
    ])
      .then(([lb, fl, pr]) => {
        setLeaderboard(lb)
        setFriendsList(fl)
        setPendingRequests(pr)
      })
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) router.push('/login')
      })
      .finally(() => setLoading(false))
  }, [token, authLoading, router])

  async function handleCompare(userId: string) {
    setCompareData(null)
    setTab('compare')
    setActionError(null)
    try {
      const data = await friendsApi.compare(userId)
      setCompareData(data)
    } catch {
      setActionError('Error al cargar la comparación')
    }
  }

  async function handleAddFriend(e: React.FormEvent) {
    e.preventDefault()
    setAddError(null)
    try {
      await friendsApi.add(addUsername)
      setAddUsername('')
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { error?: string }
        setAddError(data?.error ?? 'Error al enviar la solicitud')
      }
    }
  }

  async function handleAccept(friendshipId: string) {
    setActionError(null)
    try {
      await friendsApi.accept(friendshipId)
      const [lb, fl, pr] = await Promise.all([
        friendsApi.leaderboard(),
        friendsApi.list(),
        friendsApi.pending(),
      ])
      setLeaderboard(lb)
      setFriendsList(fl)
      setPendingRequests(pr)
    } catch {
      setActionError('Error al aceptar la solicitud')
    }
  }

  async function handleRemove(friendshipId: string) {
    setActionError(null)
    try {
      await friendsApi.remove(friendshipId)
      const [lb, fl] = await Promise.all([friendsApi.leaderboard(), friendsApi.list()])
      setLeaderboard(lb)
      setFriendsList(fl)
    } catch {
      setActionError('Error al eliminar amigo')
    }
  }

  if (authLoading || loading) {
    return <div className="text-pixel-muted font-mono p-8">LOADING...</div>
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div role="alert" className="p-2 border border-pixel-red text-pixel-red text-sm font-mono">
          {actionError}
        </div>
      )}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-pixel-cyan text-xl font-mono">AMIGOS</h1>
        <div className="flex gap-2">
          {(['leaderboard', 'compare', 'manage'] as TabType[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 text-xs font-mono border transition-colors ${
                tab === t
                  ? 'border-pixel-cyan text-pixel-cyan bg-pixel-surface'
                  : 'border-pixel-border text-pixel-muted hover:border-pixel-cyan'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* LEADERBOARD TAB */}
      {tab === 'leaderboard' && (
        <div className="space-y-2">
          {leaderboard.length === 0 && (
            <PixelCard>
              <p className="text-pixel-muted text-sm text-center py-4">
                Add friends to see the leaderboard!
              </p>
            </PixelCard>
          )}
          {leaderboard.map(entry => (
            <PixelCard
              key={entry.user_id}
              variant={entry.is_me ? 'cyan' : 'default'}
              className="flex items-center gap-4"
            >
              <span className="text-pixel-muted font-mono text-sm w-6">#{entry.rank}</span>
              <div className="flex-1">
                <span className={`font-mono text-sm ${entry.is_me ? 'text-pixel-cyan' : 'text-pixel-text'}`}>
                  {entry.username} {entry.is_me && '(you)'}
                </span>
              </div>
              <span className="text-pixel-red font-mono text-sm">{entry.total_points.toLocaleString()} pts</span>
              {!entry.is_me && (
                <button
                  onClick={() => handleCompare(entry.user_id)}
                  className="text-xs font-mono text-pixel-muted hover:text-pixel-cyan transition-colors ml-2"
                >
                  [VS]
                </button>
              )}
            </PixelCard>
          ))}
        </div>
      )}

      {/* COMPARE TAB */}
      {tab === 'compare' && (
        <div className="space-y-4">
          {!compareData && <p className="text-pixel-muted font-mono">Select [VS] from leaderboard to compare.</p>}

          {compareData && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <PixelCard variant="cyan">
                  <h3 className="text-pixel-cyan font-mono text-sm mb-3">YOU</h3>
                  <div className="space-y-1 text-pixel-text font-mono text-xs">
                    <div>Points: <span className="text-pixel-red">{compareData.user.total_points.toLocaleString()}</span></div>
                    <div>Achievements: {compareData.user.total_achievements}</div>
                    <div>Games: {compareData.user.total_games}</div>
                  </div>
                </PixelCard>
                <PixelCard>
                  <h3 className="text-pixel-cyan font-mono text-sm mb-3">{compareData.friend.username.toUpperCase()}</h3>
                  <div className="space-y-1 text-pixel-text font-mono text-xs">
                    <div>Points: <span className="text-pixel-red">{compareData.friend.total_points.toLocaleString()}</span></div>
                    <div>Achievements: {compareData.friend.total_achievements}</div>
                    <div>Games: {compareData.friend.total_games}</div>
                  </div>
                </PixelCard>
              </div>

              {compareData.shared_games.length > 0 && (
                <>
                  <h3 className="text-pixel-text font-mono text-sm">SHARED GAMES</h3>
                  <div className="space-y-2">
                    {compareData.shared_games.map(g => (
                      <PixelCard key={`${g.platform}-${g.title}`} className="space-y-2">
                        <div className="font-mono text-sm text-pixel-text">{g.title}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-xs text-pixel-muted mb-1">YOU</div>
                            <ProgressBar value={g.user_unlocked} max={g.total} />
                          </div>
                          <div>
                            <div className="text-xs text-pixel-muted mb-1">{compareData.friend.username.toUpperCase()}</div>
                            <ProgressBar value={g.friend_unlocked} max={g.total} />
                          </div>
                        </div>
                      </PixelCard>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* MANAGE TAB */}
      {tab === 'manage' && (
        <div className="space-y-6">
          {/* Add friend */}
          <PixelCard>
            <h3 className="text-pixel-text font-mono text-sm mb-3">ADD FRIEND</h3>
            <form onSubmit={handleAddFriend} className="flex gap-2">
              <input
                type="text"
                value={addUsername}
                onChange={e => setAddUsername(e.target.value)}
                placeholder="username"
                className="flex-1 bg-pixel-bg border border-pixel-border p-2 text-pixel-text font-mono text-sm focus:border-pixel-cyan focus:outline-none"
              />
              <button
                type="submit"
                className="bg-pixel-red text-white px-4 py-2 font-mono text-sm hover:bg-opacity-80"
              >
                [ ADD ]
              </button>
            </form>
            {addError && <p role="alert" className="text-pixel-red text-xs mt-2">{addError}</p>}
          </PixelCard>

          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="text-pixel-muted font-mono text-xs mb-2">SOLICITUDES PENDIENTES</h3>
              <div className="space-y-2">
                {pendingRequests.map(req => (
                  <PixelCard key={req.friendship_id} className="flex items-center gap-3">
                    <span className="font-mono text-sm text-pixel-text flex-1">{req.username}</span>
                    <button
                      onClick={() => handleAccept(req.friendship_id)}
                      className="text-xs font-mono text-pixel-cyan border border-pixel-cyan px-2 py-1 hover:bg-pixel-cyan hover:text-pixel-bg transition-colors"
                    >
                      ACEPTAR
                    </button>
                  </PixelCard>
                ))}
              </div>
            </div>
          )}

          {/* Friends list */}
          <div>
            <h3 className="text-pixel-muted font-mono text-xs mb-2">AMIGOS</h3>
            {friendsList.length === 0 && (
              <p className="text-pixel-muted text-sm font-mono">Sin amigos aún.</p>
            )}
            <div className="space-y-2">
              {friendsList.map(f => (
                <PixelCard key={f.friendship_id} className="flex items-center gap-3">
                  <span className="font-mono text-sm text-pixel-text flex-1">{f.username}</span>
                  <button
                    onClick={() => handleCompare(f.user_id)}
                    className="text-xs font-mono text-pixel-muted hover:text-pixel-cyan transition-colors"
                  >
                    [VS]
                  </button>
                  <button
                    onClick={() => handleRemove(f.friendship_id)}
                    className="text-xs font-mono text-pixel-muted hover:text-pixel-red transition-colors"
                  >
                    [ELIMINAR]
                  </button>
                </PixelCard>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
