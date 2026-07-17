'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { auth as authApi } from '@/lib/api'

export function EmailVerificationBanner() {
  const { user } = useAuth()
  const [sent, setSent] = useState(false)

  if (!user) return null

  // If user has no email (OAuth-only), no banner needed
  if (!user.email) return null

  if (user.email_verified) return null

  async function handleResend() {
    try {
      await authApi.resendVerification()
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } catch {
      // silently fail — rate limit or other error
    }
  }

  return (
    <div className="bg-pixel-surface border-b border-pixel-red px-4 py-2 flex items-center justify-between gap-4">
      <p className="text-pixel-muted text-xs font-mono">
        Verifica tu correo para conectar plataformas y sincronizar.
      </p>
      <button
        onClick={handleResend}
        disabled={sent}
        className="text-pixel-red text-xs font-mono hover:text-pixel-cyan transition-colors whitespace-nowrap disabled:opacity-50"
      >
        {sent ? '¡Enviado!' : '[ Reenviar ]'}
      </button>
    </div>
  )
}
