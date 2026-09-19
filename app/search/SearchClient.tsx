'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Mic, Loader2 } from 'lucide-react'
import MovieCard from '@/components/MovieCard'

interface NaraItem {
  id: number
  title: string
  vj: string
  slug: string
  poster_path?: string | null
  vote_average?: number
  release_date?: string
  overview?: string
}

export default function SearchClient() {
  const params = useSearchParams()
  const initQ  = params.get('q') ?? ''

  const [query,   setQuery]   = useState(initQ)
  const [results, setResults] = useState<NaraItem[]>([])
  const [popular, setPopular] = useState<NaraItem[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef  = useRef<HTMLInputElement>(null)
  const debounce  = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    fetch('/api/narabox?page=1&limit=24&enrich=1')
      .then(r => r.json())
      .then(d => setPopular(d.results ?? []))
      .catch(() => {})
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/narabox?q=${encodeURIComponent(q)}&limit=48&enrich=1`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch { setResults([]) }
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => doSearch(query), 420)
    return () => clearTimeout(debounce.current)
  }, [query, doSearch])

  useEffect(() => { if (initQ) doSearch(initQ) }, [initQ, doSearch])

  const display = query.trim() ? results : popular

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-orbitron font-bold text-3xl text-white mb-1">Search</h1>
        <p className="text-white/40 text-sm">Search 1,991+ VJ-translated movies</p>
      </motion.div>

      {/* search bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-white/12 focus-within:border-purple-500/60 transition-all"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))', backdropFilter: 'blur(20px)' }}
        >
          {loading
            ? <Loader2 className="w-5 h-5 text-purple-400 animate-spin flex-none" />
            : <Search className="w-5 h-5 text-white/40 flex-none" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title or VJ name — e.g. Forrest Gump, VJ Junior…"
            className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-base"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => { setQuery(''); setResults([]) }}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* label */}
      <div className="flex items-center gap-2 mb-5">
        {query.trim()
          ? !loading && (
              <span className="text-white/50 text-sm">
                {display.length} results for{' '}
                <span className="text-white font-semibold">"{query}"</span>
              </span>
            )
          : (
            <span className="text-white/50 text-sm flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-purple-400" /> Popular VJ Movies
            </span>
          )
        }
      </div>

      {/* grid */}
      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <motion.div key={`sk-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <div className="aspect-[2/3] rounded-xl shimmer-bg" />
                  <div className="mt-2 h-3 w-3/4 rounded shimmer-bg" />
                </motion.div>
              ))
            : display.map((item, i) => (
                <motion.div
                  key={item.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3, delay: (i % 12) * 0.04 }}
                >
                  <MovieCard
                    id={item.id}
                    title={item.title}
                    posterPath={item.poster_path ?? undefined}
                    rating={item.vote_average}
                    releaseDate={item.release_date}
                    type="movie"
                    overview={item.overview}
                    vj={item.vj}
                    index={i}
                    sourceType="narabox"
                    slug={item.slug}
                  />
                </motion.div>
              ))
          }
        </AnimatePresence>
      </motion.div>

      {/* empty state */}
      {!loading && query && display.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Search className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/50 text-lg">No results for "{query}"</p>
          <p className="text-white/30 text-sm">Try a different title or VJ name</p>
        </motion.div>
      )}
    </div>
  )
}
