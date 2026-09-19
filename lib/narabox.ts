// ─── NaraBox VJ Catalog ───────────────────────────────────────────────────────
// Strategy:
//   1. Start with bundled static catalog (462 verified movies with MP4)
//   2. Fetch live sitemap every 24h to find NEW slugs added since last scan
//   3. New slugs get checked for MP4 at watch-time (not at list-time)
//   4. Only show movies in catalog that have MP4 confirmed

import staticCatalog from '../public/narabox_catalog.json'

export interface NaraMovie {
  title: string
  vj: string
  slug: string
  url: string
  mp4?: string | null
  poster?: string | null
  overview?: string | null
}

// ─── Slug parser ──────────────────────────────────────────────────────────────
export function parseSlug(url: string): NaraMovie | null {
  const slug = url.replace('https://naraboxtv.com/movies/', '').trim()
  if (!slug || slug.includes('/')) return null
  const vjMatch = slug.match(/-vj-([a-z0-9]+(?:-[a-z0-9]+)*)(?:-vj-[a-z0-9-]+)?$/)
  if (!vjMatch) return null
  const vj        = 'VJ ' + vjMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const titleSlug = slug.slice(0, vjMatch.index).replace(/-\d+$/, '')
  const title     = titleSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return { title, vj, slug, url: `https://naraboxtv.com/movies/${slug}` }
}

// ─── In-memory cache for the merged catalog ───────────────────────────────────
let _mergedCatalog: NaraMovie[] | null = null
let _lastFetch = 0
const CACHE_TTL = 1000 * 60 * 60 * 24  // 24 hours

// ─── Fetch new slugs from sitemap (not in static catalog) ─────────────────────
async function fetchNewSlugs(existing: Set<string>): Promise<NaraMovie[]> {
  try {
    const res = await fetch('https://naraboxtv.com/sitemap.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FBOMoviesBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const xml  = await res.text()
    const urls = Array.from(xml.matchAll(/https:\/\/naraboxtv\.com\/movies\/([^<\s]+)/g), m => m[0])
    const newOnes: NaraMovie[] = []
    for (const url of urls) {
      const parsed = parseSlug(url)
      if (parsed && !existing.has(parsed.slug)) {
        newOnes.push(parsed)
      }
    }
    return newOnes
  } catch {
    return []
  }
}

// ─── Main catalog getter ──────────────────────────────────────────────────────
export async function getNaraCatalogServer(): Promise<NaraMovie[]> {
  const now = Date.now()

  // Return cached if fresh
  if (_mergedCatalog && (now - _lastFetch) < CACHE_TTL) {
    return _mergedCatalog
  }

  // Start with verified static catalog (462 movies with confirmed MP4)
  const base     = staticCatalog as NaraMovie[]
  const existing = new Set(base.map(m => m.slug))

  // Check sitemap for new movies added since our last scan
  const newSlugs = await fetchNewSlugs(existing)

  // Merge: verified base + unverified new ones
  // New ones show in list — if they have no MP4, watch page shows "not available"
  _mergedCatalog = [...base, ...newSlugs]
  _lastFetch     = now

  return _mergedCatalog
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
