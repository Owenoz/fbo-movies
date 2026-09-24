import { NextRequest, NextResponse } from 'next/server'

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '3e0e523aafdab0b119926238e25efc4b'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title')
  
  if (!title) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 })
  }

  try {
    // Search TMDB for the movie
    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&include_adult=false`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    )
    
    if (!searchRes.ok) {
      throw new Error('TMDB search failed')
    }

    const data = await searchRes.json()
    
    if (data.results && data.results.length > 0) {
      const movie = data.results[0]
      const posterPath = movie.poster_path
      
      if (posterPath) {
        return NextResponse.json({ 
          poster: `https://image.tmdb.org/t/p/w342${posterPath}`,
          backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : null
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
