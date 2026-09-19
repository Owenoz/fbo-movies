'use client'

import { useWatchHistory } from '@/lib/useUserData'
import { motion } from 'framer-motion'
import { Play, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ContinueWatching() {
  const { continueWatching, loaded } = useWatchHistory()
  const router = useRouter()

  if (!loaded || continueWatching.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-14"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
          Continue Watching
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {continueWatching.map((item, i) => (
          <motion.div
            key={item.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative cursor-pointer"
            onClick={() => router.push(`/watch/${item.slug}`)}
          >
            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-blue-900/40 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white/20" />
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(147,51,234,0.9)', backdropFilter: 'blur(8px)' }}
                >
                  <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                </motion.div>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 + 0.2 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>

              {/* Progress percentage */}
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                {Math.round(item.progress)}%
              </div>
            </div>

            {/* Title and info */}
            <div className="mt-3">
              <h3 className="text-white font-medium line-clamp-1 group-hover:text-purple-300 transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
                <span>{item.vj}</span>
                {item.duration > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{Math.floor((item.duration * (100 - item.progress)) / 100 / 60)}m left</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
