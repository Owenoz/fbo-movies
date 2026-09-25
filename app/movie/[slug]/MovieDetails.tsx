'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Play, Download, Bookmark, Star, Clock, ChevronDown } from 'lucide-react'
import { useWatchlist, useWatchHistory } from '@/lib/useUserData'
import { getNaraCatalogServer, getKibandaCatalogServer, type NaraMovie } from '@/lib/narabox'
import MovieCard from '@/components/MovieCard'

interface MovieDetailsProps {
  slug: string
}

export default function MovieDetails({ slug }: MovieDetailsProps) {
  const router = useRouter()
  const [movie, setMovie] = useState<NaraMovie | null>(null)
  const [recommended, setRecommended] = useState<NaraMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)
  
  const { isInWatchlist, toggleWatchlist } = useWatchlist()
  const { getProgress } = useWatchHistory()

  useEffect(() => {
    async function load() {
      try {
        const [naraCatalog, kibandaCatalog] = await Promise.all([
          getNaraCatalogServer(),
          getKibandaCatalogServer()
        ])
        const allMovies = [...naraCatalog, ...kibandaCatalog]
        const found = allMovies.find(m => m.slug === slug)
        if (!found) {
          router.push('/movies')
          return
        }
        setMovie(found)
        
        // Find recommended movies (same VJ)
        const recommendedMovies = allMovies
          .filter(m => m.vj === found.vj && m.slug !== slug)
          .slice(0, 4)
        setRecommended(recommendedMovies)
      } catch (error) {
        console.error('Failed to load movie:', error)
      }
      setLoading(false)
    }
    load()
  }, [slug, router])

  if (loading) return null
  if (!movie) return null

  const inWatchlist = isInWatchlist(slug)

  return (
    <div className="min-h-screen bg-black">
      
      {/* Video Player / Poster */}
      <div className="relative w-full aspect-video bg-black">
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
            <Play className="w-20 h-20 text-white/30" />
          </div>
        )}
        
        {/* Play Overlay centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            onClick={() => router.push(`/watch/${slug}`)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl"
          >
            <Play className="w-10 h-10 text-black fill-black ml-1" />
          </motion.button>
        </div>

        {/* Player controls at bottom (matching screenshot) */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress bar */}
          <div className="h-1 bg-white/30 rounded-full mb-3">
            <div className="h-full w-0 bg-white rounded-full" />
          </div>
          {/* Time display */}
          <div className="flex justify-between text-white text-sm">
            <span>00:00</span>
            <span>{movie.runtime ? `${Math.floor(movie.runtime / 60)}:${(movie.runtime % 60).toString().padStart(2, '0')}` : '2:11:47'}</span>
          </div>
        </div>
      </div>

      {/* Movie Info */}
      <div className="px-4 py-6 space-y-5">
        
        {/* Title */}
        <h1 className="text-white font-bold text-2xl leading-tight">
          {movie.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-white/70 text-sm">
          <span>2018</span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            6.3
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '2h 12m'}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium border border-white/20">
            18+
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium border border-white/20">
            Chinese
          </span>
          <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold border border-red-500">
            {movie.vj.replace(/^VJ\s+/i, 'VJ ').toUpperCase()}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium border border-white/20">
            Adventure
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={() => router.push(`/watch/${slug}`)}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-lg shadow-lg"
          >
            <Play className="w-6 h-6 fill-white" />
            Watch Now
          </motion.button>
          
          <motion.button
            onClick={async () => {
              if (!movie.mp4) return;
              try {
                // Use proxy API for Kibanda movies (they need referrer headers)
                const downloadUrl = `/api/download?slug=${encodeURIComponent(slug)}`;
                
                // Create a temporary download link
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `${movie.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              } catch (error) {
                console.error('Download error:', error);
                alert('Download failed. Please try again.');
              }
            }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20"
          >
            <Download className="w-6 h-6 text-white" />
          </motion.button>
          
          <motion.button
            onClick={() => toggleWatchlist({ slug: movie.slug, title: movie.title, vj: movie.vj, poster: movie.poster ?? undefined })}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20"
          >
            <Bookmark className={`w-6 h-6 ${inWatchlist ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </motion.button>
        </div>

        {/* Description */}
        {movie.overview && (
          <div className="space-y-2">
            <p className={`text-white/80 leading-relaxed ${!showFullDescription ? 'line-clamp-3' : ''}`}>
              {movie.overview}
            </p>
            {movie.overview.length > 150 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-red-500 text-sm font-medium flex items-center gap-1"
              >
                {showFullDescription ? 'See less' : 'See more'}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFullDescription ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* Recommended */}
        {recommended.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Recommended</h2>
              <button className="text-white/60 text-sm font-medium">View all</button>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {recommended.map((m, i) => (
                <motion.div
                  key={m.slug}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex-none w-32"
                >
                  <div 
                    onClick={() => router.push(`/movie/${m.slug}`)}
                    className="relative group cursor-pointer"
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 relative">
                      {m.poster ? (
                        <>
                          <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                          {/* VJ Badge overlay */}
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold">
                              {m.vj.replace(/^VJ\s+/i, 'VJ ').split(' ').slice(0, 2).join(' ').toUpperCase()}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-white text-sm font-medium line-clamp-2 leading-tight">
                      {m.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
