// TVMaze API Integration - Free TV Show Database
// No API key required, completely free to use

export interface TVShow {
  id: number
  name: string
  type: string
  language: string
  genres: string[]
  status: string
  runtime: number | null
  premiered: string
  ended: string | null
  rating: {
    average: number | null
  }
  image: {
    medium: string
    original: string
  } | null
  summary: string | null
  network: {
    name: string
    country: {
      name: string
      code: string
    }
  } | null
  webChannel: {
    name: string
  } | null
  imdb?: string
}

const BASE_URL = 'https://api.tvmaze.com'

// Rate limiting helper - TVMaze allows 20 calls per 10 seconds
let lastCallTime = 0
const MIN_INTERVAL = 100 // 100ms between calls to be safe

async function rateLimit() {
  const now = Date.now()
  const timeSinceLastCall = now - lastCallTime
  if (timeSinceLastCall < MIN_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - timeSinceLastCall))
  }
  lastCallTime = Date.now()
}

// Get popular TV shows (based on schedule)
export async function getPopularShows(): Promise<TVShow[]> {
  try {
    await rateLimit()
    
    // Get current schedule across multiple countries
    const countries = ['US', 'GB', 'CA']
    const allShows: TVShow[] = []
    const seenIds = new Set<number>()
    
    for (const country of countries) {
      try {
        const response = await fetch(`${BASE_URL}/schedule?country=${country}&date=${getCurrentDate()}`, {
          next: { revalidate: 3600 } // Cache for 1 hour
        })
        
        if (response.ok) {
          const schedule = await response.json()
          schedule.forEach((entry: any) => {
            if (entry.show && !seenIds.has(entry.show.id)) {
              seenIds.add(entry.show.id)
              allShows.push(entry.show)
            }
          })
        }
        
        await rateLimit()
      } catch (err) {
        console.error(`Failed to fetch schedule for ${country}:`, err)
      }
    }
    
    return allShows.slice(0, 100)
  } catch (error) {
    console.error('Error fetching popular shows:', error)
    return []
  }
}

// Search TV shows
export async function searchTVShows(query: string): Promise<TVShow[]> {
  try {
    await rateLimit()
    
    const response = await fetch(`${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) return []
    
    const results = await response.json()
    return results.map((r: any) => r.show).filter((show: any) => show.image)
  } catch (error) {
    console.error('Error searching shows:', error)
    return []
  }
}

// Get show by ID with full details
export async function getShowById(id: number): Promise<TVShow | null> {
  try {
    await rateLimit()
    
    const response = await fetch(`${BASE_URL}/shows/${id}`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) return null
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching show:', error)
    return null
  }
}

// Get shows by genre
export async function getShowsByGenre(genre: string, page: number = 0): Promise<TVShow[]> {
  try {
    await rateLimit()
    
    // TVMaze doesn't have a direct genre endpoint, so we search and filter
    const response = await fetch(`${BASE_URL}/shows?page=${page}`, {
      next: { revalidate: 7200 } // Cache for 2 hours
    })
    
    if (!response.ok) return []
    
    const shows = await response.json()
    return shows
      .filter((show: TVShow) => 
        show.genres.some(g => g.toLowerCase() === genre.toLowerCase()) &&
        show.image !== null
      )
      .slice(0, 50)
  } catch (error) {
    console.error('Error fetching shows by genre:', error)
    return []
  }
}

// Get all shows (paginated)
export async function getAllShows(page: number = 0): Promise<TVShow[]> {
  try {
    await rateLimit()
    
    const response = await fetch(`${BASE_URL}/shows?page=${page}`, {
      next: { revalidate: 7200 }
    })
    
    if (!response.ok) return []
    
    const shows = await response.json()
    return shows.filter((show: TVShow) => show.image !== null)
  } catch (error) {
    console.error('Error fetching all shows:', error)
    return []
  }
}

// Get show episodes
export async function getShowEpisodes(showId: number): Promise<any[]> {
  try {
    await rateLimit()
    
    const response = await fetch(`${BASE_URL}/shows/${showId}/episodes`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) return []
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching episodes:', error)
    return []
  }
}

// Helper to get current date in YYYY-MM-DD format
function getCurrentDate(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

// Popular genres for filtering
export const POPULAR_GENRES = [
  'Drama',
  'Comedy',
  'Action',
  'Thriller',
  'Science-Fiction',
  'Crime',
  'Horror',
  'Romance',
  'Fantasy',
  'Mystery',
  'Adventure',
  'Family',
  'Animation'
]
