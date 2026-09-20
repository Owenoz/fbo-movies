'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, Clock, Calendar, Trophy, Radio, AlertCircle } from 'lucide-react'
import { getLiveMatches, formatMatchTime, type LiveMatch } from '@/lib/sports'

export default function LiveSports() {
  const [matches, setMatches] = useState<LiveMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMatches()
    // Refresh every minute
    const interval = setInterval(loadMatches, 60000)
    return () => clearInterval(interval)
  }, [])

  async function loadMatches() {
    try {
      setError(null)
      const data = await getLiveMatches()
      setMatches(data)
    } catch (err) {
      setError('Failed to load matches')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMatches = matches.filter(m => {
    if (filter === 'all') return true
    return m.status === filter
  })

  const liveCount = matches.filter(m => m.status === 'live').length
  const upcomingCount = matches.filter(m => m.status === 'upcoming').length

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="h-12 w-64 rounded shimmer-bg mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl shimmer-bg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-purple-500" />
              Live Sports
            </h1>
            <p className="text-white/60">Watch live football matches streaming now</p>
          </div>
          
          <div className="flex items-center gap-2">
            {liveCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-red-500 font-semibold">{liveCount} Live</span>
              </div>
            )}
            {upcomingCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-semibold">{upcomingCount} Upcoming</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            All Matches
          </button>
          <button
            onClick={() => setFilter('live')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'live'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <Radio className="w-4 h-4 inline mr-1" />
            Live Now
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1" />
            Upcoming
          </button>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">{error}</p>
              <button onClick={loadMatches} className="text-sm underline mt-1">
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-20">
          <Trophy className="w-20 h-20 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/60 mb-2">
            No {filter === 'all' ? '' : filter} matches found
          </h3>
          <p className="text-white/40">Check back later for live matches</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match, idx) => (
            <MatchCard key={match.id} match={match} index={idx} />
          ))}
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, index }: { match: LiveMatch; index: number }) {
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={match.streamUrl || '#'} className="group block">
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02]">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            {match.thumbnail && (
              <img
                src={match.thumbnail}
                alt={match.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            {/* Live Badge */}
            {isLive && (
              <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 animate-pulse">
                <Radio className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-bold">LIVE</span>
              </div>
            )}
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-purple-600/90 flex items-center justify-center backdrop-blur-sm">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="p-4">
            {/* League */}
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
                {match.league}
              </span>
            </div>

            {/* Teams */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {match.homeLogo && (
                    <img src={match.homeLogo} alt={match.homeTeam} className="w-6 h-6 object-contain" />
                  )}
                  <span className="text-white font-semibold text-sm truncate">{match.homeTeam}</span>
                </div>
                {match.score && (
                  <span className="text-white font-bold text-lg mx-2">
                    {match.score.split('-')[0].trim()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {match.awayLogo && (
                    <img src={match.awayLogo} alt={match.awayTeam} className="w-6 h-6 object-contain" />
                  )}
                  <span className="text-white font-semibold text-sm truncate">{match.awayTeam}</span>
                </div>
                {match.score && (
                  <span className="text-white font-bold text-lg mx-2">
                    {match.score.split('-')[1].trim()}
                  </span>
                )}
              </div>
            </div>

            {/* Time/Status */}
            <div className="flex items-center gap-2 text-white/60 text-xs">
              {isFinished ? (
                <>
                  <AlertCircle className="w-3 h-3" />
                  <span>Full Time</span>
                </>
              ) : isLive ? (
                <>
                  <Clock className="w-3 h-3 text-red-500" />
                  <span className="text-red-500">Live Now</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3 h-3" />
                  <span>{formatMatchTime(match.startTime)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
