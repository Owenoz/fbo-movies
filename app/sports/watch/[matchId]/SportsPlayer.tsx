'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, AlertCircle, Radio, RefreshCw } from 'lucide-react'

interface StreamSource {
  name: string
  url: string
  quality: string
  type: 'embed' | 'direct'
}

export default function SportsPlayer({ matchId }: { matchId: string }) {
  const [sources, setSources] = useState<StreamSource[]>([])
  const [selectedSource, setSelectedSource] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStreamSources()
  }, [matchId])

  async function loadStreamSources() {
    try {
      setLoading(true)
      setError(null)
      
      // Get stream URL from URL params
      const params = new URLSearchParams(window.location.search)
      const streamParam = params.get('stream')
      
      // Fetch from AK47 Sports API
      const ak47Sources: StreamSource[] = []
      
      if (streamParam) {
        // Direct stream URL provided
        ak47Sources.push({
          name: 'AK47 HD Stream',
          url: streamParam,
          quality: '1080p',
          type: 'direct'
        })
      }
      
      // Try to fetch additional streams from API
      try {
        const response = await fetch(`https://khhjjshv.com/api/match/${matchId}/streams`)
        if (response.ok) {
          const data = await response.json()
          if (data.streams && Array.isArray(data.streams)) {
            data.streams.forEach((stream: any, idx: number) => {
              ak47Sources.push({
                name: stream.name || `HD Stream ${idx + 1}`,
                url: stream.url,
                quality: stream.quality || '720p',
                type: 'embed'
              })
            })
          }
        }
      } catch (apiError) {
        console.log('Could not fetch additional streams from API')
      }
      
      // If no streams found, add fallback options
      if (ak47Sources.length === 0) {
        ak47Sources.push(
          {
            name: 'Stream 1',
            url: `https://khhjjshv.com/embed/${matchId}`,
            quality: '720p',
            type: 'embed'
          },
          {
            name: 'Stream 2',
            url: `https://sportshd.me/live/${matchId}`,
            quality: '1080p',
            type: 'embed'
          },
          {
            name: 'Mobile Stream',
            url: `https://mobile.livesport.stream/${matchId}`,
            quality: '480p',
            type: 'embed'
          }
        )
      }
      
      setSources(ak47Sources)
    } catch (err) {
      setError('Failed to load stream sources')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading stream...</p>
        </div>
      </div>
    )
  }

  if (error || sources.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Stream Unavailable</h2>
          <p className="text-white/60 mb-6">
            {error || 'No stream sources available for this match at the moment.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadStreamSources}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/tv"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sports
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentSource = sources[selectedSource]

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Top Bar */}
      <div className="relative z-50 flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <Link
          href="/tv"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Sports</span>
        </Link>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 animate-pulse">
          <Radio className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-bold">LIVE</span>
        </div>

        <a
          href={currentSource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">Open in New Tab</span>
        </a>
      </div>

      {/* Player */}
      <div className="flex-1 relative bg-black">
        <iframe
          src={currentSource.url}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          sandbox="allow-same-origin allow-scripts allow-presentation allow-forms"
        />
      </div>

      {/* Bottom Controls */}
      {sources.length > 1 && (
        <div className="relative z-50 p-4 bg-black/80 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <p className="text-white/60 text-sm mb-3">Select Stream Source:</p>
            <div className="flex gap-3 overflow-x-auto">
              {sources.map((source, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSource(idx)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                    idx === selectedSource
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{source.name}</span>
                    <span className="text-xs opacity-75">({source.quality})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notice */}
      <div className="relative z-50 px-4 py-2 bg-yellow-500/10 border-t border-yellow-500/30">
        <p className="text-center text-yellow-400 text-xs">
          ⚠️ Streams are provided by third-party sources. Quality and availability may vary.
        </p>
      </div>
    </div>
  )
}
