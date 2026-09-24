import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GalaxyBackground from '@/components/GalaxyBackground'

export const metadata: Metadata = {
  title: { default: 'FBO Movies', template: '%s | FBO Movies' },
  description: 'Watch VJ-translated Ugandan movies with full streaming. Install as an app on your phone.',
  keywords: ['movies', 'tv shows', 'vj', 'uganda', 'fbo movies', 'kawogo', 'vj junior', 'vj emmy', 'vj mark'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FBO Movies',
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
      </head>
      <body className="bg-[#0d001a] text-white antialiased">
        <GalaxyBackground />
        <Navbar />
        <main className="relative pt-16 min-h-screen" style={{ zIndex: 10 }}>
          {children}
        </main>
        <Footer />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('[PWA] Service Worker registered'))
                  .catch(err => console.log('[PWA] Service Worker registration failed:', err));
                
                // Setup notifications after a delay
                setTimeout(() => {
                  if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission();
                  }
                }, 30000); // Ask after 30 seconds
              });
            }
          `
        }} />
      </body>
    </html>
  )
}
