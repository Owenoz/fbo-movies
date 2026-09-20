'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Radio, ChevronRight } from 'lucide-react'
import { getLiveMatchesCount, getMatchesByStatus, type LiveMatch } from '@/lib/sports'

export default function LiveSportsBanner() {
  const [liveCount, setLiveCount] = useState(0)
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    try {
      const count = await getLiveMatchesCount()
      const matches = await getMatchesByStatus('live')
      setLiveCount(count)
      setLiveMatches(matches.slice(0, 3))
    } catch (err) {
      console.error('Failed to load live matches:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || liveCount === 0) return null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-red-900/20 via-red-800/10 to-orange-900/20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
              <Radio className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">Live Sports</h2>
              <p className="text-white/60 text-sm">{liveCount} matches streaming now</p>
            </div>
          </div>
          <Link 
            href="/tv" 
            className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors flex items-center gap-2"
          >
            Watch Live
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-2">
          {liveMatches.map((match) => (
            <Link
              key={match.id}
              href={match.streamUrl || '#'}
              className="block p-3 rounded-lg bg-black/30 border border-white/10 hover:border-red-500/50 hover:bg-black/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                  <p className="text-white/50 text-xs">{match.league}</p>
                </div>
                {match.score && (
                  <span className="text-red-500 font-bold text-sm flex-shrink-0">{match.score}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
