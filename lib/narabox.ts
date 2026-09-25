// ─── NaraBox & Kibanda VJ Catalogs ───────────────────────────────────────────
// Uses ONLY the verified static catalogs with confirmed MP4s
// New movies get added daily via GitHub Actions auto-scan

import naraCatalog from '../public/narabox_catalog.json'
import kibandaCatalog from '../public/kibanda_catalog.json'

export interface NaraMovie {
  title: string
  vj: string
  slug: string
  url: string
  mp4?: string | null
  poster?: string | null
  overview?: string | null
  runtime?: number  // in minutes
  addedAt?: number  // timestamp when added to catalog
}

// Return NaraBox verified catalog
export async function getNaraCatalogServer(): Promise<NaraMovie[]> {
  return naraCatalog as NaraMovie[]
}

// Return Kibanda verified catalog
export async function getKibandaCatalogServer(): Promise<NaraMovie[]> {
  return kibandaCatalog as NaraMovie[]
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
