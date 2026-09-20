'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Film, Search, Loader2 } from 'lucide-react'
import { getFeaturedArchiveMovies, searchArchiveMovies, type ArchiveMovie } from '@/lib/internetarchive'

export default function TvBrowse() {
  const [movies, setMovies] = useState<ArchiveMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadFeaturedMovies()
  }, [])

  async function loadFeaturedMovies() {
    try {
      setLoading(true)
      const data = await getFeaturedArchiveMovies()
      setMovies(data)
    } catch (error) {
      console.error('Failed to load movies:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) {
      loadFeaturedMovies()
      return
    }

    try {
      setSearching(true)
      const data = await searchArchiveMovies(searchQuery)
      setMovies(data)
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
          <Film className="w-8 h-8 text-purple-500" />
          <h1 className="text-4xl font-bold text-white">Classic Movies & TV Shows</h1>
        </div>
        <p className="text-white/60 mb-6">
          {movies.length} free movies from Internet Archive - Public domain classics
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classic movies..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
          />
          {searching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 animate-spin" />
          )}
        </form>
      </div>

      {/* Movies Grid */}
      {movies.length === 0 ? (
        <div className="text-center py-20">
          <Film className="w-20 h-20 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/60 mb-2">No movies found</h3>
          <p className="text-white/40">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie, idx) => (
            <MovieCard key={movie.id} movie={movie} index={idx} />
          ))}
        </div>
      )}
    </div>
  )
}

function MovieCard({ movie, index }: { movie: ArchiveMovie; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <Link
        href={`/tv/${movie.identifier}`}
        className="group block relative rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
      >
        {/* Poster */}
        <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
          <img
            src={movie.thumbnail}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'https://archive.org/images/notfound.png'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
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
            {movie.title}
          </h3>
          {movie.year && (
            <p className="text-white/40 text-xs">{movie.year}</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
