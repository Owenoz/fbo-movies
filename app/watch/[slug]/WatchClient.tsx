'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Maximize, Minimize, SkipForward, SkipBack,
  Loader2, AlertCircle, ArrowLeft
} from 'lucide-react'
import { useWatchHistory } from '@/lib/useUserData'
import { useAnalytics } from '@/lib/useAnalytics'

interface MovieData {
  slug: string
  title: string
  mp4: string | null
  poster: string | null
  backdrop: string | null
  overview: string | null
}

function parseVJ(slug: string) {
  const m = slug.match(/-vj-([a-z0-9]+(?:-[a-z0-9]+)*)/)
  return m ? 'VJ ' + m[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''
}

function cleanTitle(slug: string) {
  return slug.replace(/-vj-.*$/, '').replace(/-\d+$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function fmtTime(s: number) {
  if (isNaN(s)) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`
  return `${m}:${sec.toString().padStart(2,'0')}`
}

export default function WatchClient({ slug }: { slug: string }) {
  const router = useRouter()
  const [data, setData] = useState<MovieData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { addToHistory, updateProgress, getProgress } = useWatchHistory()
  const { trackView } = useAnalytics()

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [showCtrl, setShowCtrl] = useState(true)
  const [buffering, setBuffering] = useState(false)
  const ctrlTimer = useRef<ReturnType<typeof setTimeout>>()
  const progressSaveTimer = useRef<ReturnType<typeof setTimeout>>()

  // Handle screen orientation - removed, keeping basic fullscreen only

  // Fetch movie data
  useEffect(() => {
    setLoading(true)
    
    if (slug.startsWith('lugaflix-')) {
      const lugaflixId = slug.replace('lugaflix-', '')
      fetch(`https://movies.mruodel.com/api/movies`)
        .then(r => r.json())
        .then(apiData => {
          const movie = apiData.data?.items?.find((m: any) => m.id.toString() === lugaflixId)
          if (movie) {
            setData({
              slug,
              title: movie.title,
              mp4: movie.url,
              poster: movie.thumbnail_url,
              backdrop: movie.thumbnail_url,
              overview: movie.description,
            })
          } else {
            setError('Movie not found')
          }
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    } else {
      fetch(`/api/movie-data?slug=${encodeURIComponent(slug)}`)
        .then(r => r.json())
        .then(d => {
          if (d.error) throw new Error(d.error)
          setData(d)
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [slug])

  // Auto-fullscreen on mobile when video starts playing
  useEffect(() => {
    if (playing && videoRef.current && !fullscreen) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile && !document.fullscreenElement) {
        containerRef.current?.requestFullscreen?.().catch(() => {})
      }
    }
  }, [playing])

  // Add to watch history
  useEffect(() => {
    if (data?.mp4 && duration > 0) {
      const vj = parseVJ(slug)
      const title = data.title || cleanTitle(slug)
      
      addToHistory({
        slug,
        title,
        vj,
        poster: data.poster ?? undefined,
        progress: 0,
        duration,
      })

      trackView(slug, title, vj)
      
      const saved = getProgress(slug)
      if (saved && saved.progress > 5 && saved.progress < 95 && videoRef.current) {
        const resumeTime = (saved.duration * saved.progress) / 100
        videoRef.current.currentTime = resumeTime
      }
    }
  }, [data, duration, slug, addToHistory, getProgress, trackView])

  // Track progress
  useEffect(() => {
    if (!playing || duration === 0) return
    
    clearTimeout(progressSaveTimer.current)
    progressSaveTimer.current = setTimeout(() => {
      const progress = (current / duration) * 100
      if (progress > 0 && progress < 100) {
        updateProgress(slug, progress, duration)
      }
    }, 5000)

    return () => clearTimeout(progressSaveTimer.current)
  }, [current, duration, playing, slug, updateProgress])

  // Auto-hide controls
  const showControls = () => {
    setShowCtrl(true)
    clearTimeout(ctrlTimer.current)
    ctrlTimer.current = setTimeout(() => {
      if (playing) setShowCtrl(false)
    }, 3000)
  }

  // Video event listeners
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    
    const onTime = () => setCurrent(v.currentTime)
    const onDur = () => setDuration(v.duration)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onWait = () => setBuffering(true)
    const onPlaying = () => setBuffering(false)
    const onProgress = () => {
      if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1))
    }
    const onFull = () => setFullscreen(!!document.fullscreenElement)

    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onDur)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('waiting', onWait)
    v.addEventListener('playing', onPlaying)
    v.addEventListener('progress', onProgress)
    document.addEventListener('fullscreenchange', onFull)
    
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onDur)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('waiting', onWait)
      v.removeEventListener('playing', onPlaying)
      v.removeEventListener('progress', onProgress)
      document.removeEventListener('fullscreenchange', onFull)
    }
  }, [data])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current
      if (!v) return
      if (e.target instanceof HTMLInputElement) return
      
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break
        case 'ArrowRight': v.currentTime += 15; break
        case 'ArrowLeft': v.currentTime -= 15; break
        case 'f': toggleFullscreen(); break
      }
      showControls()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playing])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    playing ? v.pause() : v.play()
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    v.currentTime = pct * duration
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(() => {})
    } else {
      await document.exitFullscreen()
    }
  }

  const pct = duration ? (current / duration) * 100 : 0
  const bufPct = duration ? (buffered / duration) * 100 : 0

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
        <p className="text-white/60 text-lg">Loading...</p>
      </div>
    </div>
  )

  if (!data?.mp4) return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h2 className="font-bold text-2xl text-white mb-2">Video Not Available</h2>
        <p className="text-white/50 mb-6">{error || 'This video is currently unavailable'}</p>
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black">
      <div
        ref={containerRef}
        className="relative w-full h-full"
        onMouseMove={showControls}
        onTouchStart={showControls}
        onClick={togglePlay}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={
            data.mp4.includes('munoserver') || data.mp4.includes('.club')
              ? `/api/stream?url=${encodeURIComponent(data.mp4)}`
              : data.mp4
          }
          poster={data.poster || undefined}
          className="w-full h-full object-contain"
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
        />

        {/* Buffering */}
        {buffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/50">
            <Loader2 className="w-16 h-16 text-white animate-spin drop-shadow-2xl" />
          </div>
        )}

        {/* Center controls - Always visible when controls are shown */}
        <AnimatePresence>
          {showCtrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
              onClick={e => e.stopPropagation()}
            >
              {/* Center: Rewind/Play/Forward */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8 pointer-events-auto">
                {/* Rewind 15s */}
                <motion.button
                  onClick={(e) => { 
                    e.stopPropagation();
                    if (videoRef.current) videoRef.current.currentTime -= 15;
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 flex items-center justify-center"
                >
                  <SkipBack className="w-10 h-10 text-white drop-shadow-2xl" strokeWidth={2} />
                </motion.button>

                {/* Play/Pause */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl"
                >
                  {playing ? (
                    <Pause className="w-10 h-10 text-black" fill="black" />
                  ) : (
                    <Play className="w-10 h-10 text-black fill-black ml-1" />
                  )}
                </motion.button>

                {/* Forward 15s */}
                <motion.button
                  onClick={(e) => { 
                    e.stopPropagation();
                    if (videoRef.current) videoRef.current.currentTime += 15;
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 flex items-center justify-center"
                >
                  <SkipForward className="w-10 h-10 text-white drop-shadow-2xl" strokeWidth={2} />
                </motion.button>
              </div>

              {/* Bottom: Progress bar, time, and fullscreen */}
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 pointer-events-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                {/* Progress bar */}
                <div
                  className="relative h-1 bg-white/30 rounded-full cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    seek(e);
                  }}
                >
                  {/* Buffered progress */}
                  <div className="absolute h-full bg-white/50 rounded-full" style={{ width: `${bufPct}%` }} />
                  {/* Current progress */}
                  <div className="absolute h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
                </div>

                {/* Time and fullscreen */}
                <div className="flex justify-between items-center text-white text-sm">
                  <span className="font-medium drop-shadow">{fmtTime(current)}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="p-1 hover:bg-white/10 rounded transition-all"
                  >
                    {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
