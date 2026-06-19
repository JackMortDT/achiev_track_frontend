import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'RetroPlatform',
  description: 'Track achievements across Steam and RetroAchievements',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-pixel-bg min-h-screen">
        <AuthProvider>
          <Nav />
          <main className="container mx-auto px-4 py-6 max-w-5xl pb-24 md:pb-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
