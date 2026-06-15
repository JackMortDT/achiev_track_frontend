'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { profile as profileApi, Profile, ApiError } from '@/lib/api'
import { useSSE } from '@/lib/useSSE'
import { PixelCard } from '@/components/PixelCard'
import { PlatformBadge } from '@/components/PlatformBadge'
import { SyncButton } from '@/components/SyncButton'
import { NotificationToast } from '@/components/NotificationToast'

export default function PerfilPage() {
  const { token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const sseMessages = useSSE(token)

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login')
      return
    }
    if (!token) return

    profileApi.get()
      .then(setData)
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) {
          router.push('/login')
        } else {
          setError('Failed to load profile')
        }
      })
  }, [token, authLoading, router])

  if (error) {
    return <div className="text-pixel-red font-mono p-8">{error}</div>
  }

  if (authLoading || !data) {
    return <div className="text-pixel-muted font-mono p-8">LOADING...</div>
  }

  const { user, stats, platforms, sync_status } = data

  return (
    <div className="space-y-6">
      <NotificationToast messages={sseMessages} />

      {/* Header */}
      <PixelCard className="flex items-center gap-6">
        <div className="w-16 h-16 bg-pixel-border flex items-center justify-center text-pixel-cyan text-2xl">
          {user.avatar_url
            // Avatar URLs are user-generated content from external CDNs (Steam, RetroAchievements).
            // Using plain <img> intentionally — next/image requires remotePatterns to be configured
            // per hostname, which is not feasible for arbitrary user avatar CDNs.
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
            : '●'}
        </div>
        <div>
          <h1 className="text-pixel-cyan text-xl font-mono">{user.username}</h1>
          <p className="text-pixel-muted text-xs">Member since {new Date(user.inserted_at).getFullYear()}</p>
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

      {/* Sync */}
      <PixelCard>
        <h2 className="text-pixel-text text-sm font-mono mb-3">SYNCHRONIZE</h2>
        <SyncButton initialStatus={sync_status} />
      </PixelCard>
    </div>
  )
}
