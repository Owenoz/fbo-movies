import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GalaxyBackground from '@/components/GalaxyBackground'
import { AuthProvider } from '@/lib/AuthContext'

export const metadata: Metadata = {
  title: { default: 'FBO Movies', template: '%s | FBO Movies' },
  description: 'Watch 462+ VJ-translated Ugandan movies with full streaming. Install as an app on your phone.',
  keywords: ['movies', 'tv shows', 'vj', 'uganda', 'fbo movies', 'kawogo', 'vj junior', 'vj emmy', 'vj mark'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FBO Movies',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#9333ea',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FBO Movies" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-[#0d001a] text-white antialiased">
        <AuthProvider>
          <GalaxyBackground />
          <Navbar />
          <main className="relative pt-16 min-h-screen" style={{ zIndex: 10 }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('[PWA] Service Worker registered'))
                  .catch(err => console.log('[PWA] Service Worker registration failed:', err));
              });
            }
          `
        }} />
      </body>
    </html>
  )
}
