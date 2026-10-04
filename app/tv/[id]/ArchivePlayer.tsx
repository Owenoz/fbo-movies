'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, SkipForward, SkipBack,
  Loader2, AlertCircle, Settings2, Calendar, Clock, Star, Tv
} from 'lucide-react'
import { getShowById, getShowEpisodes, type TVShow } from '@/lib/tvmaze'

interface Episode {
  id: number
  name: string
  season: number
  number: number
  airdate: string
  runtime: number
  summary: string
  image: { medium: string; original: string } | null
}

export default function ArchivePlayer({ identifier }: { identifier: string }) {
  const [show, setShow] = useState<TVShow | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)



  useEffect(() => {
    loadShow()
  }, [identifier])

  async function loadShow() {
    try {
      setLoading(true)
      const showId = parseInt(identifier)
      if (isNaN(showId)) {
        setError('Invalid show ID')
        return
      }

      const [showData, episodesData] = await Promise.all([
        getShowById(showId),
        getShowEpisodes(showId)
      ])

      if (!showData) {
        setError('Show not found')
        return
      }

      setShow(showData)
      setEpisodes(episodesData)
      
      // Auto-select first episode of season 1
      if (episodesData.length > 0) {
        setSelectedEpisode(episodesData[0])
        setSelectedSeason(episodesData[0].season)
      }
    } catch (err) {
      setError('Failed to load show')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const seasons = Array.from(new Set(episodes.map(ep => ep.season))).sort((a, b) => a - b)
  const seasonEpisodes = episodes.filter(ep => ep.season === selectedSeason)

  const cleanSummary = (html: string | null) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
        <p className="text-white/60 text-lg">Loading TV Show...</p>
      </div>
    </div>
  )

  if (error || !show) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h2 className="font-bold text-2xl text-white mb-2">Show Not Available</h2>
        <p className="text-white/50 mb-6">{error || 'This show is currently unavailable'}</p>
        <Link href="/tv" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to TV Shows
        </Link>
      </div>
    </div>
  )

  const posterUrl = show.image?.original || show.image?.medium

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Back button */}
        <Link
          href="/tv"
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to TV Shows
        </Link>

        {/* Show Header */}
        <div className="glass-card rounded-2xl overflow-hidden mb-8">
          <div className="relative h-64 md:h-80 overflow-hidden">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={show.name}
                className="w-full h-full object-cover blur-md scale-110 opacity-30"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-blue-900/40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end gap-6">
                {posterUrl && (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={posterUrl}
                    alt={show.name}
                    className="w-32 h-48 md:w-40 md:h-60 object-cover rounded-lg shadow-2xl hidden sm:block"
                  />
                )}
                <div className="flex-1">
                  <h1 className="font-bold text-3xl md:text-5xl text-white mb-2">{show.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-white/80">
                    {show.rating.average && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{show.rating.average.toFixed(1)}</span>
                      </div>
                    )}
                    {show.premiered && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{show.premiered.split('-')[0]}</span>
                      </div>
                    )}
                    {show.status && (
                      <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-sm">
                        {show.status}
                      </span>
                    )}
                    {show.genres.length > 0 && (
                      <div className="flex gap-2">
                        {show.genres.slice(0, 3).map(genre => (
                          <span key={genre} className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-sm">
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-white/70 leading-relaxed max-w-4xl">
              {cleanSummary(show.summary) || 'No description available.'}
            </p>
            
            {show.network && (
              <div className="mt-4 text-sm text-white/50">
                Network: {show.network.name} • {show.network.country.name}
              </div>
            )}
            {show.webChannel && (
              <div className="mt-2 text-sm text-white/50">
                Streaming on: {show.webChannel.name}
              </div>
            )}
          </div>
        </div>

        {/* Episodes Section */}
        {episodes.length > 0 ? (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-bold text-2xl text-white mb-6 flex items-center gap-2">
              <Tv className="w-6 h-6 text-purple-400" />
              Episodes
            </h2>

            {/* Season Selector */}
            {seasons.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {seasons.map(season => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedSeason === season
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Season {season}
                  </button>
                ))}
              </div>
            )}

            {/* Episodes List */}
            <div className="space-y-3">
              {seasonEpisodes.map(episode => (
                <motion.div
                  key={episode.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => setSelectedEpisode(episode)}
                >
                  <div className="flex-shrink-0">
                    {episode.image?.medium ? (
                      <img
                        src={episode.image.medium}
                        alt={episode.name}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-20 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-lg flex items-center justify-center">
                        <Tv className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {episode.number}. {episode.name}
                      </h3>
                      {episode.runtime && (
                        <div className="flex items-center gap-1 text-white/40 text-sm flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{episode.runtime}m</span>
                        </div>
                      )}
                    </div>
                    {episode.airdate && (
                      <p className="text-white/40 text-sm mb-2">
                        Aired: {new Date(episode.airdate).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-white/60 text-sm line-clamp-2">
                      {cleanSummary(episode.summary) || 'No description available.'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center">
                    <Play className="w-6 h-6 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Tv className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">No Episodes Available</h3>
            <p className="text-white/40">Episode information coming soon</p>
          </div>
        )}

        {/* Note about streaming */}
        <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-blue-300 text-sm text-center">
            💡 For streaming, please visit the show's official platform or check your local TV listings
          </p>
        </div>
      </div>
    </div>
  )
}


