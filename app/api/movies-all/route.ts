import { NextRequest, NextResponse } from 'next/server'
import { getNaraCatalogServer, slugToId } from '@/lib/narabox'
import { getLugaFlixMovies, normalizeLugaFlixMovie } from '@/lib/lugaflix'

// Aggregated API: Combines NaraBox + LugaFlix catalogs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const source = searchParams.get('source') || 'all'  // 'all', 'narabox', 'lugaflix'
    const vj = searchParams.get('vj')
    const search = searchParams.get('q')

    let allMovies: any[] = []

    // Fetch from NaraBox verified catalog
    if (source === 'all' || source === 'narabox') {
      const narabox = await getNaraCatalogServer()
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      
      const naraMapped = narabox.map(m => ({
        id: slugToId(m.slug),
        title: m.title,
        slug: m.slug,
        vj: m.vj,
        poster: m.poster,
        mp4: m.mp4,
        overview: m.overview,
        runtime: m.runtime,
        sourceType: 'narabox',
        source: 'NaraBox TV',
        isNew: m.addedAt ? m.addedAt > sevenDaysAgo : false,
        quality: 'Verified MP4',
      }))
      
      allMovies.push(...naraMapped)
    }

    // Fetch from LugaFlix streaming catalog
    if (source === 'all' || source === 'lugaflix') {
      try {
        const lugaflix = await getLugaFlixMovies(page, limit * 2)  // Fetch more for filtering
        const lugaMapped = lugaflix.data.items
          .filter(m => m.is_premium === 'No')  // Only free movies
          .map(normalizeLugaFlixMovie)
          .map(m => ({
            ...m,
            source: 'LugaFlix',
            quality: 'Streaming',
          }))
        
        allMovies.push(...lugaMapped)
      } catch (e) {
        console.error('LugaFlix fetch error:', e)
        // Continue with NaraBox only if LugaFlix fails
      }
    }

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
        narabox: source === 'all' || source === 'narabox',
        lugaflix: source === 'all' || source === 'lugaflix',
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
