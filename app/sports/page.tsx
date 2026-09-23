'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Radio, Clock, Share2, ArrowLeft } from 'lucide-react'
import { initAdBlocker } from './ad-blocker'

interface StreamSource {
  name: string
  url: string
  quality: string
}

interface Match {
  id: string
  sport: string
  league: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  time: string
  date: string
  status: 'live' | 'upcoming' | 'finished'
  startsIn?: string
  streams: StreamSource[]
}

export default function SportsPage() {
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [selectedStream, setSelectedStream] = useState<StreamSource | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'football' | 'basketball' | 'cricket' | 'other'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all')
  const [stats, setStats] = useState({ total: 0, live: 0, upcoming: 0, finished: 0 })

  useEffect(() => {
    initAdBlocker()
    fetchMatches()
  }, [activeTab, statusFilter])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const sportParam = activeTab !== 'all' ? `&sport=${activeTab}` : ''
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : ''
      const response = await fetch(`/api/sports-channels?${sportParam}${statusParam}`)
      const data = await response.json()
      
      if (data.success) {
        setMatches(data.matches)
        setStats({
          total: data.total,
          live: data.live,
          upcoming: data.upcoming,
          finished: data.finished
        })
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'football': return '⚽'
      case 'basketball': return '🏀'
      case 'cricket': return '🏏'
      case 'boxing': return '🥊'
      case 'motorsports': return '🏎️'
      case 'baseball': return '⚾'
      default: return '🏆'
    }
  }

  const handleWatchMatch = (match: Match, stream: StreamSource) => {
    setSelectedMatch(match)
    setSelectedStream(stream)
  }

  const closePlayer = () => {
    setSelectedMatch(null)
    setSelectedStream(null)
  }

  return (
    <div className="min-h-screen bg-black pt-16 pb-20">
      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-white/60">Loading matches...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Player */}
      <AnimatePresence>
        {selectedMatch && selectedStream && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            {/* Player Header */}
            <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-800">
              <button
                onClick={closePlayer}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Matches
              </button>

              <div className="text-center flex-1 px-4">
                <h2 className="text-white font-bold">{selectedMatch.league}</h2>
                <p className="text-white/60 text-sm">{selectedMatch.homeTeam} vs {selectedMatch.awayTeam}</p>
              </div>

              {selectedMatch.status === 'live' && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600">
                  <Radio className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-white text-sm font-bold">LIVE</span>
                </div>
              )}
            </div>

            {/* Stream Selection Tabs */}
            <div className="bg-gray-900 px-4 py-3 flex gap-2 border-b border-gray-800 overflow-x-auto">
              {selectedMatch.streams.map((stream, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedStream(stream)}
                  className={`px-6 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    selectedStream === stream
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-white/70 hover:bg-gray-700'
                  }`}
                >
                  {stream.name}
                </button>
              ))}
            </div>

            {/* Video Player */}
            <div className="flex-1 bg-black flex items-center justify-center p-4">
              <iframe
                src={selectedStream.url}
                className="w-full h-full max-w-7xl rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title={`${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}`}
              />
            </div>

            {/* Other Matches Scroll */}
            <div className="bg-gray-900 p-4 border-t border-gray-800">
              <h3 className="text-white/60 text-sm mb-3">Other Matches</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {matches.filter(m => m.id !== selectedMatch.id).slice(0, 5).map((match) => (
                  <button
                    key={match.id}
                    onClick={() => handleWatchMatch(match, match.streams[0])}
                    className="flex-shrink-0 w-64 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/60">{match.league}</span>
                      {match.status === 'live' && (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold">LIVE</span>
                      )}
                    </div>
                    <p className="text-white text-sm font-semibold">
                      {match.homeFlag} {match.homeTeam} vs {match.awayTeam} {match.awayFlag}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-4 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-bold text-2xl">AK47Sports</h1>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Sport Icons */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All', icon: '🏆', badge: stats.total },
            { key: 'football', label: 'Football', icon: '⚽' },
            { key: 'cricket', label: 'Cricket', icon: '🏏' },
            { key: 'boxing', label: 'Boxing', icon: '🥊' },
            { key: 'motorsports', label: 'Motorsports', icon: '🏎️' },
            { key: 'basketball', label: 'Basketball', icon: '🏀' },
            { key: 'baseball', label: 'Baseball', icon: '⚾' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all relative ${
                activeTab === tab.key
                  ? 'bg-blue-600'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-white text-xs font-medium whitespace-nowrap">{tab.label}</span>
              {tab.badge && tab.key === 'all' && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="px-4 py-3 bg-black flex gap-2 overflow-x-auto">
        {[
          { key: 'all', label: `All (${stats.total})` },
          { key: 'live', label: `Live (${stats.live})` },
          { key: 'upcoming', label: `Upcoming (${stats.upcoming})` },
          { key: 'finished', label: `Finished (${stats.finished})` }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setStatusFilter(filter.key as any)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
              statusFilter === filter.key
                ? 'bg-white text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Matches List */}
      <div className="px-4 py-4 space-y-3">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleWatchMatch(match, match.streams[0])}
            className="bg-gray-900 rounded-xl border border-gray-800 hover:border-blue-600 transition-all cursor-pointer overflow-hidden"
          >
            {/* Match Header */}
            <div className="px-4 py-2 bg-gray-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getSportIcon(match.sport)}</span>
                <span className="text-white/70 text-sm">{match.league}</span>
              </div>
              {match.status === 'live' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>
              )}
            </div>

            {/* Teams */}
            <div className="px-4 py-4 flex items-center justify-between">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-2 text-2xl">
                  {match.homeFlag}
                </div>
                <span className="text-white font-semibold text-sm text-center">{match.homeTeam}</span>
              </div>

              {/* Time/Status */}
              <div className="flex flex-col items-center px-4">
                {match.status === 'live' ? (
                  <div className="text-red-500 font-bold text-lg">LIVE</div>
                ) : (
                  <>
                    <div className="text-white font-bold text-lg">{match.time}</div>
                    <div className="text-white/50 text-xs">{match.date.split('T')[0]}</div>
                  </>
                )}
                {match.startsIn && (
                  <div className="mt-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-semibold">
                    Starts in {match.startsIn}
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-2 text-2xl">
                  {match.awayFlag}
                </div>
                <span className="text-white font-semibold text-sm text-center">{match.awayTeam}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {matches.length === 0 && !loading && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-white/60">No matches available</p>
        </div>
      )}

      {/* Bottom Nav Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 flex items-center justify-around">
        <div className="flex flex-col items-center gap-1">
          <Trophy className="w-6 h-6 text-blue-500" />
          <span className="text-blue-500 text-xs font-semibold">Events</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">📂</span>
          <span className="text-white/50 text-xs">Categories</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">⚽</span>
          <span className="text-white/50 text-xs">Sports</span>
        </div>
      </div>
    </div>
  )
}
