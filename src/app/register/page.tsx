'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { ApiError } from '@/lib/api'
import { PixelCard } from '@/components/PixelCard'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(username, email, password)
      router.push('/perfil')
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { errors?: Record<string, string[]> }
        const msgs = data?.errors
          ? Object.entries(data.errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ')
          : 'Registration failed'
        setError(msgs)
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
        <h1 className="text-pixel-cyan text-2xl mb-6 text-center">▶ REGISTER</h1>

        {error && (
          <div role="alert" className="mb-4 p-2 border border-pixel-red text-pixel-red text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-pixel-muted text-xs mb-1">USERNAME</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={2}
              maxLength={30}
              className="w-full bg-pixel-bg border border-pixel-border p-2 text-pixel-text font-mono focus:border-pixel-cyan focus:outline-none"
            />
          </div>
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
              minLength={6}
              className="w-full bg-pixel-bg border border-pixel-border p-2 text-pixel-text font-mono focus:border-pixel-cyan focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pixel-red text-white py-2 font-mono hover:bg-opacity-80 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'CREATING...' : '[ CREATE ACCOUNT ]'}
          </button>
        </form>

        <p className="mt-4 text-center text-pixel-muted text-sm">
          Have an account?{' '}
          <Link href="/login" className="text-pixel-cyan hover:underline">
            LOGIN
          </Link>
        </p>
      </PixelCard>
    </div>
  )
}
