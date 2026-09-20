// Internet Archive API Integration with Authentication
// Using S3-like API keys for enhanced access

// API Keys (from user's Internet Archive account)
const IA_ACCESS_KEY = 'vO79UA3Jqy2uPELT'
const IA_SECRET_KEY = 'ha9Y2soCpr8WndjX'

export interface ArchiveMovie {
  id: string
  title: string
  identifier: string
  description?: string
  mediatype: string
  year?: string
  creator?: string
  runtime?: string
  downloads?: number
  format?: string[]
  thumbnail?: string
  video_url?: string
  stream_url?: string
}

// Search Internet Archive for movies with authentication
export async function searchArchiveMovies(query: string = '', page: number = 1): Promise<ArchiveMovie[]> {
  try {
    const rows = 100 // Items per page
    const start = (page - 1) * rows
    
    // Build search query for movies
    let searchQuery = 'mediatype:movies AND format:mpeg4'
    if (query) {
      searchQuery = `(${query}) AND mediatype:movies AND format:mpeg4`
    }
    
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(searchQuery)}&fl[]=identifier,title,description,year,creator,runtime,downloads,format&sort[]=downloads+desc&rows=${rows}&page=${page}&output=json`
    
    const response = await fetch(url, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
      headers: {
        'Authorization': `LOW ${IA_ACCESS_KEY}:${IA_SECRET_KEY}`,
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Internet Archive')
    }
    
    const data = await response.json()
    
    if (!data.response?.docs) return []
    
    return data.response.docs.map((doc: any) => ({
      id: doc.identifier,
      title: doc.title || 'Untitled',
      identifier: doc.identifier,
      description: doc.description,
      mediatype: doc.mediatype,
      year: doc.year,
      creator: doc.creator,
      runtime: doc.runtime,
      downloads: doc.downloads,
      format: doc.format,
      thumbnail: `https://archive.org/services/img/${doc.identifier}`,
      stream_url: `https://archive.org/embed/${doc.identifier}`,
      video_url: `https://archive.org/download/${doc.identifier}/${doc.identifier}.mp4`
    }))
  } catch (error) {
    console.error('Internet Archive API error:', error)
    return []
  }
}

// Get popular/featured movies from Internet Archive
export async function getFeaturedArchiveMovies(): Promise<ArchiveMovie[]> {
  try {
    // Query for popular movies with MP4 format
    const searchQuery = '(collection:moviesandfilms OR collection:feature_films OR collection:classic_films) AND mediatype:movies AND format:mpeg4'
    
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(searchQuery)}&fl[]=identifier,title,description,year,creator,runtime,downloads,format&sort[]=downloads+desc&rows=200&output=json`
    
    const response = await fetch(url, {
      next: { revalidate: 1800 },
      headers: {
        'Authorization': `LOW ${IA_ACCESS_KEY}:${IA_SECRET_KEY}`,
      }
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    
    if (!data.response?.docs) return []
    
    return data.response.docs.map((doc: any) => ({
      id: doc.identifier,
      title: doc.title || 'Untitled',
      identifier: doc.identifier,
      description: doc.description,
      mediatype: doc.mediatype,
      year: doc.year,
      creator: doc.creator,
      runtime: doc.runtime,
      downloads: doc.downloads,
      format: doc.format,
      thumbnail: `https://archive.org/services/img/${doc.identifier}`,
      stream_url: `https://archive.org/embed/${doc.identifier}`,
      video_url: `https://archive.org/download/${doc.identifier}/${doc.identifier}.mp4`
    }))
  } catch (error) {
    console.error('Featured movies error:', error)
    return []
  }
}

// Get movies by category/collection
export async function getArchiveMoviesByCollection(collection: string, limit: number = 100): Promise<ArchiveMovie[]> {
  try {
    const searchQuery = `collection:${collection} AND mediatype:movies AND format:mpeg4`
    
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(searchQuery)}&fl[]=identifier,title,description,year,creator,runtime,downloads,format&sort[]=downloads+desc&rows=${limit}&output=json`
    
    const response = await fetch(url, {
      next: { revalidate: 1800 },
      headers: {
        'Authorization': `LOW ${IA_ACCESS_KEY}:${IA_SECRET_KEY}`,
      }
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    
    if (!data.response?.docs) return []
    
    return data.response.docs.map((doc: any) => ({
      id: doc.identifier,
      title: doc.title || 'Untitled',
      identifier: doc.identifier,
      description: doc.description,
      mediatype: doc.mediatype,
      year: doc.year,
      creator: doc.creator,
      runtime: doc.runtime,
      downloads: doc.downloads,
      format: doc.format,
      thumbnail: `https://archive.org/services/img/${doc.identifier}`,
      stream_url: `https://archive.org/embed/${doc.identifier}`,
      video_url: `https://archive.org/download/${doc.identifier}/${doc.identifier}.mp4`
    }))
  } catch (error) {
    console.error('Collection movies error:', error)
    return []
  }
}

// Get movie details by identifier with authentication
export async function getArchiveMovieDetails(identifier: string): Promise<ArchiveMovie | null> {
  try {
    const url = `https://archive.org/metadata/${identifier}`
    
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        'Authorization': `LOW ${IA_ACCESS_KEY}:${IA_SECRET_KEY}`,
      }
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    const metadata = data.metadata || {}
    const files = data.files || []
    
    // Find best quality MP4 file
    const mp4Files = files.filter((f: any) => 
      f.format === 'h.264' || 
      f.format === 'MPEG4' ||
      f.name?.endsWith('.mp4')
    )
    
    // Prefer higher quality files
    const mp4File = mp4Files.find((f: any) => 
      f.name?.includes('512kb') || 
      f.name?.includes('_512kb') ||
      f.format === 'h.264'
    ) || mp4Files[0]
    
    return {
      id: identifier,
      title: metadata.title || 'Untitled',
      identifier: identifier,
      description: metadata.description,
      mediatype: metadata.mediatype,
      year: metadata.year,
      creator: metadata.creator,
      runtime: metadata.runtime,
      downloads: metadata.downloads,
      format: files.map((f: any) => f.format),
      thumbnail: `https://archive.org/services/img/${identifier}`,
      stream_url: `https://archive.org/embed/${identifier}`,
      video_url: mp4File ? `https://archive.org${mp4File.name}` : `https://archive.org/download/${identifier}/${identifier}.mp4`
    }
  } catch (error) {
    console.error('Movie details error:', error)
    return null
  }
}

// Popular collections to explore
export const POPULAR_COLLECTIONS = [
  { id: 'feature_films', name: 'Feature Films', description: 'Full-length movies' },
  { id: 'classic_films', name: 'Classic Films', description: 'Timeless cinema' },
  { id: 'silent_films', name: 'Silent Films', description: 'Early cinema masterpieces' },
  { id: 'horror_films', name: 'Horror Films', description: 'Classic horror movies' },
  { id: 'sci-fi_films', name: 'Sci-Fi Films', description: 'Science fiction classics' },
  { id: 'westerns', name: 'Westerns', description: 'Classic western movies' },
  { id: 'action_films', name: 'Action Films', description: 'Action-packed classics' },
  { id: 'drama_films', name: 'Drama Films', description: 'Dramatic masterpieces' },
]
