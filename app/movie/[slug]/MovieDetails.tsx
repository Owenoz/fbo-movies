'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Play, Heart, Star, Clock, Calendar, User, ArrowLeft, Share2 } from 'lucide-react'
import { useWatchlist, useRatings, useWatchHistory } from '@/lib/useUserData'
import { getNaraCatalogServer, type NaraMovie } from '@/lib/narabox'
import MovieCard from '@/components/MovieCard'

interface MovieDetailsProps {
  slug: string
}

export default function MovieDetails({ slug }: MovieDetailsProps) {
  const router = useRouter()
  const [movie, setMovie] = useState<NaraMovie | null>(null)
  const [similar, setSimilar] = useState<NaraMovie[]>([])
  const [loading, setLoading] = useState(true)
  
  const { isInWatchlist, toggleWatchlist } = useWatchlist()
  const { getRating, addRating } = useRatings()
  const { getProgress } = useWatchHistory()
  
  const [userRating, setUserRating] = useState(0)
  const [review, setReview] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const catalog = await getNaraCatalogServer()
        const found = catalog.find(m => m.slug === slug)
        if (!found) {
          router.push('/movies')
          return
        }
        setMovie(found)
        
        // Find similar movies (same VJ)
        const similarMovies = catalog
          .filter(m => m.vj === found.vj && m.slug !== slug)
          .slice(0, 12)
        setSimilar(similarMovies)
        
        // Load user rating
        const existingRating = getRating(slug)
        if (existingRating) {
          setUserRating(existingRating.rating)
          setReview(existingRating.review || '')
        }
      } catch (error) {
        console.error('Failed to load movie:', error)
      }
      setLoading(false)
    }
    load()
  }, [slug, router, getRating])

  const handleRatingSubmit = () => {
    if (userRating > 0) {
      addRating(slug, userRating, review.trim() || undefined)
      setShowReviewForm(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && movie) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Watch ${movie.title} - VJ ${movie.vj} on FBO Movies`,
          url: window.location.href,
        })
      } catch {}
    }
  }

  if (loading) return null
  if (!movie) return null

  const inWatchlist = isInWatchlist(slug)
  const progress = getProgress(slug)

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      {movie.poster && (
        <div className="fixed inset-0 w-full h-screen overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d001a]/60 via-[#0d001a]/85 to-[#0d001a]" style={{ zIndex: 1 }} />
          <img src={movie.poster} alt="" className="w-full h-full object-cover opacity-20 blur-2xl scale-110" />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12" style={{ zIndex: 10 }}>
        
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white mb-6 transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="lg:sticky lg:top-24">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-purple-500/20 glow-box-purple">
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                    <Play className="w-20 h-20 text-white/30" />
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/watch/${slug}`)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-purple-500/40 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {progress && progress.progress > 5 ? 'Continue' : 'Watch Now'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleWatchlist({ slug: movie.slug, title: movie.title, vj: movie.vj, poster: movie.poster ?? undefined })}
                  className={`glass-card p-3.5 rounded-xl transition-all ${inWatchlist ? 'text-pink-500 border-pink-500/30' : 'text-white'}`}
                >
                  <Heart className={`w-6 h-6 ${inWatchlist ? 'fill-current' : ''}`} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="glass-card p-3.5 rounded-xl text-white"
                >
                  <Share2 className="w-6 h-6" />
                </motion.button>
              </div>

              {progress && progress.progress > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 glass-card p-4 rounded-xl border border-purple-500/20"
                >
                  <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                    <span className="font-medium">Your Progress</span>
                    <span className="text-purple-400 font-bold">{Math.round(progress.progress)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-5"
          >
            <div className="space-y-3">
              <h1 className="font-orbitron font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-tight drop-shadow-lg">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/30 to-purple-500/30 border border-purple-500/40 backdrop-blur-md">
                  <User className="w-4 h-4 text-purple-300" />
                  <span className="text-purple-200 font-bold text-sm">{movie.vj}</span>
                </div>
              </div>
            </div>

            {movie.overview && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-5 sm:p-6 rounded-2xl border border-white/15"
              >
                <h2 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                  Overview
                </h2>
                <p className="text-white/80 leading-relaxed">{movie.overview}</p>
              </motion.div>
            )}

            {/* Rating Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-5 sm:p-6 rounded-2xl border border-white/15"
            >
              <h2 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
                Your Rating
              </h2>
              
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <motion.button
                    key={star}
                    onClick={() => { setUserRating(star); setShowReviewForm(true); }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="transition-all"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= userRating ? 'text-amber-400 fill-amber-400 drop-shadow-lg' : 'text-white/20'}`}
                    />
                  </motion.button>
                ))}
                {userRating > 0 && (
                  <span className="ml-2 text-white/80 font-semibold">{userRating}/5</span>
                )}
              </div>

              {showReviewForm && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <textarea
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    placeholder="Write your review (optional)..."
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all resize-none"
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={handleRatingSubmit} 
                      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg shadow-purple-500/30 transition-all"
                    >
                      Save Rating
                    </button>
                    <button 
                      onClick={() => setShowReviewForm(false)} 
                      className="glass-card px-6 py-2.5 rounded-lg font-medium text-white/80 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {userRating > 0 && review && !showReviewForm && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-white/5 rounded-xl border border-white/15"
                >
                  <p className="text-white/80 italic leading-relaxed">"{review}"</p>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="mt-3 text-sm text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Edit Review
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* Similar Movies */}
            {similar.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-6"
              >
                <h2 className="font-bold text-2xl text-white mb-5 flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                  More from {movie.vj}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {similar.map((m, i) => (
                    <motion.div
                      key={m.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                    >
                      <MovieCard
                        id={i}
                        title={m.title}
                        posterUrl={m.poster ?? undefined}
                        vj={m.vj}
                        slug={m.slug}
                        sourceType="narabox"
                        index={i}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
