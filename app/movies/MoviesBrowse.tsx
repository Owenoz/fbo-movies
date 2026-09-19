'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, ChevronDown, Loader2, Mic } from 'lucide-react'
import MovieCard from '@/components/MovieCard'

interface Movie {
  id: number
  title: string
  vj: string
  slug: string
  poster?: string | null
  poster_path?: string | null
  vote_average?: number
  release_date?: string
  overview?: string | null
}

const VJ_LIST = ['VJ Junior','VJ Emmy','VJ Mark','VJ Ice P','VJ Jingo','VJ Kevo','VJ Ulio','VJ Muba','VJ Soul','VJ Neil']

export default function MoviesBrowse() {
  const [movies,  setMovies]  = useState<Movie[]>([])
  const [vj,      setVj]      = useState('')
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (pg: number, reset = false, vjFilter = vj) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(pg), limit: '24' })
    if (vjFilter) params.set('vj', vjFilter)
    const res  = await fetch(`/api/narabox?${params}`)
    const data = await res.json()
    setMovies(prev => reset ? (data.results ?? []) : [...prev, ...(data.results ?? [])])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [vj])

  useEffect(() => { setPage(1); load(1, true, vj) }, [vj])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* header */}
      <motion.div initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }} className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background:'linear-gradient(135deg,#9333ea,#3b82f6)', boxShadow:'0 0 20px rgba(147,51,234,0.4)' }}>
          <Film className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-orbitron font-bold text-3xl text-white">VJ Movies</h1>
          <p className="text-white/40 text-sm">{total} watchable titles</p>
        </div>
      </motion.div>

      {/* VJ filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setVj('')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white transition-all"
          style={{ background:!vj?'linear-gradient(135deg,#9333ea,#3b82f6)':'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)' }}>
          All VJs
        </button>
        {VJ_LIST.map(v => (
          <button key={v} onClick={() => setVj(v)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white transition-all"
            style={{ background:vj===v?'linear-gradient(135deg,#9333ea,#3b82f6)':'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)' }}>
            <Mic className="w-3 h-3" />{v}
          </button>
        ))}
      </div>

      {/* grid */}
      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <AnimatePresence>
          {movies.map((m, i) => (
            <motion.div key={m.slug} layout
              initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }}
              exit={{ opacity:0 }} transition={{ duration:0.3, delay:(i%12)*0.04 }}>
              <MovieCard
                id={m.id} title={m.title}
                posterUrl={m.poster ?? undefined}
                posterPath={m.poster_path ?? undefined}
                rating={m.vote_average} releaseDate={m.release_date}
                type="movie" overview={m.overview ?? undefined}
                vj={m.vj} index={i} sourceType="narabox" slug={m.slug}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && Array.from({length:12}).map((_,i) => (
          <div key={`sk${i}`}>
            <div className="aspect-[2/3] rounded-xl shimmer-bg" />
            <div className="mt-2 h-3 w-3/4 rounded shimmer-bg" />
          </div>
        ))}
      </motion.div>

      {!loading && movies.length < total && (
        <div className="flex justify-center mt-12">
          <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            onClick={() => { const n=page+1; setPage(n); load(n) }}
            className="btn-glass flex items-center gap-2">
            Load More <ChevronDown className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  )
}
