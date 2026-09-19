'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info, Star, ChevronLeft, ChevronRight, Film } from 'lucide-react'
import { formatRating, getYear } from '@/lib/api'

interface HeroItem {
  id: number
  title?: string
  name?: string
  overview?: string
  backdrop_path?: string | null
  backdrop_url?: string
  vote_average?: number
  release_date?: string
  first_air_date?: string
  media_type?: string
  genres?: string[]
  tagline?: string
}

function getBackdropUrl(item: HeroItem): string {
  if (item.backdrop_url) return item.backdrop_url
  if (item.backdrop_path) return `https://image.tmdb.org/t/p/original${item.backdrop_path}`
  return ''
}

export default function HeroBanner({ items }: { items: HeroItem[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % items.length)
    setImgLoaded(false)
  }, [items.length])

  const prev = () => {
    setCurrent(c => (c - 1 + items.length) % items.length)
    setImgLoaded(false)
  }

  useEffect(() => {
    if (paused || items.length === 0) return
    const t = setInterval(next, 7000)
    return () => clearInterval(t)
  }, [paused, items.length, next])

  if (!items.length) return <HeroBannerSkeleton />

  const item = items[current]
  const type: 'movie' | 'tv' = item.media_type === 'tv' ? 'tv' : 'movie'
  const href = `/${type}/${item.id}`
  const title = item.title || item.name || ''
  const year = getYear(item.release_date || item.first_air_date || '')
  const backdropUrl = getBackdropUrl(item)

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '92vh', minHeight: '520px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Backdrop image — using <img> to avoid Next.js domain issues ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${current}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {backdropUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backdropUrl}
              alt={title}
              onLoad={() => setImgLoaded(true)}
              className="w-full h-full object-cover object-top"
              style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
            />
          ) : (
            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #190033, #0d001a)' }} />
          )}
          {/* fallback gradient always shown until image loads */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(25,0,51,0.4), rgba(13,0,26,0.2))',
              opacity: imgLoaded ? 0 : 1,
              transition: 'opacity 0.5s ease',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Gradient overlays ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to right, rgba(13,0,26,0.95) 0%, rgba(13,0,26,0.55) 55%, rgba(13,0,26,0.1) 100%)'
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to top, rgba(13,0,26,1) 0%, rgba(13,0,26,0.3) 30%, transparent 60%)'
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, rgba(13,0,26,0.5) 0%, transparent 20%)'
      }} />

      {/* ── Liquid accent ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute liquid-blob"
          style={{
            width: '500px', height: '500px',
            top: '10%', left: '-5%',
            background: 'radial-gradient(circle, rgba(147,51,234,0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative h-full flex items-center" style={{ zIndex: 10 }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
              className="max-w-lg"
            >
              {/* badge */}
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-white/15"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                <Film className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-purple-300 text-xs font-semibold uppercase tracking-widest">
                  {type === 'tv' ? 'TV Series' : 'Movie'}
                </span>
                {item.vote_average ? (
                  <>
                    <span className="text-white/30 text-xs">·</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-amber-300 text-xs font-bold">{formatRating(item.vote_average)}</span>
                  </>
                ) : null}
              </div>

              {/* title */}
              <h1
                className="font-orbitron font-bold text-4xl sm:text-5xl text-white leading-tight mb-3"
                style={{ textShadow: '0 0 30px rgba(147,51,234,0.5), 0 2px 10px rgba(0,0,0,0.8)' }}
              >
                {title}
              </h1>

              {/* tagline */}
              {item.tagline && (
                <p className="text-purple-300/75 italic text-sm mb-3">"{item.tagline}"</p>
              )}

              {/* meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/50 mb-5">
                {year && <span className="text-white/60">{year}</span>}
                {(item.genres as string[])?.length > 0 && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>{(item.genres as string[]).slice(0, 2).join(', ')}</span>
                  </>
                )}
              </div>

              {/* overview */}
              <p className="text-white/65 text-sm leading-relaxed mb-8 line-clamp-3">
                {item.overview}
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-3 flex-wrap">
                <Link href={href} className="btn-galaxy gap-2 text-sm">
                  <Play className="w-4 h-4 fill-current" />
                  Watch Now
                </Link>
                <Link href={href} className="btn-glass gap-2 text-sm">
                  <Info className="w-4 h-4" />
                  More Info
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Slide controls (bottom right) ── */}
      <div className="absolute bottom-8 right-4 sm:right-10 flex items-center gap-3" style={{ zIndex: 10 }}>
        <button
          onClick={prev}
          className="p-2.5 rounded-full text-white/60 hover:text-white transition-all duration-200 border border-white/15 hover:border-purple-500/50"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* dots */}
        <div className="flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setImgLoaded(false) }}
              className="rounded-full transition-all duration-400"
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                background: i === current
                  ? 'linear-gradient(90deg, #9333ea, #3b82f6)'
                  : 'rgba(255,255,255,0.3)',
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="p-2.5 rounded-full text-white/60 hover:text-white transition-all duration-200 border border-white/15 hover:border-purple-500/50"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Progress bar ── */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10" style={{ zIndex: 10 }}>
          <motion.div
            key={`prog-${current}`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 7, ease: 'linear' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #9333ea, #3b82f6)' }}
          />
        </div>
      )}
    </div>
  )
}

function HeroBannerSkeleton() {
  return (
    <div className="w-full shimmer-bg" style={{ height: '92vh', minHeight: '520px' }}>
      <div className="absolute bottom-20 left-8 sm:left-16 space-y-4 max-w-lg">
        <div className="h-5 w-32 rounded-full bg-white/10" />
        <div className="h-16 w-80 rounded bg-white/10" />
        <div className="h-4 w-72 rounded bg-white/10" />
        <div className="h-4 w-64 rounded bg-white/10" />
        <div className="flex gap-3 pt-4">
          <div className="h-11 w-32 rounded-full bg-white/10" />
          <div className="h-11 w-32 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  )
}
