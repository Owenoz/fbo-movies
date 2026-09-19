import { NextRequest, NextResponse } from 'next/server'
import { getNaraCatalogServer, slugToId } from '@/lib/narabox'

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMDUxNTkyM2M2MzgxZDc2NDNkODk0OTk3OTZiZmFmMCIsIm5iZiI6MTY5NDg3MzY4OC4wMzMsInN1YiI6IjY1MDViODU4Mzk0YTg3MDExYzljYWQxZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.QRNylr5k3CEf1L0KBcpHUrht_6I966N0ZqCO5jbRLy8'

// TMDB poster cache
const tmdbCache = new Map<string, { poster_path: string | null; backdrop_path: string | null; release_date: string; vote_average: number }>()

async function getTmdbPoster(title: string) {
  if (tmdbCache.has(title)) return tmdbCache.get(title)!
  try {
    const res  = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&page=1`, {
      headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
      next: { revalidate: 86400 },
    })
    const data = await res.json()
    const t    = data.results?.[0]
    const result = {
      poster_path:   t?.poster_path   ?? null,
      backdrop_path: t?.backdrop_path ?? null,
      release_date:  t?.release_date  ?? '',
      vote_average:  t?.vote_average  ?? 0,
    }
    tmdbCache.set(title, result)
    return result
  } catch {
    return { poster_path: null, backdrop_path: null, release_date: '', vote_average: 0 }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page   = parseInt(searchParams.get('page')   || '1')
  const limit  = parseInt(searchParams.get('limit')  || '24')
  const vj     = searchParams.get('vj')    || ''
  const query  = searchParams.get('q')     || ''
  const enrich = searchParams.get('enrich') === '1'

  const catalog = await getNaraCatalogServer()

  // filter
  let filtered = catalog
  if (vj)    filtered = filtered.filter(m => m.vj === vj)
  if (query) {
    const q = query.toLowerCase()
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(q) || m.vj.toLowerCase().includes(q)
    )
  }

  const total = filtered.length
  const slice = filtered.slice((page - 1) * limit, page * limit)

  // attach deterministic id + enrich with TMDB poster if requested
  const results = await Promise.all(
    slice.map(async (m) => {
      const base = { ...m, id: slugToId(m.slug) }
      if (!enrich) return base
      // use NaraBox portal poster first, fall back to TMDB
      if (m.poster) return { ...base, poster_path: null } // use m.poster directly in card
      const tmdb = await getTmdbPoster(m.title)
      return { ...base, ...tmdb }
    })
  )

  return NextResponse.json({ results, total, page, total_pages: Math.ceil(total / limit) })
}
