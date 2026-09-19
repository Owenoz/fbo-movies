'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, SkipForward, SkipBack,
  Loader2, AlertCircle, Settings, Mic
} from 'lucide-react'

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
  const [data,      setData]      = useState<MovieData | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  // player state
  const videoRef   = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing,   setPlaying]   = useState(false)
  const [muted,     setMuted]     = useState(false)
  const [volume,    setVolume]    = useState(1)
  const [current,   setCurrent]   = useState(0)
  const [duration,  setDuration]  = useState(0)
  const [buffered,  setBuffered]  = useState(0)
  const [fullscreen,setFullscreen]= useState(false)
  const [showCtrl,  setShowCtrl]  = useState(true)
  const [buffering, setBuffering] = useState(false)
  const [quality,   setQuality]   = useState('720p')
  const ctrlTimer  = useRef<ReturnType<typeof setTimeout>>()

  // fetch movie data from our scraper API
  useEffect(() => {
    setLoading(true)
    fetch(`/api/movie-data?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  // auto-hide controls
  const showControls = () => {
    setShowCtrl(true)
    clearTimeout(ctrlTimer.current)
    ctrlTimer.current = setTimeout(() => {
      if (playing) setShowCtrl(false)
    }, 3000)
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime    = () => setCurrent(v.currentTime)
    const onDur     = () => setDuration(v.duration)
    const onPlay    = () => setPlaying(true)
    const onPause   = () => setPlaying(false)
    const onWait    = () => setBuffering(true)
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

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current
      if (!v) return
      if (e.target instanceof HTMLInputElement) return
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break
        case 'ArrowRight': v.currentTime += 10; break
        case 'ArrowLeft':  v.currentTime -= 10; break
        case 'ArrowUp':    v.volume = Math.min(1, v.volume + 0.1); setVolume(v.volume); break
        case 'ArrowDown':  v.volume = Math.max(0, v.volume - 0.1); setVolume(v.volume); break
        case 'm': toggleMute(); break
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
    const pct  = (e.clientX - rect.left) / rect.width
    v.currentTime = pct * duration
  }

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current
    if (!v) return
    const val = parseFloat(e.target.value)
    v.volume = val
    v.muted  = val === 0
    setVolume(val)
    setMuted(val === 0)
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  const pct      = duration ? (current / duration) * 100 : 0
  const bufPct   = duration ? (buffered / duration) * 100 : 0
  const vj       = parseVJ(slug)
  const title    = cleanTitle(slug)

  // ── Loading ──
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
        <p className="text-white/50">Loading movie…</p>
      </div>
    </div>
  )

  // ── No video available ──
  if (!data?.mp4 && !loading) return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="font-orbitron font-bold text-2xl text-white mb-2">Video Not Available</h2>
        <p className="text-white/50 mb-6">
          <strong className="text-white">{title}</strong> is listed but the video file isn't available yet on NaraBox TV.
        </p>
        <Link href="/movies" className="btn-galaxy inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Browse Movies
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      {/* ── Top bar ── */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center gap-4 px-4 py-3"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <Link href="/movies"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-white font-medium truncate max-w-[200px] sm:max-w-sm">{title}</span>
          {vj && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ background: 'rgba(147,51,234,0.8)' }}>
              <Mic className="w-3 h-3" />{vj}
            </span>
          )}
        </div>
      </div>

      {/* ── Video player ── */}
      <div
        ref={containerRef}
        className="relative w-full select-none"
        style={{ background: '#000', minHeight: '100svh' }}
        onMouseMove={showControls}
        onTouchStart={showControls}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={data!.mp4!}
          poster={data?.backdrop || data?.poster || undefined}
          className="w-full"
          style={{ minHeight: '100svh', maxHeight: '100svh', objectFit: 'contain' }}
          playsInline
          preload="metadata"
        />

        {/* buffering spinner */}
        {buffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 className="w-14 h-14 text-white/60 animate-spin" />
          </div>
        )}

        {/* big play/pause flash */}
        <AnimatePresence>
          {!playing && !buffering && (
            <motion.div
              key="paused"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.3)' }}>
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Controls overlay ── */}
        <AnimatePresence>
          {showCtrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-16"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* ── Progress bar ── */}
              <div
                className="relative w-full h-1.5 rounded-full cursor-pointer mb-4 group"
                style={{ background: 'rgba(255,255,255,0.2)' }}
                onClick={seek}
              >
                {/* buffered */}
                <div className="absolute left-0 top-0 h-full rounded-full transition-all"
                  style={{ width: `${bufPct}%`, background: 'rgba(255,255,255,0.3)' }} />
                {/* played */}
                <div className="absolute left-0 top-0 h-full rounded-full"
                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #9333ea, #3b82f6)' }} />
                {/* thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${pct}% - 8px)`, background: 'white' }}
                />
              </div>

              {/* ── Control buttons ── */}
              <div className="flex items-center justify-between gap-3">
                {/* Left controls */}
                <div className="flex items-center gap-3">
                  {/* skip back */}
                  <button
                    onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10 }}
                    className="text-white/70 hover:text-white transition-colors p-1"
                    aria-label="Rewind 10s"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  {/* play/pause */}
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                    style={{ background: 'linear-gradient(135deg,#9333ea,#3b82f6)' }}
                    aria-label={playing ? 'Pause' : 'Play'}
                  >
                    {playing
                      ? <Pause  className="w-5 h-5 fill-current" />
                      : <Play   className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  {/* skip forward */}
                  <button
                    onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10 }}
                    className="text-white/70 hover:text-white transition-colors p-1"
                    aria-label="Forward 10s"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  {/* volume */}
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors" aria-label="Mute">
                      {muted || volume === 0
                        ? <VolumeX className="w-5 h-5" />
                        : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={muted ? 0 : volume}
                      onChange={changeVolume}
                      className="w-20 h-1 rounded-full accent-purple-500 hidden sm:block cursor-pointer"
                      aria-label="Volume"
                    />
                  </div>

                  {/* time */}
                  <span className="text-white/60 text-xs font-mono hidden sm:block">
                    {fmtTime(current)} / {fmtTime(duration)}
                  </span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                  {/* quality badge */}
                  <span className="text-white/50 text-xs px-2 py-0.5 rounded border border-white/20 hidden sm:block">
                    {quality}
                  </span>

                  {/* fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="text-white/70 hover:text-white transition-colors p-1"
                    aria-label="Fullscreen"
                  >
                    {fullscreen
                      ? <Minimize className="w-5 h-5" />
                      : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* ── Mobile time display ── */}
              <div className="flex justify-center mt-1 sm:hidden">
                <span className="text-white/50 text-xs font-mono">
                  {fmtTime(current)} / {fmtTime(duration)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Movie info below player ── */}
      {data?.overview && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-4 mb-4">
            <div>
              <h1 className="font-orbitron font-bold text-2xl text-white mb-1">{title}</h1>
              {vj && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#9333ea,#3b82f6)' }}>
                    <Mic className="w-3.5 h-3.5" />
                    {vj} Translation
                  </span>
                  <span className="text-white/30 text-xs px-2 py-1 rounded border border-white/10">
                    NaraBox TV
                  </span>
                </div>
              )}
              <p className="text-white/60 text-sm leading-relaxed">{data.overview}</p>
            </div>
          </div>

          {/* keyboard shortcuts hint */}
          <div className="mt-6 p-4 rounded-xl border border-white/8"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-white/30 text-xs mb-2 font-semibold uppercase tracking-widest">Keyboard Shortcuts</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-white/30 text-xs">
              <span><kbd className="text-white/50">Space</kbd> Play/Pause</span>
              <span><kbd className="text-white/50">←→</kbd> Skip 10s</span>
              <span><kbd className="text-white/50">↑↓</kbd> Volume</span>
              <span><kbd className="text-white/50">M</kbd> Mute</span>
              <span><kbd className="text-white/50">F</kbd> Fullscreen</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
