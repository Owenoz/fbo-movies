'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Radio, ArrowRight, Clock } from 'lucide-react'
import { getLiveMatchesCount, getMatchesByStatus, type LiveMatch } from '@/lib/sports'

export default function LiveSportsBanner() {
  const [liveCount, setLiveCount] = useState(0)
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    // Refresh every minute
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

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 p-8">
        <div className="h-8 w-48 rounded shimmer-bg mb-4" />
        <div className="h-4 w-64 rounded shimmer-bg" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10"
      style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(234,88,12,0.15) 100%)' }}>
      
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.6) 0%, transparent 70%)', animationDelay: '1s' }} />
      </div>

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left side */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-8 h-8 text-orange-500" />
              <h2 className="font-orbitron font-bold text-2xl md:text-3xl text-white">
                Live Sports
              </h2>
              {liveCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 animate-pulse">
                  <Radio className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-bold">{liveCount} LIVE</span>
                </div>
              )}
            </div>
            
            <p className="text-white/70 text-sm md:text-base mb-4">
              {liveCount > 0 
                ? `Watch ${liveCount} live football match${liveCount > 1 ? 'es' : ''} streaming now`
                : 'Check upcoming football matches and live streams'}
            </p>

            {/* Live matches preview */}
            {liveMatches.length > 0 && (
              <div className="space-y-2 mb-4">
                {liveMatches.map((match) => (
                  <Link
                    key={match.id}
                    href={match.streamUrl || '#'}
                    className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10 hover:border-red-500/50 transition-all group"
                  >
                    <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate group-hover:text-red-400 transition-colors">
                        {match.homeTeam} vs {match.awayTeam}
                      </p>
                      <p className="text-white/50 text-xs">{match.league}</p>
                    </div>
                    {match.score && (
                      <span className="text-red-500 font-bold text-sm">{match.score}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}

            <Link 
              href="/tv" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #ef4444 0%, #ea580c 100%)', 
                boxShadow: '0 10px 30px rgba(239,68,68,0.3)' 
              }}
            >
              {liveCount > 0 ? 'Watch Live Now' : 'View Schedule'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Right side - Featured match */}
          {liveMatches[0] && (
            <div className="md:w-80 relative">
              <Link 
                href={liveMatches[0].streamUrl || '#'}
                className="block relative rounded-xl overflow-hidden border-2 border-red-500/50 hover:border-red-500 transition-all group"
              >
                <div className="aspect-video relative">
                  <img 
                    src={liveMatches[0].thumbnail || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'} 
                    alt={liveMatches[0].title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  
                  {/* Live badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 animate-pulse">
                    <Radio className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-bold">LIVE</span>
                  </div>

                  {/* Match info */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs text-orange-400 font-semibold mb-1">{liveMatches[0].league}</p>
                    <p className="text-white font-bold text-sm mb-1">
                      {liveMatches[0].homeTeam} vs {liveMatches[0].awayTeam}
                    </p>
                    {liveMatches[0].score && (
                      <p className="text-red-500 font-bold text-lg">{liveMatches[0].score}</p>
                    )}
                  </div>

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-8 h-8 text-white fill-white ml-1" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
