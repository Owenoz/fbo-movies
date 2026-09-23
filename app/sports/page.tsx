'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Smartphone, Tv, PlayCircle, Trophy, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function SportsPage() {
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    // Detect if user is on Android
    const userAgent = navigator.userAgent.toLowerCase()
    setIsAndroid(userAgent.includes('android'))
  }, [])

  const handleDownloadAPK = () => {
    // Create download link for the APK
    const link = document.createElement('a')
    link.href = '/apk/AK47Sports.apk'
    link.download = 'AK47Sports_v1.6_Premium.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/20 border border-green-500/30 mb-4">
            <Trophy className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-bold text-sm">LIVE SPORTS</span>
          </div>
          <h1 className="font-bold text-4xl md:text-5xl text-white mb-4">
            AK47 Sports
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Watch live sports, football matches, and sporting events from around the world
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Android App Download */}
          {isAndroid && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8 rounded-3xl border border-green-500/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-2xl">Android App</h2>
                  <p className="text-white/60 text-sm">Premium Version 1.6</p>
                </div>
              </div>
              
              <p className="text-white/80 mb-6">
                Download the AK47 Sports Premium app for the best mobile sports streaming experience. Watch live matches, replays, and highlights.
              </p>

              <ul className="space-y-3 mb-6">
                {[
                  'Live Football Matches',
                  'Basketball, Tennis & More',
                  'HD Quality Streams',
                  'Match Highlights',
                  'Schedule & Fixtures',
                  'No Ads (Premium)'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={handleDownloadAPK}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white shadow-lg shadow-green-500/40 transition-all"
              >
                <Download className="w-5 h-5" />
                Download AK47 Sports APK
              </motion.button>

              <p className="text-white/50 text-xs text-center mt-4">
                APK Size: ~25 MB • Android 5.0+
              </p>
            </motion.div>
          )}

          {/* Web Streaming Option */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-3xl border border-blue-500/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center">
                <Tv className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-2xl">Web Streaming</h2>
                <p className="text-white/60 text-sm">Watch in Browser</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-6">
              Access sports streams directly in your browser. No download required. Perfect for desktop and laptop users.
            </p>

            <div className="space-y-4 mb-6">
              <a
                href="https://sportzonline.to"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold mb-1">SportzOnline</h3>
                    <p className="text-white/60 text-sm">Live sports streaming</p>
                  </div>
                  <PlayCircle className="w-6 h-6 text-blue-400" />
                </div>
              </a>

              <a
                href="https://www.livesoccertv.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold mb-1">Live Soccer TV</h3>
                    <p className="text-white/60 text-sm">Match schedules & streams</p>
                  </div>
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
              </a>

              <a
                href="https://www.stream2watch.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold mb-1">Stream2Watch</h3>
                    <p className="text-white/60 text-sm">Multi-sport streaming</p>
                  </div>
                  <PlayCircle className="w-6 h-6 text-purple-400" />
                </div>
              </a>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-300 text-sm">
                💡 <strong>Tip:</strong> Use ad-blocker for better streaming experience
              </p>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="text-white font-bold text-2xl mb-6 text-center">What You Can Watch</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '⚽', name: 'Football', desc: 'Premier League, La Liga' },
              { icon: '🏀', name: 'Basketball', desc: 'NBA, Euroleague' },
              { icon: '🎾', name: 'Tennis', desc: 'Grand Slams, ATP' },
              { icon: '🏏', name: 'Cricket', desc: 'IPL, World Cup' },
              { icon: '🏉', name: 'Rugby', desc: 'Six Nations' },
              { icon: '🥊', name: 'Boxing', desc: 'UFC, Boxing' },
              { icon: '🏎️', name: 'Racing', desc: 'F1, MotoGP' },
              { icon: '🏐', name: 'More Sports', desc: 'Volleyball, Hockey' }
            ].map((sport, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="glass-card p-6 rounded-2xl border border-white/10 text-center hover:border-green-500/30 transition-all"
              >
                <div className="text-4xl mb-3">{sport.icon}</div>
                <h3 className="text-white font-bold mb-1">{sport.name}</h3>
                <p className="text-white/50 text-xs">{sport.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Back to Movies */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
          >
            Back to Movies
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
