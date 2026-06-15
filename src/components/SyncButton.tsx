'use client'

import { useState, useEffect } from 'react'
import { sync, SyncStatus, ApiError } from '@/lib/api'

interface SyncButtonProps {
  initialStatus: SyncStatus
}

export function SyncButton({ initialStatus }: SyncButtonProps) {
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

  const disabled = !status.allowed || loading

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleSync}
        disabled={disabled}
        className="bg-pixel-red text-white px-4 py-2 font-mono text-sm hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {loading ? 'SYNCING...' : '[ SYNC NOW ]'}
      </button>
      <span className="text-pixel-muted text-xs">
        {!status.allowed && countdown
          ? `Rate limited — next in ${countdown}`
          : `${status.syncs_remaining}/3 syncs remaining`}
      </span>
    </div>
  )
}
