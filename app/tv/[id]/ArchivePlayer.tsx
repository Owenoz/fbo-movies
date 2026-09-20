'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, SkipForward, SkipBack,
  Loader2, AlertCircle, Settings2
} from 'lucide-react'
import { getArchiveMovieDetails, type ArchiveMovie } from '@/lib/internetarchive'

export default function ArchivePlayer({ identifier }: { identifier: string }) {
  const [movie, setMovie] = useState<ArchiveMovie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [showCtrl, setShowCtrl] = useState(true)
  const [buffering, setBuffering] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const ctrlTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    loadMovie()
  }, [identifier])

  async function loadMovie() {
    try {
      setLoading(true)
      const data = await getArchiveMovieDetails(identifier)
      if (!data) {
        setError('Movie not found')
        return
      }
      setMovie(data)
    } catch (err) {
      setError('Failed to load movie')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fullscreen on mobile when video starts playing
  useEffect(() => {
    if (playing && videoRef.current && !fullscreen) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile && !document.fullscreenElement) {
        containerRef.current?.requestFullscreen?.().catch(() => {})
      }
    }
  }, [playing])

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
  }, [movie])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    playing ? v.pause() : v.play()
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    v.currentTime = pct * duration
  }

  const changeVolume = (val: number) => {
    const v = videoRef.current
    if (!v) return
    v.volume = val
    v.muted = val === 0
    setVolume(val)
    setMuted(val === 0)
  }

  const changePlaybackRate = (rate: number) => {
    const v = videoRef.current
    if (!v) return
    v.playbackRate = rate
    setPlaybackRate(rate)
    setShowSettings(false)
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(() => {})
    } else {
      await document.exitFullscreen()
    }
  }

  const fmtTime = (s: number) => {
    if (isNaN(s)) return '0:00'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`
    return `${m}:${sec.toString().padStart(2,'0')}`
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

  if (!movie?.video_url) return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h2 className="font-bold text-2xl text-white mb-2">Video Not Available</h2>
        <p className="text-white/50 mb-6">{error || 'This video is currently unavailable'}</p>
        <Link href="/tv" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Movies
        </Link>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black">
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
        onMouseMove={showControls}
        onTouchStart={showControls}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={movie.video_url}
          poster={movie.thumbnail}
          className="w-full h-full object-contain"
          playsInline
          preload="metadata"
        />

        {/* Buffering */}
        {buffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 className="w-16 h-16 text-white animate-spin" />
          </div>
        )}

        {/* Center play button when paused */}
        <AnimatePresence>
          {!playing && !buffering && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-24 h-24 rounded-full bg-purple-600/90 flex items-center justify-center backdrop-blur-sm">
                <Play className="w-12 h-12 text-white fill-white ml-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <AnimatePresence>
          {showCtrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 pointer-events-none"
              onClick={e => e.stopPropagation()}
            >
              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 pointer-events-auto">
                <Link
                  href="/tv"
                  className="p-2 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                  <h1 className="text-white font-semibold text-lg line-clamp-1">
                    {movie.title}
                  </h1>
                  {movie.year && (
                    <p className="text-white/60 text-sm">{movie.year}</p>
                  )}
                </div>
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 pointer-events-auto">
                {/* Progress bar */}
                <div
                  className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group"
                  onClick={seek}
                >
                  <div className="absolute h-full bg-white/30 rounded-full transition-all" style={{ width: `${bufPct}%` }} />
                  <div className="absolute h-full bg-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                  <div
                    className="absolute w-4 h-4 bg-white rounded-full shadow-lg top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `calc(${pct}% - 8px)` }}
                  />
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      {playing ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
                    </button>
                    <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10 }} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <SkipBack className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10 }} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <SkipForward className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex items-center gap-2 group/volume">
                      <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        {muted || volume === 0 ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={e => changeVolume(parseFloat(e.target.value))}
                        className="w-0 group-hover/volume:w-20 transition-all opacity-0 group-hover/volume:opacity-100"
                      />
                    </div>
                    <span className="text-white text-sm font-medium">
                      {fmtTime(current)} / {fmtTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Settings2 className="w-5 h-5 text-white" />
                      </button>
                      {showSettings && (
                        <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-[150px]">
                          <div className="text-white/60 text-xs font-semibold mb-2 px-2">Playback Speed</div>
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                playbackRate === rate ? 'bg-purple-600 text-white' : 'text-white/80 hover:bg-white/10'
                              }`}
                            >
                              {rate}x {rate === 1 && '(Normal)'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      {fullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
