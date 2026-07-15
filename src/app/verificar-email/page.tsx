'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { auth as authApi } from '@/lib/api'
import { PixelCard } from '@/components/PixelCard'

function VerificarEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  async function handleResend() {
    try {
      await authApi.resendVerification()
      setResent(true)
    } catch { /* ignore */ }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <PixelCard>
        {status === 'loading' && (
          <p className="text-pixel-muted font-mono text-xs">VERIFICANDO...</p>
        )}
        {status === 'success' && (
          <div className="space-y-3">
            <p className="text-pixel-cyan font-mono text-sm">✓ Email verificado</p>
            <p className="text-pixel-muted text-xs font-mono">Ya puedes conectar tus plataformas y sincronizar.</p>
            <Link href="/" className="text-pixel-red text-xs font-mono hover:text-pixel-cyan">→ Ir al inicio</Link>
          </div>
        )}
        {status === 'error' && (
          <div className="space-y-3">
            <p className="text-pixel-red font-mono text-sm">Token inválido o expirado</p>
            <p className="text-pixel-muted text-xs font-mono">El enlace de verificación no es válido o ya expiró.</p>
            {!resent ? (
              <button onClick={handleResend} className="text-pixel-red text-xs font-mono hover:text-pixel-cyan">
                [ Reenviar email ]
              </button>
            ) : (
              <p className="text-pixel-cyan text-xs font-mono">¡Email enviado! Revisa tu bandeja.</p>
            )}
          </div>
        )}
      </PixelCard>
    </div>
  )
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto mt-16">
        <PixelCard>
          <p className="text-pixel-muted font-mono text-xs">VERIFICANDO...</p>
        </PixelCard>
      </div>
    }>
      <VerificarEmailContent />
    </Suspense>
  )
}
