'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, Star, Play } from 'lucide-react'
import Link from 'next/link'

// Upcoming movies (manually curated for now)
const comingSoonMovies = [
  {
    title: 'Avengers: Secret Wars',
    vj: 'VJ Junior',
    releaseDate: '2027-05-07',
    poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    overview: 'The culmination of the Multiverse Saga. All heroes unite for the biggest battle ever.',
    genre: 'Action, Adventure, Sci-Fi'
  },
  {
    title: 'Superman: Legacy',
    vj: 'VJ Emmy',
    releaseDate: '2026-07-11',
    poster: 'https://image.tmdb.org/t/p/w500/6DrHO1jr3qVrViUO6s6kFiAGM7.jpg',
    overview: 'The new era of the DCU begins with Superman returning to save humanity.',
    genre: 'Action, Adventure'
  },
  {
    title: 'Deadpool 3',
    vj: 'VJ Ice P',
    releaseDate: '2026-05-03',
    poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    overview: 'Deadpool joins the MCU in this multiversal adventure with Wolverine.',
    genre: 'Action, Comedy'
  },
  {
    title: 'Avatar 3',
    vj: 'VJ Jingo',
    releaseDate: '2026-12-20',
    poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    overview: 'The Sully family explores new regions of Pandora in this epic continuation.',
    genre: 'Action, Adventure, Sci-Fi'
  },
  {
    title: 'The Batman Part II',
    vj: 'VJ Junior',
    releaseDate: '2026-10-03',
    poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    overview: 'Batman faces new threats as Gotham descends into chaos.',
    genre: 'Action, Crime, Thriller'
  },
  {
    title: 'Fantastic Four',
    vj: 'VJ Ulio',
    releaseDate: '2027-02-14',
    poster: 'https://image.tmdb.org/t/p/w500/qrwI2T844nrBUv3eDwQZRDdgSFs.jpg',
    overview: 'Marvel\'s First Family finally joins the MCU in this cosmic adventure.',
    genre: 'Action, Adventure, Sci-Fi'
  }
]

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getDaysUntil(dateStr: string) {
  const now = new Date()
  const release = new Date(dateStr)
  const diff = release.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
}

export default function ComingSoonContent() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative h-64 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-purple-500 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
        </div>
        <div className="relative text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="font-orbitron font-bold text-4xl md:text-5xl text-white mb-4">
              Coming Soon
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Get ready for these upcoming VJ-translated Luganda movies
            </p>
          </motion.div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comingSoonMovies.map((movie, index) => (
            <motion.div
              key={movie.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all">
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                      <Play className="w-20 h-20 text-white/30" />
                    </div>
                  )}
                  
                  {/* Coming Soon Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold">
                    COMING SOON
                  </div>

                  {/* Countdown */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getDaysUntil(movie.releaseDate)} days
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-xl text-white line-clamp-1">{movie.title}</h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                      {movie.vj}
                    </span>
                    <span className="text-white/60 text-xs">{movie.genre}</span>
                  </div>

                  <div className="flex items-center gap-2 text-purple-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(movie.releaseDate)}
                  </div>

                  <p className="text-white/70 text-sm line-clamp-3">{movie.overview}</p>

                  <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors flex items-center justify-center gap-2">
                    <Star className="w-4 h-4" />
                    Notify Me
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Request Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10">
            <h3 className="font-bold text-2xl text-white">Want a specific movie translated?</h3>
            <p className="text-white/70 max-w-md">Request your favorite movies and we'll work with our VJs to bring them to you in Luganda</p>
            <Link
              href="/request"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold transition-all"
            >
              Request a Movie
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
