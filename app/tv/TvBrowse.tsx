'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Tv, Search, Loader2, Filter, Star } from 'lucide-react'
import { getPopularShows, searchTVShows, getAllShows, POPULAR_GENRES, type TVShow } from '@/lib/tvmaze'

export default function TvBrowse() {
  const [shows, setShows] = useState<TVShow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [page, setPage] = useState(0)

  useEffect(() => {
    loadShows()
  }, [page, selectedGenre])

  async function loadShows() {
    try {
      setLoading(true)
      let data: TVShow[]
      
      if (selectedGenre === 'all') {
        // Load popular shows or all shows
        data = page === 0 ? await getPopularShows() : await getAllShows(page)
      } else {
        // Load all shows and filter by genre
        const allShows = await getAllShows(page)
        data = allShows.filter(show => 
          show.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase())
        )
      }
      
      setShows(data)
    } catch (error) {
      console.error('Failed to load shows:', error)
      setShows([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) {
      loadShows()
      return
    }

    try {
      setSearching(true)
      const data = await searchTVShows(searchQuery)
      setShows(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="h-10 w-48 rounded shimmer-bg mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i}><div className="aspect-[2/3] rounded-xl shimmer-bg" /></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Tv className="w-8 h-8 text-purple-500" />
          <h1 className="text-4xl font-bold text-white">TV Shows</h1>
        </div>
        <p className="text-white/60 mb-6">
          {shows.length} popular TV shows • Powered by TVMaze
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search TV shows..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {searching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 animate-spin" />
          )}
        </form>

        {/* Genre Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-white/60" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedGenre('all'); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedGenre === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              All Genres
            </button>
            {POPULAR_GENRES.slice(0, 8).map(genre => (
              <button
                key={genre}
                onClick={() => { setSelectedGenre(genre); setPage(0); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedGenre === genre
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shows Grid */}
      {shows.length === 0 ? (
        <div className="text-center py-20">
          <Tv className="w-20 h-20 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/60 mb-2">No shows found</h3>
          <p className="text-white/40">Try a different search term or genre</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {shows.map((show, idx) => (
              <ShowCard key={show.id} show={show} index={idx} />
            ))}
          </div>

          {/* Pagination */}
          {!searchQuery && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-6 py-3 rounded-xl font-semibold bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                Previous
              </button>
              <span className="px-6 py-3 rounded-xl bg-purple-500/20 text-white font-semibold">
                Page {page + 1}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-3 rounded-xl font-semibold bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ShowCard({ show, index }: { show: TVShow; index: number }) {
  const posterUrl = show.image?.original || show.image?.medium || '/placeholder-tv.jpg'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <Link
        href={`/tv/${show.id}`}
        className="group block relative rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
      >
        {/* Poster */}
        <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
          {show.image ? (
            <img
              src={posterUrl}
              alt={show.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tv className="w-16 h-16 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Rating Badge */}
          {show.rating.average && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs font-bold">{show.rating.average.toFixed(1)}</span>
            </div>
          )}
          
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-purple-600/90 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7 text-white fill-white ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">
            {show.name}
          </h3>
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>{show.premiered?.split('-')[0]}</span>
            {show.genres.length > 0 && (
              <span className="truncate ml-2">{show.genres[0]}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
