import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Star, Clock, Calendar, Play, ArrowLeft, Globe } from 'lucide-react'
import { getTMDBMovieDetails, tmdbImage, formatRating, formatRuntime, getYear } from '@/lib/api'
import ContentRow from '@/components/ContentRow'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getTMDBMovieDetails(Number(params.id))
  return {
    title: data?.title ?? 'Movie',
    description: data?.overview ?? '',
  }
}

export default async function MovieDetailPage({ params }: Props) {
  const movie = await getTMDBMovieDetails(Number(params.id))
  if (!movie) notFound()

  const backdrop = tmdbImage(movie.backdrop_path, 'original')
  const poster   = tmdbImage(movie.poster_path, 'w500')
  const cast     = movie.credits?.cast?.slice(0, 12) ?? []
  const similar  = movie.similar?.results?.slice(0, 12) ?? []
  const trailer  = movie.videos?.results?.find(
    (v: { type: string; site: string }) => v.type === 'Trailer' && v.site === 'YouTube'
  )

  return (
    <div className="min-h-screen">
      {/* ── Backdrop ── */}
      <div className="relative overflow-hidden" style={{ height: '65vh', minHeight: '380px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={backdrop} alt={movie.title} className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(13,0,26,1) 0%, rgba(13,0,26,0.65) 50%, rgba(13,0,26,0.2) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,0,26,1) 0%, transparent 50%)' }} />
        <div className="absolute top-6 left-6" style={{ zIndex: 10 }}>
          <Link href="/movies" className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-white/70 hover:text-white transition-all border border-white/15 hover:border-white/30"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" style={{ marginTop: '-200px', position: 'relative', zIndex: 10 }}>
        <div className="flex flex-col md:flex-row gap-8">

          {/* poster */}
          <div className="flex-none">
            <div className="w-44 md:w-56 rounded-2xl overflow-hidden border border-white/15"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={poster} alt={movie.title} className="w-full object-cover" />
            </div>
          </div>

          {/* info */}
          <div className="flex-1 pt-2">
            {/* genres */}
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genres?.map((g: { id: number; name: string }) => (
                <span key={g.id} className="px-3 py-1 rounded-full text-xs text-purple-300 border border-purple-500/30"
                  style={{ background: 'rgba(147,51,234,0.1)' }}>
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="font-orbitron font-bold text-4xl sm:text-5xl text-white leading-tight mb-2"
              style={{ textShadow: '0 0 30px rgba(147,51,234,0.4)' }}>
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-purple-300/70 italic text-sm mb-4">"{movie.tagline}"</p>
            )}

            {/* meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/50 mb-6">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-bold">{formatRating(movie.vote_average)}</span>
                <span className="text-white/30">/ 10</span>
              </div>
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
              {movie.release_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>{getYear(movie.release_date)}</span>
                </div>
              )}
              {movie.original_language && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="uppercase">{movie.original_language}</span>
                </div>
              )}
              {movie.status && (
                <span className="px-3 py-0.5 rounded-full text-xs text-green-300 border border-green-500/30"
                  style={{ background: 'rgba(34,197,94,0.1)' }}>
                  {movie.status}
                </span>
              )}
            </div>

            <p className="text-white/70 leading-relaxed text-sm sm:text-base mb-7 max-w-2xl">
              {movie.overview}
            </p>

            <div className="flex flex-wrap gap-3">
              {trailer ? (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-galaxy gap-2 text-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Watch Trailer
                </a>
              ) : (
                <button className="btn-galaxy gap-2 text-sm">
                  <Play className="w-4 h-4 fill-current" />
                  Play Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* cast */}
        {cast.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, #9333ea, #ec4899)' }} />
              <h2 className="font-orbitron font-bold text-xl text-white">Cast</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {cast.map((person: { id: number; name: string; character: string; profile_path: string | null }) => (
                <div key={person.id} className="flex-none w-20 text-center group">
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border border-white/15 mb-2"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {person.profile_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tmdbImage(person.profile_path, 'w185')}
                        alt={person.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 font-bold text-xl">
                        {person.name[0]}
                      </div>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium line-clamp-1">{person.name}</p>
                  <p className="text-white/40 text-xs line-clamp-1">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {similar.length > 0 && (
          <div className="mt-14">
            <ContentRow title="Similar Movies" items={similar} defaultType="movie" accentColor="from-purple-500 to-pink-500" />
          </div>
        )}
      </div>
    </div>
  )
}
