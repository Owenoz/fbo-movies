import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Star, Calendar, Play, ArrowLeft, Layers, Globe } from 'lucide-react'
import { getTMDBTvDetails, tmdbImage, formatRating, getYear } from '@/lib/api'
import ContentRow from '@/components/ContentRow'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getTMDBTvDetails(Number(params.id))
  return { title: data?.name ?? 'TV Show', description: data?.overview ?? '' }
}

export default async function TvDetailPage({ params }: Props) {
  const show = await getTMDBTvDetails(Number(params.id))
  if (!show) notFound()

  const backdrop = tmdbImage(show.backdrop_path, 'original')
  const poster   = tmdbImage(show.poster_path, 'w500')
  const cast     = show.credits?.cast?.slice(0, 12) ?? []
  const similar  = show.similar?.results?.slice(0, 12) ?? []
  const trailer  = show.videos?.results?.find(
    (v: { type: string; site: string }) => v.type === 'Trailer' && v.site === 'YouTube'
  )

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden" style={{ height: '65vh', minHeight: '380px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={backdrop} alt={show.name} className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(13,0,26,1) 0%, rgba(13,0,26,0.65) 50%, rgba(13,0,26,0.2) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,0,26,1) 0%, transparent 50%)' }} />
        <div className="absolute top-6 left-6" style={{ zIndex: 10 }}>
          <Link href="/tv" className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-white/70 hover:text-white transition-all border border-white/15"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" style={{ marginTop: '-200px', position: 'relative', zIndex: 10 }}>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-none">
            <div className="w-44 md:w-56 rounded-2xl overflow-hidden border border-white/15" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={poster} alt={show.name} className="w-full object-cover" />
            </div>
          </div>

          <div className="flex-1 pt-2">
            <div className="flex flex-wrap gap-2 mb-3">
              {show.genres?.map((g: { id: number; name: string }) => (
                <span key={g.id} className="px-3 py-1 rounded-full text-xs text-blue-300 border border-blue-500/30"
                  style={{ background: 'rgba(59,130,246,0.1)' }}>
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="font-orbitron font-bold text-4xl sm:text-5xl text-white leading-tight mb-2"
              style={{ textShadow: '0 0 30px rgba(147,51,234,0.4)' }}>
              {show.name}
            </h1>
            {show.tagline && <p className="text-blue-300/70 italic text-sm mb-4">"{show.tagline}"</p>}

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/50 mb-6">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-bold">{formatRating(show.vote_average)}</span>
              </div>
              {show.number_of_seasons && (
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>{show.number_of_seasons} Season{show.number_of_seasons > 1 ? 's' : ''}</span>
                </div>
              )}
              {show.number_of_episodes && <span>{show.number_of_episodes} Episodes</span>}
              {show.first_air_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>{getYear(show.first_air_date)}</span>
                </div>
              )}
              {show.original_language && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="uppercase">{show.original_language}</span>
                </div>
              )}
              {show.status && (
                <span className={`px-3 py-0.5 rounded-full text-xs border ${show.status === 'Ended' ? 'text-red-300 border-red-500/30' : 'text-green-300 border-green-500/30'}`}
                  style={{ background: show.status === 'Ended' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)' }}>
                  {show.status}
                </span>
              )}
            </div>

            <p className="text-white/70 leading-relaxed text-sm sm:text-base mb-7 max-w-2xl">{show.overview}</p>

            <div className="flex flex-wrap gap-3">
              {trailer ? (
                <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer"
                  className="btn-galaxy gap-2 text-sm">
                  <Play className="w-4 h-4 fill-current" />
                  Watch Trailer
                </a>
              ) : (
                <button className="btn-galaxy gap-2 text-sm">
                  <Play className="w-4 h-4 fill-current" />
                  Watch Now
                </button>
              )}
            </div>
          </div>
        </div>

        {cast.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, #3b82f6, #06b6d4)' }} />
              <h2 className="font-orbitron font-bold text-xl text-white">Cast</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {cast.map((person: { id: number; name: string; character: string; profile_path: string | null }) => (
                <div key={person.id} className="flex-none w-20 text-center group">
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border border-white/15 mb-2">
                    {person.profile_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tmdbImage(person.profile_path, 'w185')} alt={person.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 font-bold text-xl">{person.name[0]}</div>
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
            <ContentRow title="Similar Shows" items={similar} defaultType="tv" accentColor="from-blue-500 to-cyan-400" />
          </div>
        )}
      </div>
    </div>
  )
}
