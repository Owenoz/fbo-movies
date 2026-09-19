'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Clock, Play, Mic, Heart } from 'lucide-react'
import { tmdbImage, formatRating, getYear } from '@/lib/api'
import { useWatchlist } from '@/lib/useUserData'

interface MovieCardProps {
  id: number
  title: string
  posterPath?: string | null
  posterUrl?: string | null
  rating?: number
  year?: string
  releaseDate?: string
  type?: 'movie' | 'tv'
  runtime?: number
  overview?: string
  vj?: string
  index?: number
  sourceType?: 'kawogo' | 'tmdb' | 'narabox'
  slug?: string
  isNew?: boolean  // Show "NEW" badge if added in last 7 days
}

export default function MovieCard({
  id, title, posterPath, posterUrl, rating = 0, year, releaseDate,
  type = 'movie', runtime, overview, vj, index = 0, sourceType = 'tmdb', slug, isNew = false,
}: MovieCardProps) {
  // Link to details page for NaraBox movies, direct to watch for others
  const href = sourceType === 'narabox' && slug
    ? `/movie/${slug}`
    : `/${type === 'tv' ? 'tv' : 'movie'}/${id}`

  const imgSrc = posterUrl || (posterPath ? tmdbImage(posterPath, 'w342') : '')
  const displayYear = year || (releaseDate ? getYear(releaseDate) : '')
  const vjLabel = vj?.replace(/^VJ\s*/i, '')

  const { isInWatchlist, toggleWatchlist, loaded } = useWatchlist()
  const inWatchlist = loaded && slug && isInWatchlist(slug)

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (slug) {
      toggleWatchlist({ slug, title, vj: vj || '', poster: posterUrl || undefined })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.5), ease: 'easeOut' }}
      className="group relative media-card"
    >
      <Link href={href} className="block">
        <div
          className="relative overflow-hidden rounded-xl border border-white/10"
          style={{ aspectRatio: '2/3', background: 'linear-gradient(135deg,#1a0035,#0d001a)' }}
        >
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc} alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-2">
              <Play className="w-8 h-8 text-white/10" />
              <span className="text-white/20 text-xs text-center line-clamp-3">{title}</span>
            </div>
          )}

          {/* hover overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.15) 50%,transparent 100%)' }} />

          {/* Watchlist heart - top right */}
          {sourceType === 'narabox' && slug && (
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleWatchlistClick}
              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors"
              style={{ background: inWatchlist ? 'rgba(236,72,153,0.9)' : 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            >
              <Heart className={`w-4 h-4 ${inWatchlist ? 'fill-white text-white' : 'text-white'}`} />
            </motion.button>
          )}

          {/* play btn */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(147,51,234,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </motion.div>
          </div>

          {/* VJ badge */}
          {vjLabel ? (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(147,51,234,0.92)', backdropFilter: 'blur(6px)' }}>
              <Mic className="w-2.5 h-2.5 text-white flex-none" />
              <span className="text-white text-[10px] font-bold leading-none">VJ {vjLabel}</span>
            </div>
          ) : (
            <div className="absolute top-2 left-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                style={{ background: type === 'tv' ? 'rgba(59,130,246,0.85)' : 'rgba(147,51,234,0.85)' }}>
                {type === 'tv' ? 'TV' : 'FILM'}
              </span>
            </div>
          )}

          {/* NEW badge - below VJ badge */}
          {isNew && (
            <div className="absolute top-12 left-2">
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white animate-pulse"
                style={{ background: 'rgba(16,185,129,0.9)' }}>
                NEW
              </span>
            </div>
          )}

          {/* Runtime/Duration - bottom left */}
          {runtime && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-white"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-medium">{runtime}m</span>
            </div>
          )}

          {/* WATCH badge for narabox */}
          {sourceType === 'narabox' && (
            <div className="absolute top-2 right-2">
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white"
                style={{ background: 'rgba(16,185,129,0.9)' }}>▶ WATCH</span>
            </div>
          )}

          {/* rating for non-narabox */}
          {rating > 0 && sourceType !== 'narabox' && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-white">{formatRating(rating)}</span>
            </div>
          )}

          {/* hover detail */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            {overview && <p className="text-white/80 text-xs line-clamp-2 leading-relaxed">{overview}</p>}
            {(displayYear || runtime) && (
              <div className="flex items-center gap-2 mt-1.5 text-white/50 text-xs">
                {displayYear && <span>{displayYear}</span>}
                {runtime && <><span>·</span><Clock className="w-3 h-3" /><span>{runtime}m</span></>}
              </div>
            )}
          </div>
        </div>

        {/* title row */}
        <div className="mt-2.5 px-0.5">
          <h3 className="text-white font-medium text-sm line-clamp-1 group-hover:text-purple-300 transition-colors">{title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {displayYear && <span className="text-white/40 text-xs">{displayYear}</span>}
            {vjLabel && <span className="text-purple-400/70 text-xs">VJ {vjLabel}</span>}
            {!vjLabel && rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-white/50 text-xs">{formatRating(rating)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function MovieCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div style={{ opacity: 0, animation: `fadeIn 0.5s ease-out ${index * 0.06}s forwards` }}>
      <div className="rounded-xl shimmer-bg border border-white/10" style={{ aspectRatio: '2/3' }} />
      <div className="mt-2.5 space-y-1.5">
        <div className="h-3.5 w-3/4 rounded shimmer-bg" />
        <div className="h-3 w-1/2 rounded shimmer-bg" />
      </div>
    </div>
  )
}
