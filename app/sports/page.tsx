'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, PlayCircle, Tv, ArrowLeft, Radio } from 'lucide-react'
import { initAdBlocker } from './ad-blocker'
import HLSPlayer from '@/components/HLSPlayer'

interface SportsChannel {
  id: string
  name: string
  sport: string
  league: string
  logo: string
  streamUrl: string
  quality: string
  language: string
  status: 'live' | 'offline'
}

export default function SportsPage() {
  const [loading, setLoading] = useState(true)
  const [channels, setChannels] = useState<SportsChannel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<SportsChannel | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'football' | 'basketball' | 'cricket' | 'other'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initAdBlocker()
    fetchChannels()
  }, [])

  const fetchChannels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sports-channels')
      const data = await response.json()
      
      if (data.success) {
        setChannels(data.channels)
      } else {
        setError('Failed to load channels')
      }
    } catch (err) {
      setError('Network error')
      console.error('Failed to fetch channels:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredChannels = channels.filter(channel => {
    if (activeTab === 'all') return true
    if (activeTab === 'football') return channel.sport === 'Football'
    if (activeTab === 'basketball') return channel.sport === 'Basketball'
    if (activeTab === 'cricket') return channel.sport === 'Cricket'
    return channel.sport !== 'Football' && channel.sport !== 'Basketball' && channel.sport !== 'Cricket'
  })

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Loading Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
          >
            <motion.div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-600 flex items-center justify-center"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-white font-bold text-2xl mb-2">Loading Live Sports...</h1>
              <p className="text-white/60">HD Streams Available</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Channel Player */}
      <AnimatePresence>
        {selectedChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col p-4"
          >
            {/* Player Header */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setSelectedChannel(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Channels
              </button>

              <div className="text-center flex-1 px-4">
                <h2 className="text-white font-bold text-xl">{selectedChannel.name}</h2>
                <p className="text-white/60 text-sm">{selectedChannel.league} • {selectedChannel.language}</p>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-red-600/80">
                <Radio className="w-4 h-4 text-white animate-pulse" />
                <span className="text-white text-sm font-bold">LIVE</span>
              </div>
            </div>

            {/* Video Player */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-6xl">
                <iframe
                  src={selectedChannel.streamUrl}
                  className="w-full aspect-video rounded-xl border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  title={selectedChannel.name}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/20 border border-green-500/30 mb-4">
          <Trophy className="w-5 h-5 text-green-400" />
          <span className="text-green-300 font-bold text-sm">LIVE SPORTS HD</span>
        </div>
        <h1 className="font-bold text-4xl md:text-5xl text-white mb-2">Sports Channels</h1>
        <p className="text-white/70">Watch live sports in HD quality - {channels.length} channels available</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2"
      >
        {[
          { key: 'all', label: 'All Sports', icon: '🏆' },
          { key: 'football', label: 'Football', icon: '⚽' },
          { key: 'basketball', label: 'Basketball', icon: '🏀' },
          { key: 'cricket', label: 'Cricket', icon: '🏏' },
          { key: 'other', label: 'Other', icon: '🎾' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((channel, index) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedChannel(channel)}
            className="glass-card p-6 rounded-2xl border border-white/10 hover:border-green-500/50 cursor-pointer transition-all group"
          >
            {/* Channel Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{channel.logo}</div>
                <div>
                  <h3 className="text-white font-bold text-lg group-hover:text-green-400 transition-colors">
                    {channel.name}
                  </h3>
                  <p className="text-white/60 text-sm">{channel.league}</p>
                </div>
              </div>
              
              {channel.status === 'live' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/50">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 font-bold text-xs">LIVE</span>
                </div>
              )}
            </div>

            {/* Channel Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-white/50">Quality:</span>
                  <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-semibold text-xs">
                    {channel.quality}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white/50">Lang:</span>
                  <span className="text-white/80">{channel.language}</span>
                </div>
              </div>
              
              <button className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-500 group-hover:from-green-500 group-hover:to-green-400 flex items-center justify-center transition-all">
                <PlayCircle className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredChannels.length === 0 && !loading && (
        <div className="text-center py-12">
          <Tv className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">No channels available in this category</p>
        </div>
      )}
    </div>
  )
}
