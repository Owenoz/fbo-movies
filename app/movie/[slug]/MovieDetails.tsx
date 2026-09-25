'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Play, Download, Bookmark, Star, Clock, ChevronDown, Youtube, CheckCircle, Loader2 } from 'lucide-react'
import { useWatchlist, useWatchHistory } from '@/lib/useUserData'
import { getNaraCatalogServer, getKibandaCatalogServer, type NaraMovie } from '@/lib/narabox'
import MovieCard from '@/components/MovieCard'
import { downloadMovie, isMovieDownloaded, deleteOfflineMovie } from '@/lib/offlineMovies'

interface MovieDetailsProps {
  slug: string
}

export default function MovieDetails({ slug }: MovieDetailsProps) {
  const router = useRouter()
  const [movie, setMovie] = useState<NaraMovie | null>(null)
  const [recommended, setRecommended] = useState<NaraMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  
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

        // Check if movie is downloaded
        const downloaded = await isMovieDownloaded(slug)
        setIsDownloaded(downloaded)

        // Try to fetch trailer from TMDB
        fetchTrailer(found.title)
      } catch (error) {
        console.error('Failed to load movie:', error)
      }
      setLoading(false)
    }
    load()
  }, [slug, router])

  const fetchTrailer = async (title: string) => {
    try {
      const cleanTitle = title.replace(/\s*-?\s*VJ\s+\w+.*$/i, '').trim()
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=e9e9d8da18ae29fc430845952232787c&query=${encodeURIComponent(cleanTitle)}`)
      const data = await res.json()
      
      if (data.results && data.results[0]) {
        const movieId = data.results[0].id
        const videoRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=e9e9d8da18ae29fc430845952232787c`)
        const videoData = await videoRes.json()
        
        const trailer = videoData.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')
        if (trailer) {
          setTrailerKey(trailer.key)
        }
      }
    } catch (error) {
      console.error('Failed to fetch trailer:', error)
    }
  }

  const handleDownload = async () => {
    if (!movie || !movie.mp4) return

    const isKibanda = movie.mp4.includes('munoserver') || movie.mp4.includes('club')
    
    if (isKibanda) {
      alert('⚠️ Kibanda movies use streaming servers and cannot be downloaded.\n\nYou can only watch them online. Use the "Watch Now" button to stream.')
      return
    }

    if (isDownloaded) {
      // Delete if already downloaded
      if (confirm('Remove this movie from offline downloads?')) {
        try {
          await deleteOfflineMovie(slug)
          setIsDownloaded(false)
          alert('✅ Movie removed from offline storage')
        } catch (error) {
          alert('Failed to delete movie')
        }
      }
      return
    }

    // Download movie
    setDownloading(true)
    setDownloadProgress(0)

    try {
      await downloadMovie(
        slug,
        movie.title,
        movie.vj,
        movie.mp4,
        (progress) => setDownloadProgress(progress)
      )
      setIsDownloaded(true)
      alert('✅ Movie downloaded for offline viewing!')
    } catch (error) {
      console.error('Download failed:', error)
      alert('❌ Download failed. Please try again.')
    } finally {
      setDownloading(false)
      setDownloadProgress(0)
    }
  }

  if (loading) return null
  if (!movie) return null

  const inWatchlist = isInWatchlist(slug)

  return (
    <div className="min-h-screen bg-black">
      
      {/* Video Player / Poster / Trailer */}
      <div className="relative w-full aspect-video bg-black">
        {showTrailer && trailerKey ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0"
          />
        ) : movie.poster ? (
          <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
            <Play className="w-20 h-20 text-white/30" />
          </div>
        )}
        
        {!showTrailer && (
          <>
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

            {/* Trailer button - top right */}
            {trailerKey && (
              <motion.button
                onClick={() => setShowTrailer(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 right-4 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
              >
                <Youtube className="w-4 h-4" />
                Watch Trailer
              </motion.button>
            )}
          </>
        )}

        {showTrailer && (
          <motion.button
            onClick={() => setShowTrailer(false)}
            whileHover={{ scale: 1.05 }}
            className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold text-sm"
          >
            ✕ Close Trailer
          </motion.button>
        )}

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
            onClick={handleDownload}
            disabled={downloading}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20 relative disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="w-6 h-6 text-white animate-spin" />
                <span className="absolute -bottom-6 text-white text-xs font-bold">{downloadProgress}%</span>
              </>
            ) : isDownloaded ? (
              <CheckCircle className="w-6 h-6 text-green-500 fill-green-500" />
            ) : (
              <Download className="w-6 h-6 text-white" />
            )}
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
