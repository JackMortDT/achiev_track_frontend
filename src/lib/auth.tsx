'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { auth as authApi, me, User, ApiError } from './api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    me.get()
      .then(u => setUser(u))
      .catch(err => {
        if (!(err instanceof ApiError && err.status === 401)) {
          console.error('Failed to hydrate auth state:', err)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { user: u } = await authApi.login(email, password)
    setUser(u)
  }, [])

  const register = useCallback(async (username: string, email: string, password: string) => {
    const { user: u } = await authApi.register(username, email, password)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {})
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
