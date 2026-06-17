'use client'

import { useState, FormEvent } from 'react'
import { platforms as platformsApi, steamSSO, PlatformConnection, ApiError } from '@/lib/api'
import { PixelCard } from '@/components/PixelCard'
import { PlatformBadge } from '@/components/PlatformBadge'

interface PlatformConnectProps {
  connections: PlatformConnection[]
  onUpdate: () => void
}

const RA_CONFIG = {
  label: 'RetroAchievements',
  idLabel: 'Usuario de RA',
  idPlaceholder: 'TuUsuarioRA',
  idHint: 'Tu nombre de usuario en retroachievements.org',
  keyLabel: 'Clave de API de RA',
  keyPlaceholder: 'Desde retroachievements.org/settings',
}

export function PlatformConnect({ connections, onUpdate }: PlatformConnectProps) {
  const [showRAForm, setShowRAForm] = useState(false)
  const [externalId, setExternalId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [steamLoading, setSteamLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steamConn = connections.find(c => c.platform === 'steam')
  const raConn = connections.find(c => c.platform === 'retroachievements')

  async function handleConnectRA(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await platformsApi.connect('retroachievements', externalId, apiKey || undefined)
      setShowRAForm(false)
      setExternalId('')
      setApiKey('')
      onUpdate()
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { errors?: Record<string, string[]>; error?: string }
        const msg = data?.errors
          ? Object.entries(data.errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ')
          : data?.error ?? 'Error al conectar la plataforma'
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect(platform: 'steam' | 'retroachievements') {
    setError(null)
    try {
      await platformsApi.disconnect(platform)
      onUpdate()
    } catch {
      setError('Error al desconectar la plataforma')
    }
  }

  async function handleLinkSteam() {
    setSteamLoading(true)
    try {
      const { steam_url } = await steamSSO.getInitiateUrl()
      window.location.href = steam_url
    } catch {
      setError('No se pudo iniciar la vinculación con Steam')
      setSteamLoading(false)
    }
  }

  return (
    <PixelCard>
      <h2 className="text-pixel-text text-sm font-mono mb-4">PLATAFORMAS</h2>

      {error && (
        <div role="alert" className="p-2 border border-pixel-red text-pixel-red text-xs font-mono mb-3">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Steam */}
        <div className="flex items-center gap-3">
          <PlatformBadge platform="steam" />
          {steamConn ? (
            <>
              <span className="text-pixel-muted text-xs font-mono flex-1">{steamConn.external_id}</span>
              <span className="text-pixel-cyan text-xs font-mono">✓ CONECTADO</span>
              <button
                onClick={() => handleDisconnect('steam')}
                className="text-xs font-mono text-pixel-muted hover:text-pixel-red transition-colors"
              >
                [ELIMINAR]
              </button>
            </>
          ) : (
            <>
              <span className="text-pixel-muted text-xs font-mono flex-1">No conectado</span>
              <button
                onClick={handleLinkSteam}
                disabled={steamLoading}
                className="text-xs font-mono text-pixel-muted hover:text-pixel-cyan border border-pixel-border hover:border-pixel-cyan px-2 py-0.5 transition-colors disabled:opacity-50"
              >
                {steamLoading ? 'REDIRIGIENDO...' : '[CONECTAR]'}
              </button>
            </>
          )}
        </div>

        {/* RetroAchievements */}
        <div className="flex items-center gap-3">
          <PlatformBadge platform="retroachievements" />
          {raConn ? (
            <>
              <span className="text-pixel-muted text-xs font-mono flex-1">{raConn.external_id}</span>
              <span className="text-pixel-cyan text-xs font-mono">✓ CONECTADO</span>
              <button
                onClick={() => handleDisconnect('retroachievements')}
                className="text-xs font-mono text-pixel-muted hover:text-pixel-red transition-colors"
              >
                [ELIMINAR]
              </button>
            </>
          ) : (
            <>
              <span className="text-pixel-muted text-xs font-mono flex-1">No conectado</span>
              <button
                onClick={() => { setShowRAForm(true); setError(null) }}
                className="text-xs font-mono text-pixel-muted hover:text-pixel-cyan border border-pixel-border hover:border-pixel-cyan px-2 py-0.5 transition-colors"
              >
                [CONECTAR]
              </button>
            </>
          )}
        </div>
      </div>

      {/* RetroAchievements form */}
      {showRAForm && (
        <form onSubmit={handleConnectRA} className="border-t border-pixel-border pt-4 mt-4 space-y-3">
          <p className="text-pixel-cyan text-xs font-mono">Conectar {RA_CONFIG.label}</p>

          <div>
            <label htmlFor="external-id" className="block text-pixel-muted text-xs mb-1">
              {RA_CONFIG.idLabel}
            </label>
            <input
              id="external-id"
              type="text"
              value={externalId}
              onChange={e => setExternalId(e.target.value)}
              placeholder={RA_CONFIG.idPlaceholder}
              required
              className="w-full bg-pixel-bg border border-pixel-border p-2 text-pixel-text font-mono text-xs focus:border-pixel-cyan focus:outline-none"
            />
            <p className="text-pixel-muted text-xs mt-1">{RA_CONFIG.idHint}</p>
          </div>

          <div>
            <label htmlFor="api-key" className="block text-pixel-muted text-xs mb-1">
              {RA_CONFIG.keyLabel}
            </label>
            <input
              id="api-key"
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={RA_CONFIG.keyPlaceholder}
              required
              className="w-full bg-pixel-bg border border-pixel-border p-2 text-pixel-text font-mono text-xs focus:border-pixel-cyan focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-pixel-red text-white px-4 py-2 font-mono text-xs hover:bg-opacity-80 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'CONECTANDO...' : '[ GUARDAR ]'}
            </button>
            <button
              type="button"
              onClick={() => { setShowRAForm(false); setError(null); setExternalId(''); setApiKey('') }}
              className="px-4 py-2 font-mono text-xs text-pixel-muted border border-pixel-border hover:border-pixel-cyan transition-colors"
            >
              [ CANCELAR ]
            </button>
          </div>
        </form>
      )}

      <p className="text-pixel-muted text-xs mt-4">
        Steam se vincula mediante SSO — serás redirigido a Steam para autorizar.
      </p>
    </PixelCard>
  )
}
