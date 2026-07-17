'use client'

import { useState, useEffect } from 'react'
import { sync, SyncStatus, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'

interface SyncButtonProps {
  initialStatus: SyncStatus
  variant?: 'default' | 'compact'
}

export function SyncButton({ initialStatus, variant = 'default' }: SyncButtonProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState<string | null>(null)

  useEffect(() => {
    if (!status.next_available_at) {
      setCountdown(null)
      return
    }

    function updateCountdown() {
      const next = new Date(status.next_available_at!).getTime()
      const diff = Math.max(0, next - Date.now())
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setCountdown(`${mins}m ${secs}s`)
      if (diff === 0) setStatus(s => ({ ...s, allowed: true, next_available_at: null }))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [status.next_available_at])

  async function handleSync() {
    setLoading(true)
    try {
      await sync.trigger()
      const updated = await sync.status()
      setStatus(updated)
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        const updated = await sync.status()
        setStatus(updated)
      }
    } finally {
      setLoading(false)
    }
  }

  const emailUnverified = !!user?.email && user.email_verified === false
  const disabled = !status.allowed || loading || emailUnverified

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-pixel-muted text-xs whitespace-nowrap">
          {!status.allowed && countdown ? countdown : `${status.syncs_remaining}/3`}
        </span>
        <button
          onClick={handleSync}
          disabled={disabled}
          title={emailUnverified ? 'Verifica tu email para sincronizar' : undefined}
          className="border border-pixel-red text-pixel-red px-2 py-1 font-mono text-xs hover:bg-pixel-red hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {loading ? '...' : '↻ SYNC'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleSync}
        disabled={disabled}
        title={emailUnverified ? 'Verifica tu email para sincronizar' : undefined}
        className="bg-pixel-red text-white px-4 py-2 font-mono text-sm hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity whitespace-nowrap"
      >
        {loading ? 'SYNCING...' : '[ SYNC NOW ]'}
      </button>
      <span className="text-pixel-muted text-xs whitespace-nowrap">
        {!status.allowed && countdown
          ? `Rate limited — next in ${countdown}`
          : `${status.syncs_remaining}/3 syncs remaining`}
      </span>
    </div>
  )
}
