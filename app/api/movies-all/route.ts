import { NextRequest, NextResponse } from 'next/server'
import { getNaraCatalogServer, getKibandaCatalogServer, slugToId } from '@/lib/narabox'

// NaraBox ONLY API: Returns verified NaraBox + Kibanda catalog movies
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const vj = searchParams.get('vj')
    const search = searchParams.get('q')

    let allMovies: any[] = []

    // Fetch from NaraBox verified catalog
    const narabox = await getNaraCatalogServer()
    const kibanda = await getKibandaCatalogServer()
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    
    // Combine both catalogs (don't label source separately)
    const combined = [...narabox, ...kibanda]
    
    const naraMapped = combined.map(m => ({
      id: slugToId(m.slug),
      title: m.title,
      slug: m.slug,
      vj: m.vj,
      poster: m.poster,
      mp4: m.mp4,
      overview: m.overview,
      runtime: m.runtime,
      sourceType: 'narabox',
      source: m.source || 'Gen Z Corner', // Unified source name
      isNew: m.addedAt ? m.addedAt > sevenDaysAgo : false,
      quality: 'HD',
      addedAt: m.addedAt || Date.now(),
      year: m.year || null,
      hasPoster: !!m.poster,
    }))
    
    // Sort: 1) Movies with posters first, 2) Newest first
    naraMapped.sort((a, b) => {
      // First priority: Has poster
      if (a.hasPoster && !b.hasPoster) return -1
      if (!a.hasPoster && b.hasPoster) return 1
      
      // Second priority: Newest first (by addedAt date)
      return b.addedAt - a.addedAt
    })
    
    allMovies.push(...naraMapped)

    // Filter by VJ
    if (vj) {
      allMovies = allMovies.filter(m => 
        m.vj?.toLowerCase().includes(vj.toLowerCase())
      )
    }

    // Filter by search query
    if (search) {
      const lowerSearch = search.toLowerCase()
      allMovies = allMovies.filter(m =>
        m.title.toLowerCase().includes(lowerSearch) ||
        m.vj?.toLowerCase().includes(lowerSearch)
      )
    }

    // Paginate
    const total = allMovies.length
    const offset = (page - 1) * limit
    const paginatedMovies = allMovies.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedMovies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      },
      sources: {
        narabox: true,
        kibanda: true,
      },
    })

  } catch (error: any) {
    console.error('Aggregated API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
