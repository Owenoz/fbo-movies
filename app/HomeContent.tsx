import HeroBanner from '@/components/HeroBanner'
import ContentRow from '@/components/ContentRow'
import ContinueWatching from '@/components/ContinueWatching'
import { getNaraCatalogServer, getVJStats, slugToId } from '@/lib/narabox'

export const revalidate = 3600

export default async function HomeContent() {
  const catalog = await getNaraCatalogServer()
  const vjStats = getVJStats(catalog)

  // Map catalog entries to the shape ContentRow / HeroBanner expect
  const toItem = (m: typeof catalog[0]) => ({
    id:           slugToId(m.slug),
    title:        m.title,
    vj:           m.vj,
    slug:         m.slug,
    poster_url:   m.poster  ?? undefined,   // NaraBox portal URL
    backdrop_url: m.poster  ?? undefined,   // use same for hero backdrop
    overview:     m.overview ?? '',
    media_type:   'movie' as const,
    type:         'movie',
  })

  // Hero — pick popular titles that have good posters
  const heroMovies = catalog.slice(0, 8).map(toItem)

  // Latest 24
  const recentMovies = catalog.slice(0, 24).map(toItem)

  // Top 5 VJs, 24 titles each
  const topVJs = vjStats.slice(0, 5).map(v => v.vj)
  const vjRows = topVJs.map(vj => ({
    vj,
    movies: catalog.filter(m => m.vj === vj).slice(0, 24).map(toItem),
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

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass-card px-5 py-3 rounded-2xl flex items-center gap-3">
            <span className="text-3xl font-bold text-gradient">{catalog.length}</span>
            <span className="text-white/50 text-sm leading-tight">VJ Movies<br/>Ready to Watch</span>
          </div>
          {vjStats.slice(0, 4).map(({ vj, count }) => (
            <div key={vj} className="glass-card px-4 py-2 rounded-xl text-center">
              <p className="text-white font-semibold text-sm">{vj}</p>
              <p className="text-white/40 text-xs">{count} movies</p>
            </div>
          ))}
        </div>

        <ContentRow title="🆕 Latest VJ Movies"       items={recentMovies} defaultType="movie" accentColor="from-purple-500 to-pink-500" sourceType="narabox" />
        {vjRows.map(({ vj, movies }, i) => (
          <ContentRow key={vj} title={`🎬 ${vj} Collection`} items={movies} defaultType="movie" accentColor={ROW_COLORS[i % ROW_COLORS.length]} sourceType="narabox" />
        ))}

      </div>
    </>
  )
}
