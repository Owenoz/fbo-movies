import { NextRequest, NextResponse } from 'next/server'

// Multiple TMDB API keys for redundancy
const TMDB_KEYS = [
  '577187c381c6bd81a2e6656d79af8947',
  'e9e9d8da18ae29fc430845952232787c',
  '1e0c70557163a11c8478542e9f97e013',
  '79a50f7ee9da05cf6131e55c07d6ee89'
]

let tmdbKeyIndex = 0

// Get next TMDB key (rotate through keys)
function getNextTMDBKey() {
  const key = TMDB_KEYS[tmdbKeyIndex % TMDB_KEYS.length]
  tmdbKeyIndex++
  return key
}

// Try TMDB with key rotation
async function fetchFromTMDB(title: string) {
  const apiKey = getNextTMDBKey()
  
  try {
    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(title)}&include_adult=false`,
      {
        headers: { 'accept': 'application/json' },
        next: { revalidate: 86400 }
      }
    )
    
    if (!searchRes.ok) return null

    const data = await searchRes.json()
    
    if (data.results && data.results[0]) {
      const result = data.results[0]
      if (result.poster_path) {
        return {
          poster: `https://image.tmdb.org/t/p/w500${result.poster_path}`,
          backdrop: result.backdrop_path ? `https://image.tmdb.org/t/p/w1280${result.backdrop_path}` : null
        }
      }
    }
  } catch (error) {
    console.error('TMDB fetch error:', error)
  }
  return null
}

// Try TVMaze
async function fetchFromTVMaze(title: string) {
  try {
    const res = await fetch(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`,
      { next: { revalidate: 86400 } }
    )
    
    const data = await res.json()
    
    if (data && data[0] && data[0].show && data[0].show.image) {
      return {
        poster: data[0].show.image.original || data[0].show.image.medium,
        backdrop: data[0].show.image.original || null
      }
    }
  } catch (error) {
    console.error('TVMaze fetch error:', error)
  }
  return null
}

// Try Wikipedia
async function fetchFromWikipedia(title: string) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=500`,
      { next: { revalidate: 86400 } }
    )
    
    const data = await res.json()
    
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages) as any[]
      if (pages[0] && pages[0].thumbnail) {
        return {
          poster: pages[0].thumbnail.source,
          backdrop: pages[0].thumbnail.source
        }
      }
    }
  } catch (error) {
    console.error('Wikipedia fetch error:', error)
  }
  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title')
  
  if (!title) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 })
  }

  // Clean title (remove VJ names)
  const cleanTitle = title.replace(/\s*-?\s*VJ\s+\w+.*$/i, '').trim()

  try {
    // Try multiple sources in order
    let result = await fetchFromTMDB(cleanTitle)
    
    if (!result) {
      result = await fetchFromTVMaze(cleanTitle)
    }
    
    if (!result) {
      result = await fetchFromWikipedia(cleanTitle)
    }
    
    if (result) {
      return NextResponse.json(result)
    }
    
    // No poster found from any source
    return NextResponse.json({ poster: null, backdrop: null })
    
  } catch (error) {
    console.error('Poster fetch error:', error)
    return NextResponse.json({ poster: null, backdrop: null })
  }
}
