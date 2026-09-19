import { NextRequest, NextResponse } from 'next/server'
import { getNaraCatalogServer, slugToId } from '@/lib/narabox'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page  = parseInt(searchParams.get('page')  || '1')
  const limit = parseInt(searchParams.get('limit') || '24')
  const vj    = searchParams.get('vj')  || ''
  const query = searchParams.get('q')   || ''

  const catalog = await getNaraCatalogServer()

  let filtered = catalog
  if (vj) filtered = filtered.filter(m => m.vj === vj)
  if (query) {
    const q = query.toLowerCase()
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(q) || m.vj.toLowerCase().includes(q)
    )
  }

  const total   = filtered.length
  const results = filtered
    .slice((page - 1) * limit, page * limit)
    .map(m => ({
      ...m,
      id: slugToId(m.slug),
      // poster field from NaraBox portal — use directly as posterUrl in MovieCard
      posterUrl: m.poster ?? null,
    }))

  return NextResponse.json({
    results,
    total,
    page,
    total_pages: Math.ceil(total / limit),
  })
}
