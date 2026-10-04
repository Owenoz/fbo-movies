import { NextRequest, NextResponse } from 'next/server'

// TMDB API v3 - Using API Key from screenshot
const TMDB_API_KEY = '577187c381c6bd81a2e6656d79af8947'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title')
  
  if (!title) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 })
  }

  try {
    // Search TMDB for the movie using API key
    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1`,
      {
        headers: {
          'accept': 'application/json'
        },
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    )
    
    if (!searchRes.ok) {
      const errorText = await searchRes.text()
      console.error('TMDB error:', errorText)
      return NextResponse.json({ poster: null, backdrop: null })
    }

    const data = await searchRes.json()
    
    if (data.results && data.results.length > 0) {
      const movie = data.results[0]
      const posterPath = movie.poster_path
      
      if (posterPath) {
        return NextResponse.json({ 
          poster: `https://image.tmdb.org/t/p/w500${posterPath}`,
          backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null
        })
      }
    }
    
    // No poster found
    return NextResponse.json({ poster: null, backdrop: null })
    
  } catch (error) {
    console.error('Poster fetch error:', error)
    return NextResponse.json({ poster: null, backdrop: null })
  }
}
