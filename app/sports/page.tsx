'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Maximize2, Home } from 'lucide-react'
import { initAdBlocker } from './ad-blocker'
import Link from 'next/link'

export default function SportsPage() {
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Initialize ad blocker
    initAdBlocker()
    
    // Hide loading after 2 seconds
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const toggleFullscreen = () => {
    const iframe = document.getElementById('sports-iframe')
    if (!iframe) return

    if (!document.fullscreenElement) {
      iframe.requestFullscreen().catch((err) => {
        console.log('Fullscreen error:', err)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div className="fixed inset-0 bg-black pt-16">
      {/* Loading Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-600 flex items-center justify-center"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-white font-bold text-2xl mb-2">Loading Live Sports...</h1>
              <p className="text-white/60">Please wait</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Bar */}
      {!loading && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-16 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-40 flex items-center justify-between"
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-400" />
            <h1 className="text-white font-bold text-lg">Live Sports</h1>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </motion.div>
      )}

      {/* Embedded Sports Stream */}
      <iframe
        id="sports-iframe"
        src="https://yashintv.xyz"
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        title="Live Sports"
      />
    </div>
  )
}
