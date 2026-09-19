// ─── NaraBox VJ Catalog (pre-validated) ──────────────────────────────────────
// Only movies confirmed to have a real MP4 on nbxgen.naraboxtv.com
// 462 movies — VJ Junior (211), VJ Emmy (64), VJ Mark (52), VJ Ice P (20)...

export interface NaraMovie {
  title: string
  vj: string
  slug: string
  url: string
  // from NaraBox scrape
  mp4?: string | null
  poster?: string | null
  overview?: string | null
  // enriched from TMDB
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  vote_average?: number
}

let _catalog: NaraMovie[] | null = null

export async function getNaraCatalogServer(): Promise<NaraMovie[]> {
  if (_catalog) return _catalog
  try {
    const fs   = await import('fs')
    const path = await import('path')
    const file = path.join(process.cwd(), 'public', 'narabox_catalog.json')
    _catalog   = JSON.parse(fs.readFileSync(file, 'utf-8'))
    return _catalog!
  } catch {
    return []
  }
}

export function getVJStats(catalog: NaraMovie[]) {
  const counts: Record<string, number> = {}
  catalog.forEach(m => { counts[m.vj] = (counts[m.vj] || 0) + 1 })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([vj, count]) => ({ vj, count }))
}

export function slugToId(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}
