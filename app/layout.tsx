import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GalaxyBackground from '@/components/GalaxyBackground'
import { AuthProvider } from '@/lib/AuthContext'

export const metadata: Metadata = {
  title: { default: 'FBO Movies', template: '%s | FBO Movies' },
  description: 'Watch VJ-translated Ugandan movies and TV shows.',
  keywords: ['movies', 'tv shows', 'vj', 'uganda', 'fbo movies', 'kawogo'],
}

export const viewport: Viewport = {
  themeColor: '#0d001a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d001a] text-white antialiased">
        <AuthProvider>
          <GalaxyBackground />
          <Navbar />
          <main className="relative pt-16 min-h-screen" style={{ zIndex: 10 }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
