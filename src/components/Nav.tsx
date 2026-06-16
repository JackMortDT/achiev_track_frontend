'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const NAV_ITEMS = [
  { href: '/', label: 'INICIO', exact: true },
  { href: '/perfil', label: 'PERFIL', exact: false },
  { href: '/juegos', label: 'JUEGOS', exact: false },
  { href: '/amigos', label: 'AMIGOS', exact: false },
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
        {NAV_ITEMS.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`font-mono text-sm hover:text-pixel-cyan transition-colors ${
                isActive ? 'text-pixel-cyan border-b-2 border-pixel-cyan' : 'text-pixel-muted'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <Link
              href="/configuracion"
              className="flex items-center gap-2 hover:text-pixel-cyan transition-colors"
            >
              <span className="text-base leading-none">{user.avatar_url || '●'}</span>
              <span className="text-pixel-muted text-xs">{user.username}</span>
            </Link>
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
