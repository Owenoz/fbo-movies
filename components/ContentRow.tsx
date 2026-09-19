'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MovieCard, { MovieCardSkeleton } from './MovieCard'

interface ContentItem {
  id: number
  title?: string
  name?: string
  poster_url?: string
  backdrop_url?: string
  vj?: string
  type?: string
  slug?: string
  poster_path?: string
  vote_average?: number
  release_date?: string
  first_air_date?: string
  media_type?: string
  runtime?: number
  overview?: string
}

interface ContentRowProps {
  title: string
  items: ContentItem[]
  loading?: boolean
  defaultType?: 'movie' | 'tv'
  accentColor?: string
  sourceType?: 'kawogo' | 'tmdb' | 'narabox'
}

export default function ContentRow({
  title,
  items,
  loading = false,
  defaultType = 'movie',
  accentColor = 'from-purple-600 to-blue-500',
  sourceType = 'tmdb',
}: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return
    rowRef.current.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' })
  }

  return (
    <section className="relative">
      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-7 rounded-full bg-gradient-to-b ${accentColor}`} />
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xl font-bold text-white tracking-wide"
          >
            {title}
          </motion.h2>
          {items.length > 0 && (
            <span className="text-white/25 text-sm">{items.length}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full text-white/50 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full text-white/50 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* row */}
      <div ref={rowRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-none w-36 sm:w-40">
                <MovieCardSkeleton index={i} />
              </div>
            ))
          : items.map((item, i) => {
              const mediaType = (item.media_type ?? item.type ?? defaultType) as 'movie' | 'tv'
              const type: 'movie' | 'tv' = mediaType === 'tv' ? 'tv' : 'movie'

              return (
                <div key={`${item.id}-${i}`} className="flex-none w-36 sm:w-40">
                  <MovieCard
                    id={item.id}
                    title={item.title || item.name || 'Unknown'}
                    posterUrl={item.poster_url}
                    posterPath={item.poster_path}
                    rating={item.vote_average}
                    releaseDate={item.release_date || item.first_air_date}
                    type={type}
                    runtime={item.runtime}
                    overview={item.overview}
                    vj={item.vj}
                    index={i}
                    sourceType={sourceType}
                    slug={item.slug}
                  />
                </div>
              )
            })
        }
      </div>
    </section>
  )
}
