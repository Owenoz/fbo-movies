import HeroBanner from '@/components/HeroBanner'
import ContentRow from '@/components/ContentRow'
import ContinueWatching from '@/components/ContinueWatching'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import { getNaraCatalogServer, getKibandaCatalogServer, getVJStats, slugToId } from '@/lib/narabox'

export const revalidate = 3600

export default async function HomeContent() {
  // Fetch both catalogs
  const [naraCatalog, kibandaCatalog] = await Promise.all([
    getNaraCatalogServer(),
    getKibandaCatalogServer()
  ])
  
  // Combine catalogs
  const allMovies = [...naraCatalog, ...kibandaCatalog]
  const vjStats = getVJStats(allMovies)

  // Map catalog entries to the shape ContentRow / HeroBanner expect
  const toItem = (m: typeof allMovies[0]) => ({
    id:           slugToId(m.slug),
    title:        m.title,
    vj:           m.vj,
    slug:         m.slug,
    poster_url:   m.poster  ?? undefined,   // NaraBox/Kibanda portal URL
    backdrop_url: m.poster  ?? undefined,   // use same for hero backdrop
    overview:     m.overview ?? '',
    media_type:   'movie' as const,
    type:         'movie',
  })

  // Hero — pick popular titles that have good posters
  const heroMovies = allMovies.filter(m => m.poster).slice(0, 8).map(toItem)

  // Latest 24 from both sources
  const recentMovies = allMovies.slice(0, 24).map(toItem)
  
  // Latest from Kibanda specifically
  const kibandaMovies = kibandaCatalog.slice(0, 24).map(toItem)

  // Top 5 VJs, 24 titles each
  const topVJs = vjStats.slice(0, 5).map(v => v.vj)
  const vjRows = topVJs.map(vj => ({
    vj,
    movies: allMovies.filter(m => m.vj === vj).slice(0, 24).map(toItem),
  }))

  const ROW_COLORS = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-400',
    'from-pink-500 to-rose-400',
    'from-amber-500 to-orange-400',
    'from-green-500 to-emerald-400',
  ]

  return (
    <>
      <HeroBanner items={heroMovies} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

        {/* Continue Watching - client component */}
        <ContinueWatching />

        {/* Explore More CTA */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 mb-14"
          style={{ background: 'linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(59,130,246,0.15) 100%)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.5) 0%, transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)' }} />
          </div>
          <div className="relative p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(147,51,234,0.2)', border: '1px solid rgba(147,51,234,0.3)' }}>
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-purple-300 uppercase tracking-wider">Discover</span>
            </div>
            <h2 className="font-orbitron font-bold text-3xl md:text-4xl text-white mb-4">
              Explore More VJ Movies
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Discover thousands more Luganda-translated movies. 
              Stream from VJ Junior, VJ Emmy, VJ Ice P and 20+ more translators.
            </p>
            <Link href="/explore" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)', boxShadow: '0 10px 40px rgba(147,51,234,0.3)' }}>
              Browse All Movies
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* VJ Collections */}
        <div className="flex flex-wrap items-center gap-3">
          {vjStats.slice(0, 4).map(({ vj }) => (
            <div key={vj} className="glass-card px-4 py-2 rounded-xl text-center">
              <p className="text-white font-semibold text-sm">{vj}</p>
              <p className="text-white/40 text-xs">Collection</p>
            </div>
          ))}
        </div>

        <ContentRow title="🔥 Latest from Kibanda Vibes" items={kibandaMovies} defaultType="movie" accentColor="from-green-500 to-emerald-400" sourceType="narabox" />
        <ContentRow title="🆕 Latest VJ Movies"       items={recentMovies} defaultType="movie" accentColor="from-purple-500 to-pink-500" sourceType="narabox" />
        {vjRows.map(({ vj, movies }, i) => (
          <ContentRow key={vj} title={`🎬 ${vj} Collection`} items={movies} defaultType="movie" accentColor={ROW_COLORS[i % ROW_COLORS.length]} sourceType="narabox" />
        ))}

      </div>
    </>
  )
}
