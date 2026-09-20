'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Sparkles, Database } from 'lucide-react'
import MovieCard from '@/components/MovieCard'

export default function ExploreClient() {
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [source, setSource] = useState<'all' | 'narabox' | 'lugaflix'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [vjFilter, setVjFilter] = useState('')

  useEffect(() => {
    loadMovies()
  }, [page, source, vjFilter])

  const loadMovies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        source,
      })
      if (vjFilter) params.append('vj', vjFilter)
      if (searchQuery) params.append('q', searchQuery)

      const res = await fetch(`/api/movies-all?${params}`)
      const data = await res.json()

      if (data.success) {
        setMovies(data.data)
        setHasMore(data.pagination.hasMore)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error('Failed to load movies:', error)
    }
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadMovies()
  }

  const popularVJs = [
    'VJ Junior', 'VJ Emmy', 'VJ Ice P', 'VJ Jingo', 'VJ Mark', 
    'VJ Kevo', 'VJ Ulio', 'VJ Tom', 'VJ Ivo'
  ]

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-400" />
            <h1 className="font-orbitron font-bold text-4xl md:text-5xl text-white">
              Explore All VJ Movies
            </h1>
          </div>
          <p className="text-white/60 text-lg">
            Browse {total.toLocaleString()}+ Luganda-translated movies from multiple sources
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl mb-8"
        >
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by movie title or VJ name..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          </form>

          {/* Source Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Source
            </label>
            <div className="flex gap-3">
              {[
                { value: 'all', label: 'All Sources', count: total },
                { value: 'narabox', label: 'NaraBox (Verified)', count: 462 },
                { value: 'lugaflix', label: 'LugaFlix', count: 53085 },
              ].map(({ value, label, count }) => (
                <button
                  key={value}
                  onClick={() => { setSource(value as any); setPage(1); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    source === value
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {label}
                  <span className="ml-2 text-xs opacity-70">({count.toLocaleString()})</span>
                </button>
              ))}
            </div>
          </div>

          {/* VJ Filter */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter by VJ
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setVjFilter(''); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  vjFilter === ''
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                All VJs
              </button>
              {popularVJs.map((vj) => (
                <button
                  key={vj}
                  onClick={() => { setVjFilter(vj); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    vjFilter === vj
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {vj}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[2/3] rounded-xl shimmer-bg" />
                <div className="h-4 w-3/4 rounded shimmer-bg" />
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No movies found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {movies.map((movie, i) => (
                <MovieCard
                  key={`${movie.sourceType}-${movie.id}`}
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster ?? undefined}
                  vj={movie.vj}
                  slug={movie.slug}
                  sourceType={movie.sourceType}
                  source={movie.source}
                  runtime={movie.runtime}
                  isNew={movie.isNew}
                  index={i}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-3 rounded-xl font-semibold bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                Previous
              </button>
              <span className="px-6 py-3 rounded-xl bg-purple-500/20 text-white font-semibold">
                Page {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="px-6 py-3 rounded-xl font-semibold bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
