'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const NAV_ITEMS = [
  { href: '/perfil', label: 'PERFIL' },
  { href: '/juegos', label: 'JUEGOS' },
  { href: '/amigos', label: 'AMIGOS' },
]

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  if (loading) return null

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <nav className="bg-pixel-surface border-b-2 border-pixel-border px-4 py-3 flex items-center gap-6">
      <span className="text-pixel-red font-mono text-lg font-bold mr-4">▶ RETRO</span>

      <div className="flex gap-4 flex-1">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`font-mono text-sm hover:text-pixel-cyan transition-colors ${
              pathname.startsWith(item.href)
                ? 'text-pixel-cyan border-b-2 border-pixel-cyan'
                : 'text-pixel-muted'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-pixel-muted text-xs">{user.username}</span>
            <button
              onClick={handleLogout}
              className="text-pixel-muted text-xs hover:text-pixel-red transition-colors font-mono"
            >
              [EXIT]
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
