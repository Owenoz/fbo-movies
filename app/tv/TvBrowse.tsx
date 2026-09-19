'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tv, SlidersHorizontal, ChevronDown } from 'lucide-react'
import MovieCard from '@/components/MovieCard'
import { getPopularTv, discoverTv, getTvGenres, getVjName } from '@/lib/api'

interface Show { id:number; name:string; poster_path:string; vote_average:number; first_air_date:string; genre_ids:number[]; overview:string }
interface Genre { id:number; name:string }

export default function TvBrowse() {
  const [shows,   setShows]   = useState<Show[]>([])
  const [genres,  setGenres]  = useState<Genre[]>([])
  const [genre,   setGenre]   = useState<number|null>(null)
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(1)
  const [loading, setLoading] = useState(true)
  const [showF,   setShowF]   = useState(false)

  useEffect(() => { getTvGenres().then(d => { if (d?.genres) setGenres(d.genres) }) }, [])

  const load = useCallback(async (pg: number, reset = false) => {
    setLoading(true)
    const data = genre
      ? await discoverTv({ with_genres: String(genre), page: String(pg) })
      : await getPopularTv(pg)
    const results = data?.results ?? []
    setShows(prev => reset ? results : [...prev, ...results])
    setTotal(data?.total_pages ?? 1)
    setLoading(false)
  }, [genre])

  useEffect(() => { setPage(1); load(1, true) }, [genre, load])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#3b82f6,#06b6d4)', boxShadow:'0 0 20px rgba(59,130,246,0.4)' }}>
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-3xl text-white">TV Shows</h1>
            <p className="text-white/40 text-sm">{shows.length} titles</p>
          </div>
        </div>
        <button onClick={() => setShowF(v => !v)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white border border-white/10" style={{ background: showF ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.07)' }}>
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </motion.div>

      <AnimatePresence>
        {showF && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden mb-8">
            <div className="p-5 rounded-2xl border border-white/12" style={{ background:'rgba(255,255,255,0.07)', backdropFilter:'blur(20px)' }}>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Genre</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setGenre(null)} className="px-4 py-1.5 rounded-full text-sm text-white" style={{ background: !genre ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : 'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)' }}>All</button>
                {genres.map(g => (
                  <button key={g.id} onClick={() => setGenre(g.id)} className="px-4 py-1.5 rounded-full text-sm text-white" style={{ background: genre===g.id ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : 'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)' }}>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <AnimatePresence>
          {shows.map((s,i) => (
            <motion.div key={s.id} layout initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} transition={{ duration:0.3, delay:(i%12)*0.04 }}>
              <MovieCard id={s.id} title={s.name} posterPath={s.poster_path} rating={s.vote_average} releaseDate={s.first_air_date} type="tv" overview={s.overview} vj={getVjName(s.id)} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && Array.from({length:12}).map((_,i) => (
          <div key={`sk${i}`}><div className="aspect-[2/3] rounded-xl shimmer-bg" /><div className="mt-2 h-3 w-3/4 rounded shimmer-bg" /></div>
        ))}
      </motion.div>

      {!loading && page < total && (
        <div className="flex justify-center mt-12">
          <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} onClick={() => { const n=page+1; setPage(n); load(n) }} className="btn-glass flex items-center gap-2">
            Load More <ChevronDown className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  )
}
