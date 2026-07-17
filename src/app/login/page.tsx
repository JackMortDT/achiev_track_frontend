'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { ApiError } from '@/lib/api'
import { PixelCard } from '@/components/PixelCard'

function LoginForm() {
  const { login, loginWithSteam, loginWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('steam') === 'error' || searchParams.get('google') === 'error'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      router.push('/perfil')
    } catch (err) {
      if (err instanceof ApiError) {
        setError('Invalid email or password')
      } else {
        setError('Connection error. Is the server running?')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pixel-bg flex items-center justify-center p-4">
      <PixelCard className="w-full max-w-sm">
        <h1 className="text-pixel-cyan text-2xl mb-6 text-center">▶ LOGIN</h1>

        {error && (
          <div role="alert" className="mb-4 p-2 border border-pixel-red text-pixel-red text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-pixel-muted text-xs mb-1">EMAIL</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-pixel-bg border border-pixel-border p-2 text-pixel-text font-mono focus:border-pixel-cyan focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-pixel-muted text-xs mb-1">PASSWORD</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-pixel-bg border border-pixel-border p-2 text-pixel-text font-mono focus:border-pixel-cyan focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pixel-red text-white py-2 font-mono hover:bg-opacity-80 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'CONNECTING...' : '[ ENTER ]'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-2">
          <div className="flex-1 border-t border-pixel-border" />
          <span className="text-pixel-muted text-xs">OR</span>
          <div className="flex-1 border-t border-pixel-border" />
        </div>

        {oauthError && (
          <div role="alert" className="mb-3 p-2 border border-pixel-red text-pixel-red text-sm">
            OAuth login failed. Please try again.
          </div>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => loginWithSteam()}
            className="w-full bg-[#1b2838] text-white py-2 font-mono hover:bg-opacity-80 transition-opacity border border-pixel-border"
          >
            [ ENTRAR CON STEAM ]
          </button>
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full bg-pixel-bg border border-pixel-border text-pixel-text py-2 font-mono hover:border-pixel-cyan transition-colors"
          >
            [ ENTRAR CON GOOGLE ]
          </button>
        </div>

        <p className="mt-4 text-center text-pixel-muted text-sm">
          No account?{' '}
          <Link href="/register" className="text-pixel-cyan hover:underline">
            REGISTER
          </Link>
        </p>
      </PixelCard>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
