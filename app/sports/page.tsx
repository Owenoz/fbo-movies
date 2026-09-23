'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, PlayCircle, Tv, Calendar, ArrowLeft, Maximize2, X } from 'lucide-react'
import { initAdBlocker } from './ad-blocker'
import Link from 'next/link'

interface StreamSource {
  name: string
  url: string
  quality: string
  icon: string
}

interface Match {
  id: string
  sport: string
  league: string
  home: string
  away: string
  time: string
  status: 'live' | 'upcoming'
  sources: StreamSource[]
}

export default function SportsPage() {
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [selectedSource, setSelectedSource] = useState<StreamSource | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'football' | 'basketball' | 'other'>('all')

  useEffect(() => {
    initAdBlocker()
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Mock live matches - In production, fetch from API
  const matches: Match[] = [
    {
      id: '1',
      sport: 'Football',
      league: 'Premier League',
      home: 'Manchester United',
      away: 'Liverpool',
      time: 'LIVE',
      status: 'live',
      sources: [
        { name: 'HD Stream 1', url: 'https://sportzonline.to', quality: '1080p', icon: '⚡' },
        { name: 'HD Stream 2', url: 'https://yashintv.xyz', quality: '720p', icon: '🎯' },
        { name: 'Stream 3', url: 'https://www.stream2watch.com', quality: '720p', icon: '📺' },
      ]
    },
    {
      id: '2',
      sport: 'Football',
      league: 'La Liga',
      home: 'Real Madrid',
      away: 'Barcelona',
      time: 'LIVE',
      status: 'live',
      sources: [
        { name: 'HD Stream 1', url: 'https://sportzonline.to', quality: '1080p', icon: '⚡' },
        { name: 'HD Stream 2', url: 'https://yashintv.xyz', quality: '720p', icon: '🎯' },
      ]
    },
    {
      id: '3',
      sport: 'Football',
      league: 'Champions League',
      home: 'Bayern Munich',
      away: 'PSG',
      time: '20:00',
      status: 'upcoming',
      sources: [
        { name: 'HD Stream 1', url: 'https://sportzonline.to', quality: '1080p', icon: '⚡' },
        { name: 'HD Stream 2', url: 'https://yashintv.xyz', quality: '720p', icon: '🎯' },
      ]
    },
    {
      id: '4',
      sport: 'Basketball',
      league: 'NBA',
      home: 'Lakers',
      away: 'Warriors',
      time: 'LIVE',
      status: 'live',
      sources: [
        { name: 'HD Stream 1', url: 'https://sportzonline.to', quality: '1080p', icon: '⚡' },
        { name: 'Stream 2', url: 'https://www.stream2watch.com', quality: '720p', icon: '📺' },
      ]
    },
    {
      id: '5',
      sport: 'Football',
      league: 'Serie A',
      home: 'AC Milan',
      away: 'Juventus',
      time: '18:30',
      status: 'upcoming',
      sources: [
        { name: 'HD Stream 1', url: 'https://sportzonline.to', quality: '1080p', icon: '⚡' },
        { name: 'HD Stream 2', url: 'https://yashintv.xyz', quality: '720p', icon: '🎯' },
      ]
    },
  ]

  const filteredMatches = matches.filter(match => {
    if (activeTab === 'all') return true
    if (activeTab === 'football') return match.sport === 'Football'
    if (activeTab === 'basketball') return match.sport === 'Basketball'
    return match.sport !== 'Football' && match.sport !== 'Basketball'
  })

  const handleStreamSelect = (match: Match, source: StreamSource) => {
    setSelectedMatch(match)
    setSelectedSource(source)
  }

  const closeStream = () => {
    setSelectedMatch(null)
    setSelectedSource(null)
  }

  const toggleFullscreen = () => {
    const iframe = document.getElementById('sports-iframe')
    if (!iframe) return
    
    if (!document.fullscreenElement) {
      iframe.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Loading Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
          >
            <motion.div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-600 flex items-center justify-center"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-white font-bold text-2xl mb-2">Loading Live Sports...</h1>
              <p className="text-white/60">HD Streams Available</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stream Player */}
      <AnimatePresence>
        {selectedMatch && selectedSource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            {/* Player Controls */}
            <div className="bg-gradient-to-b from-black/90 to-transparent p-4 flex items-center justify-between">
              <button
                onClick={closeStream}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center flex-1">
                <h2 className="text-white font-bold text-lg">{selectedMatch.home} vs {selectedMatch.away}</h2>
                <p className="text-white/60 text-sm">{selectedSource.name} • {selectedSource.quality}</p>
              </div>

              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Iframe Player */}
            <iframe
              id="sports-iframe"
              src={selectedSource.url}
              className="flex-1 w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              title="Live Sports Stream"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/20 border border-green-500/30 mb-4">
          <Trophy className="w-5 h-5 text-green-400" />
          <span className="text-green-300 font-bold text-sm">LIVE SPORTS HD</span>
        </div>
        <h1 className="font-bold text-4xl md:text-5xl text-white mb-2">Sports Streaming</h1>
        <p className="text-white/70">Watch live matches in HD quality</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2"
      >
        {[
          { key: 'all', label: 'All Sports', icon: '🏆' },
          { key: 'football', label: 'Football', icon: '⚽' },
          { key: 'basketball', label: 'Basketball', icon: '🏀' },
          { key: 'other', label: 'Other', icon: '🎾' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Matches Grid */}
      <div className="grid gap-4">
        {filteredMatches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 rounded-2xl border border-white/10 hover:border-green-500/30 transition-all"
          >
            {/* Match Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{match.sport === 'Football' ? '⚽' : '🏀'}</span>
                  <span className="text-white/60 text-sm">{match.league}</span>
                </div>
                <h3 className="text-white font-bold text-xl mb-1">
                  {match.home} vs {match.away}
                </h3>
              </div>
              
              {match.status === 'live' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/50">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 font-bold text-sm">LIVE</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/50">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-semibold text-sm">{match.time}</span>
                </div>
              )}
            </div>

            {/* Stream Sources */}
            <div className="space-y-2">
              <p className="text-white/50 text-sm mb-3">Available Streams:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {match.sources.map((source, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleStreamSelect(match, source)}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 hover:from-green-600/20 hover:to-green-500/20 border border-white/10 hover:border-green-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{source.icon}</span>
                      <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold">
                        {source.quality}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold mb-1">{source.name}</p>
                      <div className="flex items-center gap-1 text-white/60 text-xs">
                        <PlayCircle className="w-3 h-3" />
                        Click to watch
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <Tv className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">No matches available in this category</p>
        </div>
      )}
    </div>
  )
}
