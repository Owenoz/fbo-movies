// ─── LugaFlix API Integration ─────────────────────────────────────────────────
// API: movies.mruodel.com - 53,000+ VJ-translated movies

export interface LugaFlixMovie {
  id: number
  title: string
  url: string  // Streaming URL
  thumbnail_url: string
  description: string | null
  year: string | null
  rating: string | null
  genre: string | null
  type: 'Movie' | 'Series'
  category: string
  actor: string
  vj: string  // e.g. "Vj Junior", "Vj Emmy"
  is_premium: 'Yes' | 'No'
  views_count: number
  likes_count: number
}

interface LugaFlixResponse {
  code: number
  status: number
  message: string
  data: {
    items: LugaFlixMovie[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      last_page: number
    }
  }
}

const LUGAFLIX_API = 'https://movies.mruodel.com/api/movies'

export async function getLugaFlixMovies(page = 1, perPage = 50): Promise<LugaFlixResponse> {
  const url = `${LUGAFLIX_API}?page=${page}&per_page=${perPage}`
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!res.ok) {
    throw new Error(`LugaFlix API error: ${res.status}`)
  }

  return res.json()
}

export async function searchLugaFlix(query: string, page = 1): Promise<LugaFlixMovie[]> {
  // LugaFlix doesn't have search API, so we'll fetch and filter client-side
  // For production, you'd want to implement server-side search
  const data = await getLugaFlixMovies(page, 100)
  const lowerQuery = query.toLowerCase()
  
  return data.data.items.filter(movie => 
    movie.title.toLowerCase().includes(lowerQuery) ||
    movie.vj.toLowerCase().includes(lowerQuery)
  )
}

// Convert LugaFlix movie to our common format
export function normalizeLugaFlixMovie(movie: LugaFlixMovie) {
  return {
    id: movie.id,
    title: movie.title,
    slug: `lugaflix-${movie.id}`,
    vj: movie.vj,
    poster: movie.thumbnail_url,
    mp4: movie.url,  // Streaming URL
    overview: movie.description,
    year: movie.year,
    runtime: null,  // Not provided by API
    sourceType: 'lugaflix' as const,
    isPremium: movie.is_premium === 'Yes',
    views: movie.views_count,
    likes: movie.likes_count,
  }
}
