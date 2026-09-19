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
    <div className="min-h-screen pt-16">
      {/* Backdrop */}
      {movie.poster && (
        <div className="absolute inset-0 w-full h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d001a]/80 to-[#0d001a]" style={{ zIndex: 1 }} />
          <img src={movie.poster} alt="" className="w-full h-full object-cover opacity-20 blur-xl" />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ zIndex: 10 }}>
        
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40">
                    <Play className="w-16 h-16 text-white/20" />
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/watch/${slug}`)}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {progress && progress.progress > 5 ? 'Continue' : 'Watch Now'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleWatchlist({ slug: movie.slug, title: movie.title, vj: movie.vj, poster: movie.poster ?? undefined })}
                  className={`btn-glass p-3 rounded-xl ${inWatchlist ? 'text-pink-500' : 'text-white'}`}
                >
                  <Heart className={`w-6 h-6 ${inWatchlist ? 'fill-current' : ''}`} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="btn-glass p-3 rounded-xl"
                >
                  <Share2 className="w-6 h-6" />
                </motion.button>
              </div>

              {progress && progress.progress > 0 && (
                <div className="mt-4 glass-card p-3 rounded-xl">
                  <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress.progress)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                      style={{ width: `${progress.progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div>
              <h1 className="font-orbitron font-bold text-4xl md:text-5xl text-white mb-3">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/60">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-semibold">{movie.vj}</span>
                </div>
              </div>
            </div>

            {movie.overview && (
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="font-semibold text-xl text-white mb-3">Overview</h2>
                <p className="text-white/70 leading-relaxed">{movie.overview}</p>
              </div>
            )}

            {/* Rating Section */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-semibold text-xl text-white mb-4">Your Rating</h2>
              
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => { setUserRating(star); setShowReviewForm(true); }}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= userRating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                    />
                  </button>
                ))}
                {userRating > 0 && (
                  <span className="ml-2 text-white/60">{userRating}/5</span>
                )}
              </div>

              {showReviewForm && (
                <div className="space-y-3">
                  <textarea
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    placeholder="Write your review (optional)..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors resize-none"
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <button onClick={handleRatingSubmit} className="btn-primary px-6 py-2 rounded-lg font-semibold">
                      Save Rating
                    </button>
                    <button onClick={() => setShowReviewForm(false)} className="btn-glass px-6 py-2 rounded-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {userRating > 0 && review && !showReviewForm && (
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/70 italic">"{review}"</p>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Similar Movies */}
            {similar.length > 0 && (
              <div className="pt-8">
                <h2 className="font-semibold text-2xl text-white mb-6 flex items-center gap-2">
                  More from {movie.vj}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {similar.map((m, i) => (
                    <MovieCard
                      key={m.slug}
                      id={i}
                      title={m.title}
                      posterUrl={m.poster ?? undefined}
                      vj={m.vj}
                      slug={m.slug}
                      sourceType="narabox"
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
