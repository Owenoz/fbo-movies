// ─── NaraBox VJ Catalog (pre-validated) ──────────────────────────────────────
// Import JSON directly so it works on Vercel serverless (no fs.readFileSync)
import catalogData from '../public/narabox_catalog.json'

export interface NaraMovie {
  title: string
  vj: string
  slug: string
  url: string
  mp4?: string | null
  poster?: string | null
  overview?: string | null
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  vote_average?: number
}

const _catalog: NaraMovie[] = catalogData as NaraMovie[]

export async function getNaraCatalogServer(): Promise<NaraMovie[]> {
  return _catalog
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
