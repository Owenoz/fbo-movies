import { NextRequest, NextResponse } from 'next/server'

const TMDB_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzZTBlNTIzYWFmZGFiMGIxMTk5MjYyMzhlMjVlZmM0YiIsIm5iZiI6MTczMTg1MjAzMS4wOTg4ODk4LCJzdWIiOiI2NzM3NjlkZjY4ZGY0MjEyYjdhMmNlZmMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.H1f-3QTbGPCLhzpCPrLQDXSvPF6hGpTGqHsm8yDqVD0'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title')
  
  if (!title) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 })
  }

  try {
    // Search TMDB for the movie using Bearer token
    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_KEY}`,
          'accept': 'application/json'
        },
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    )
    
    if (!searchRes.ok) {
      console.error('TMDB error:', await searchRes.text())
      throw new Error('TMDB search failed')
    }

    const data = await searchRes.json()
    
    if (data.results && data.results.length > 0) {
      const movie = data.results[0]
      const posterPath = movie.poster_path
      
      if (posterPath) {
        return NextResponse.json({ 
          poster: `https://image.tmdb.org/t/p/w500${posterPath}`,
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
