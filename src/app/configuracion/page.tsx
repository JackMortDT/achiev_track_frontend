'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import {
  me as meApi, platforms as platformsApi, steamSSO,
  UserWithConnections, PlatformConnection, ApiError
} from '@/lib/api'
import { PixelCard } from '@/components/PixelCard'

const AVATARS = ['🕹️', '👾', '🎮', '🏆', '⭐', '💾', '🔥', '⚔️', '🛡️', '💀', '🌌', '🤖', '🦊', '🐉', '🎯', '🪄']

export default function ConfiguracionPage() {
  const { token, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentUser, setCurrentUser] = useState<UserWithConnections | null>(null)
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([])
  const [steamNotice, setSteamNotice] = useState<string | null>(null)

  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [avatarSaving, setAvatarSaving] = useState(false)

  const [username, setUsername] = useState('')
  const [infoSaving, setInfoSaving] = useState(false)
  const [infoError, setInfoError] = useState<string | null>(null)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !token) { router.push('/login'); return }
    if (!token) return

    const steamParam = searchParams.get('steam')
    if (steamParam === 'connected') setSteamNotice('✓ Steam vinculado correctamente')
    if (steamParam === 'error') setSteamNotice('✗ Error al vincular Steam. Inténtalo de nuevo.')

    meApi.get()
      .then(data => {
        setCurrentUser(data)
        setSelectedAvatar(data.avatar_url ?? '')
        setUsername(data.username)
        setPlatforms(data.platform_connections ?? [])
      })
      .catch(() => router.push('/login'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authLoading])

  const steamConnection = platforms.find(p => p.platform === 'steam')

  async function handleSaveAvatar() {
    setAvatarSaving(true)
    try {
      const updated = await meApi.update({ avatar_url: selectedAvatar })
      setCurrentUser(prev => prev ? { ...prev, ...updated } : prev)
    } finally {
      setAvatarSaving(false)
    }
  }

  async function handleSaveInfo() {
    setInfoError(null)
    setInfoSaving(true)
    try {
      const updated = await meApi.update({ username })
      setCurrentUser(prev => prev ? { ...prev, ...updated } : prev)
    } catch (err) {
      if (err instanceof ApiError) setInfoError('El nombre de usuario no está disponible o es inválido.')
    } finally {
      setInfoSaving(false)
    }
  }

  async function handleChangePassword() {
    setPwError(null)
    setPwSuccess(false)
    if (newPw !== confirmPw) { setPwError('Las contraseñas no coinciden.'); return }
    if (newPw.length < 6) { setPwError('La contraseña debe tener al menos 6 caracteres.'); return }
    setPwSaving(true)
    try {
      await meApi.updatePassword(currentPw, newPw)
      setPwSuccess(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch {
      setPwError('Contraseña actual incorrecta.')
    } finally {
      setPwSaving(false)
    }
  }

  async function handleLinkSteam() {
    try {
      const { steam_url } = await steamSSO.getInitiateUrl()
      window.location.href = steam_url
    } catch {
      setSteamNotice('✗ No se pudo iniciar la vinculación con Steam.')
    }
  }

  async function handleDisconnect(platform: 'steam' | 'retroachievements') {
    await platformsApi.disconnect(platform)
    setPlatforms(prev => prev.filter(p => p.platform !== platform))
  }

  async function handleDeleteAccount() {
    if (!confirm('¿Seguro que quieres eliminar tu cuenta? Esta acción es irreversible.')) return
    await meApi.delete()
    logout()
    router.push('/register')
  }

  if (authLoading || !currentUser) {
    return <div className="text-pixel-muted font-mono p-8">LOADING...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-pixel-cyan text-xs uppercase tracking-widest border-l-2 border-pixel-red pl-3">
        Configuración de cuenta
      </h1>

      {steamNotice && (
        <div className={`border p-3 text-xs font-mono ${
          steamNotice.startsWith('✓')
            ? 'border-pixel-cyan text-pixel-cyan'
            : 'border-pixel-red text-pixel-red'
        }`}>
          {steamNotice}
        </div>
      )}

      {/* Avatar */}
      <PixelCard>
        <p className="text-pixel-muted text-xs uppercase tracking-widest mb-4">Avatar</p>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full border-2 border-pixel-cyan flex items-center justify-center text-3xl">
            {selectedAvatar || '●'}
          </div>
          <div>
            <p className="text-pixel-text text-xs">Avatar actual: {selectedAvatar || 'Sin avatar'}</p>
            <p className="text-pixel-muted text-xs mt-1">Elige un avatar de la galería</p>
          </div>
        </div>
        <div className="grid grid-cols-8 gap-2 mb-4">
          {AVATARS.map(emoji => (
            <button
              key={emoji}
              onClick={() => setSelectedAvatar(emoji)}
              className={`aspect-square rounded-full border-2 flex items-center justify-center text-xl transition-colors
                ${selectedAvatar === emoji
                  ? 'border-pixel-cyan'
                  : 'border-pixel-border hover:border-pixel-cyan'}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setSelectedAvatar(currentUser.avatar_url ?? '')}
            className="text-pixel-muted text-xs border border-pixel-border px-4 py-2 font-mono"
          >
            CANCELAR
          </button>
          <button
            onClick={handleSaveAvatar}
            disabled={avatarSaving}
            className="bg-pixel-red text-white text-xs px-5 py-2 font-mono disabled:opacity-50"
          >
            {avatarSaving ? 'GUARDANDO...' : 'GUARDAR AVATAR'}
          </button>
        </div>
      </PixelCard>

      {/* Información de cuenta */}
      <PixelCard>
        <p className="text-pixel-muted text-xs uppercase tracking-widest mb-4">Información de cuenta</p>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-pixel-muted text-xs uppercase tracking-wide block mb-1">
              Nombre de usuario
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-text font-mono text-xs p-2 focus:border-pixel-cyan outline-none"
            />
            <p className="text-pixel-muted text-xs mt-1">Entre 2 y 30 caracteres.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-pixel-muted text-xs uppercase tracking-wide block mb-1">
                Correo electrónico{' '}
                <span className="border border-pixel-border px-1 normal-case">solo lectura</span>
              </label>
              <input
                readOnly
                value={currentUser.email}
                className="w-full bg-pixel-surface border-2 border-pixel-border text-pixel-muted font-mono text-xs p-2 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-pixel-muted text-xs uppercase tracking-wide block mb-1">
                Miembro desde{' '}
                <span className="border border-pixel-border px-1 normal-case">solo lectura</span>
              </label>
              <input
                readOnly
                value={new Date(currentUser.inserted_at).getFullYear().toString()}
                className="w-full bg-pixel-surface border-2 border-pixel-border text-pixel-muted font-mono text-xs p-2 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
        {infoError && <p className="text-pixel-red text-xs mb-2">{infoError}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => { setUsername(currentUser.username); setInfoError(null) }}
            className="text-pixel-muted text-xs border border-pixel-border px-4 py-2 font-mono"
          >
            CANCELAR
          </button>
          <button
            onClick={handleSaveInfo}
            disabled={infoSaving}
            className="bg-pixel-red text-white text-xs px-5 py-2 font-mono disabled:opacity-50"
          >
            {infoSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </PixelCard>

      {/* Métodos de inicio de sesión */}
      <PixelCard>
        <p className="text-pixel-muted text-xs uppercase tracking-widest mb-4">
          Métodos de inicio de sesión
        </p>
        <div className="divide-y divide-pixel-border">
          <div className="flex items-center gap-3 py-3">
            <span className="text-base">✉️</span>
            <span className="flex-1 text-pixel-text text-xs">Email + contraseña</span>
            <span className="border border-pixel-cyan text-pixel-cyan text-xs px-2 py-0.5">ACTIVO</span>
          </div>
          <div className="flex items-center gap-3 py-3">
            <span className="text-base">🎮</span>
            <div className="flex-1">
              <p className="text-pixel-text text-xs">Steam</p>
              {steamConnection
                ? <p className="text-pixel-muted text-xs mt-0.5">ID: {steamConnection.external_id}</p>
                : <p className="text-pixel-muted text-xs mt-0.5">No vinculado</p>}
            </div>
            {!steamConnection && (
              <button
                onClick={handleLinkSteam}
                className="border-2 border-pixel-cyan text-pixel-cyan font-mono text-xs px-3 py-1"
              >
                ▶ VINCULAR CON STEAM
              </button>
            )}
          </div>
        </div>
        <p className="text-pixel-muted text-xs mt-3">
          Al vincular Steam serás redirigido a Steam para autorizar.
          Tu biblioteca se sincronizará automáticamente.
        </p>
      </PixelCard>

      {/* Plataformas para sync */}
      <PixelCard>
        <p className="text-pixel-muted text-xs uppercase tracking-widest mb-4">Plataformas para sync</p>
        {platforms.length === 0 && (
          <p className="text-pixel-muted text-xs">Sin plataformas conectadas.</p>
        )}
        <div className="divide-y divide-pixel-border">
          {platforms.map(p => (
            <div key={p.platform} className="flex items-center gap-3 py-3">
              <span className="text-base">{p.platform === 'steam' ? '🎮' : '🕹️'}</span>
              <div className="flex-1">
                <p className="text-pixel-text text-xs">
                  {p.platform === 'retroachievements' ? 'RetroAchievements' : 'Steam'}{' '}
                  <span className="border border-pixel-cyan text-pixel-cyan text-xs px-1">✓</span>
                </p>
                <p className="text-pixel-muted text-xs mt-0.5">ID: {p.external_id}</p>
              </div>
              <button
                onClick={() => handleDisconnect(p.platform as 'steam' | 'retroachievements')}
                className="text-pixel-muted text-xs border border-pixel-border px-3 py-1 font-mono hover:border-pixel-red hover:text-pixel-red"
              >
                DESCONECTAR
              </button>
            </div>
          ))}
        </div>
      </PixelCard>

      {/* Seguridad */}
      <PixelCard>
        <p className="text-pixel-muted text-xs uppercase tracking-widest mb-4">Seguridad</p>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-pixel-muted text-xs uppercase tracking-wide block mb-1">
              Contraseña actual
            </label>
            <input
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-text font-mono text-xs p-2 focus:border-pixel-cyan outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-pixel-muted text-xs uppercase tracking-wide block mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-text font-mono text-xs p-2 focus:border-pixel-cyan outline-none"
              />
            </div>
            <div>
              <label className="text-pixel-muted text-xs uppercase tracking-wide block mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-text font-mono text-xs p-2 focus:border-pixel-cyan outline-none"
              />
            </div>
          </div>
        </div>
        {pwError && <p className="text-pixel-red text-xs mb-2">{pwError}</p>}
        {pwSuccess && <p className="text-pixel-cyan text-xs mb-2">✓ Contraseña cambiada correctamente.</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => { setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPwError(null); setPwSuccess(false) }}
            className="text-pixel-muted text-xs border border-pixel-border px-4 py-2 font-mono"
          >
            CANCELAR
          </button>
          <button
            onClick={handleChangePassword}
            disabled={pwSaving}
            className="bg-pixel-red text-white text-xs px-5 py-2 font-mono disabled:opacity-50"
          >
            {pwSaving ? 'GUARDANDO...' : 'CAMBIAR CONTRASEÑA'}
          </button>
        </div>
      </PixelCard>

      {/* Zona de peligro */}
      <PixelCard className="border-red-900/30">
        <p className="text-pixel-red text-xs uppercase tracking-widest mb-4">Zona de peligro</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-pixel-text text-xs mb-1">Eliminar cuenta</p>
            <p className="text-pixel-muted text-xs">Borra permanentemente tu cuenta y todos tus datos.</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="border-2 border-pixel-red text-pixel-red font-mono text-xs px-3 py-1 hover:bg-pixel-red hover:text-white transition-colors"
          >
            ELIMINAR
          </button>
        </div>
      </PixelCard>
    </div>
  )
}
