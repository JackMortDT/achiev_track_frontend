import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { Nav } from '@/components/Nav'
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner'

export const metadata: Metadata = {
  title: 'RetroPlatform',
  description: 'Track achievements across Steam and RetroAchievements',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'RETRO',
    statusBarStyle: 'black-translucent',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#e94560',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-pixel-bg min-h-screen">
        <AuthProvider>
          <Nav />
          <EmailVerificationBanner />
          <main className="container mx-auto px-4 py-6 max-w-5xl pb-24 md:pb-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
