import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/8" style={{ zIndex: 10 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #9333ea, #3b82f6)' }}>
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span
              className="font-orbitron font-bold text-lg tracking-widest"
              style={{
                background: 'linear-gradient(135deg, #fff 0%, #c084fc 50%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              FBO MOVIES
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-white/40">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/movies" className="hover:text-white transition-colors">Movies</Link>
            <Link href="/tv" className="hover:text-white transition-colors">TV Shows</Link>
            <Link href="/search" className="hover:text-white transition-colors">Search</Link>
          </nav>

          <p className="text-white/25 text-xs text-center">
            © {new Date().getFullYear()} FBO Movies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
