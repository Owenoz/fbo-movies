'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, Radio, Calendar, ChevronRight, TrendingUp } from 'lucide-react'
import { getLiveMatches, formatMatchTime, type LiveMatch } from '@/lib/sports'

export default function LiveSports() {
  const [matches, setMatches] = useState<LiveMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all')

  useEffect(() => {
    loadMatches()
    const interval = setInterval(loadMatches, 60000)
    return () => clearInterval(interval)
  }, [])

  async function loadMatches() {
    try {
      const data = await getLiveMatches()
      setMatches(data)
    } catch (err) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d001a] py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-10 w-48 rounded shimmer-bg mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl shimmer-bg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d001a]">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-transparent border-b border-white/5 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4">Live Sports</h1>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setFilter('live')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                filter === 'live'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Radio className="w-4 h-4" />
              Live Now {liveCount > 0 && `(${liveCount})`}
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Radio className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-xl font-semibold text-white/60 mb-2">
              No {filter === 'all' ? '' : filter} matches
            </h3>
            <p className="text-white/40">Check back later for live sports</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMatches.map((match, idx) => (
              <MatchRow key={match.id} match={match} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MatchRow({ match, index }: { match: LiveMatch; index: number }) {
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link 
        href={match.streamUrl || '#'} 
        className="block bg-gradient-to-r from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 border border-white/10 rounded-xl p-4 transition-all group"
      >
        <div className="flex items-center gap-4">
          {/* Live Indicator / Play Button */}
          <div className="flex-shrink-0">
            {isLive ? (
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600/30 to-purple-700/30 border border-purple-500/30 flex items-center justify-center group-hover:from-purple-600 group-hover:to-purple-700 group-hover:border-purple-500 transition-all">
                <Play className="w-6 h-6 text-white ml-0.5" />
              </div>
            )}
          </div>

          {/* Match Info */}
          <div className="flex-1 min-w-0">
            {/* League */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                {match.league}
              </span>
              {isLive && (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold animate-pulse">
                  LIVE
                </span>
              )}
              {isFinished && (
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-xs font-semibold">
                  FT
                </span>
              )}
            </div>

            {/* Teams */}
            <div className="space-y-1.5">
              {/* Home Team */}
              <div className="flex items-center gap-3">
                {match.homeLogo && (
                  <img src={match.homeLogo} alt={match.homeTeam} className="w-6 h-6 object-contain" />
                )}
                <span className="text-white font-semibold text-base flex-1 truncate">
                  {match.homeTeam}
                </span>
                {match.score && (
                  <span className="text-white font-bold text-lg min-w-[2rem] text-right">
                    {match.score.split('-')[0].trim()}
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-3">
                {match.awayLogo && (
                  <img src={match.awayLogo} alt={match.awayTeam} className="w-6 h-6 object-contain" />
                )}
                <span className="text-white font-semibold text-base flex-1 truncate">
                  {match.awayTeam}
                </span>
                {match.score && (
                  <span className="text-white font-bold text-lg min-w-[2rem] text-right">
                    {match.score.split('-')[1].trim()}
                  </span>
                )}
              </div>
            </div>

            {/* Time */}
            {!isLive && !isFinished && (
              <div className="flex items-center gap-1.5 mt-2 text-white/50 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatMatchTime(match.startTime)}</span>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0">
            <ChevronRight className="w-6 h-6 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
