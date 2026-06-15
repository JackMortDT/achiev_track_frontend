'use client'

import { useState, FormEvent } from 'react'
import { platforms as platformsApi, PlatformConnection, ApiError } from '@/lib/api'
import { PixelCard } from '@/components/PixelCard'
import { PlatformBadge } from '@/components/PlatformBadge'

interface PlatformConnectProps {
  connections: PlatformConnection[]
  onUpdate: () => void
}

const PLATFORM_CONFIG = {
  steam: {
    label: 'Steam',
    idLabel: 'Steam ID (64-bit)',
    idPlaceholder: '76561198000000000',
    idHint: 'Find it at steamidfinder.com',
    keyLabel: 'Steam Web API Key',
    keyPlaceholder: 'Your Steam API key from steamcommunity.com/dev/apikey',
    keyRequired: true,
  },
  retroachievements: {
    label: 'RetroAchievements',
    idLabel: 'RA Username',
    idPlaceholder: 'YourRAUsername',
    idHint: 'Your RetroAchievements.org username',
    keyLabel: 'RA Web API Key',
    keyPlaceholder: 'From retroachievements.org/settings',
    keyRequired: true,
  },
} as const

type Platform = keyof typeof PLATFORM_CONFIG

export function PlatformConnect({ connections, onUpdate }: PlatformConnectProps) {
  const [active, setActive] = useState<Platform | null>(null)
  const [externalId, setExternalId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectedPlatforms = new Set(connections.map(c => c.platform))

  async function handleConnect(e: FormEvent) {
    e.preventDefault()
    if (!active) return
    setError(null)
    setLoading(true)
    try {
      await platformsApi.connect(active, externalId, apiKey || undefined)
      setActive(null)
      setExternalId('')
      setApiKey('')
      onUpdate()
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { errors?: Record<string, string[]>; error?: string }
        const msg = data?.errors
          ? Object.entries(data.errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ')
          : data?.error ?? 'Failed to connect platform'
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect(platform: Platform) {
    setError(null)
    try {
      await platformsApi.disconnect(platform)
      onUpdate()
    } catch {
      setError('Failed to disconnect platform')
    }
  }

  const cfg = active ? PLATFORM_CONFIG[active] : null

  return (
    <PixelCard>
      <h2 className="text-pixel-text text-sm font-mono mb-4">PLATAFORMAS</h2>

      {/* Connected platforms */}
      <div className="space-y-2 mb-4">
        {(Object.keys(PLATFORM_CONFIG) as Platform[]).map(platform => {
          const connected = connectedPlatforms.has(platform)
          const conn = connections.find(c => c.platform === platform)
          return (
            <div key={platform} className="flex items-center gap-3">
              <PlatformBadge platform={platform} />
              {connected ? (
                <>
                  <span className="text-pixel-muted text-xs font-mono flex-1">{conn?.external_id}</span>
                  <span className="text-pixel-cyan text-xs font-mono">✓ CONNECTED</span>
                  <button
                    onClick={() => handleDisconnect(platform)}
                    className="text-xs font-mono text-pixel-muted hover:text-pixel-red transition-colors"
                  >
                    [REMOVE]
                  </button>
                </>
              ) : (
                <>
                  <span className="text-pixel-muted text-xs font-mono flex-1">Not connected</span>
                  <button
                    onClick={() => { setActive(platform); setError(null) }}
                    className="text-xs font-mono text-pixel-muted hover:text-pixel-cyan border border-pixel-border hover:border-pixel-cyan px-2 py-0.5 transition-colors"
                  >
                    [CONNECT]
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Connect form */}
      {active && cfg && (
        <form onSubmit={handleConnect} className="border-t border-pixel-border pt-4 space-y-3">
          <p className="text-pixel-cyan text-xs font-mono">Connect {cfg.label}</p>

          {error && (
            <div role="alert" className="p-2 border border-pixel-red text-pixel-red text-xs font-mono">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="external-id" className="block text-pixel-muted text-xs mb-1">
              {cfg.idLabel}
            </label>
            <input
              id="external-id"
              type="text"
              value={externalId}
              onChange={e => setExternalId(e.target.value)}
              placeholder={cfg.idPlaceholder}
              required
              className="w-full bg-pixel-bg border border-pixel-border p-2 text-pixel-text font-mono text-xs focus:border-pixel-cyan focus:outline-none"
            />
            <p className="text-pixel-muted text-xs mt-1">{cfg.idHint}</p>
          </div>

          <div>
            <label htmlFor="api-key" className="block text-pixel-muted text-xs mb-1">
              {cfg.keyLabel}
            </label>
            <input
              id="api-key"
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={cfg.keyPlaceholder}
              required={cfg.keyRequired}
              className="w-full bg-pixel-bg border border-pixel-border p-2 text-pixel-text font-mono text-xs focus:border-pixel-cyan focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-pixel-red text-white px-4 py-2 font-mono text-xs hover:bg-opacity-80 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'CONNECTING...' : '[ SAVE ]'}
            </button>
            <button
              type="button"
              onClick={() => { setActive(null); setError(null); setExternalId(''); setApiKey('') }}
              className="px-4 py-2 font-mono text-xs text-pixel-muted border border-pixel-border hover:border-pixel-cyan transition-colors"
            >
              [ CANCEL ]
            </button>
          </div>
        </form>
      )}
    </PixelCard>
  )
}
