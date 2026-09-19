// ─── FBO Movies API ───────────────────────────────────────────────────────────
// Content source: TMDB (The Movie Database)
// Branded as FBO Movies with VJ Ugandan translations

const TMDB_BASE  = 'https://api.themoviedb.org/3'
const TMDB_IMG   = 'https://image.tmdb.org/t/p'
const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMDUxNTkyM2M2MzgxZDc2NDNkODk0OTk3OTZiZmFmMCIsIm5iZiI6MTY5NDg3MzY4OC4wMzMsInN1YiI6IjY1MDViODU4Mzk0YTg3MDExYzljYWQxZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.QRNylr5k3CEf1L0KBcpHUrht_6I966N0ZqCO5jbRLy8'

// VJ names to label content with (from the actual Kawogo app)
export const VJ_NAMES = ['Ssebulime', 'Spidey', 'Mulindwa', 'Junior', 'Ice']

// Deterministically assign a VJ name based on movie ID
export function getVjName(id: number): string {
  return VJ_NAMES[id % VJ_NAMES.length]
}

// ─── TMDB fetch ───────────────────────────────────────────────────────────────
export async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  try {
    const url = new URL(`${TMDB_BASE}/${endpoint}`)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${TMDB_TOKEN}`, Accept: 'application/json' },
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

// ─── Content APIs ─────────────────────────────────────────────────────────────
export const getTrending       = (type = 'all', window = 'week') => fetchTMDB(`trending/${type}/${window}`)
export const getPopularMovies  = (page = 1)  => fetchTMDB('movie/popular',  { page: String(page) })
export const getTopRatedMovies = (page = 1)  => fetchTMDB('movie/top_rated', { page: String(page) })
export const getPopularTv      = (page = 1)  => fetchTMDB('tv/popular',      { page: String(page) })
export const getNowPlaying     = (page = 1)  => fetchTMDB('movie/now_playing', { page: String(page) })
export const getUpcoming       = (page = 1)  => fetchTMDB('movie/upcoming',   { page: String(page) })
export const searchAll         = (q: string, page = 1) => fetchTMDB('search/multi', { query: q, page: String(page) })
export const getMovieDetail    = (id: number) => fetchTMDB(`movie/${id}`, { append_to_response: 'credits,videos,similar,recommendations' })
export const getTvDetail       = (id: number) => fetchTMDB(`tv/${id}`,    { append_to_response: 'credits,videos,similar,recommendations' })
export const getMovieGenres    = () => fetchTMDB('genre/movie/list')
export const getTvGenres       = () => fetchTMDB('genre/tv/list')
export const discoverMovies    = (params: Record<string,string>) => fetchTMDB('discover/movie', params)
export const discoverTv        = (params: Record<string,string>) => fetchTMDB('discover/tv', params)

// ─── Image helpers ────────────────────────────────────────────────────────────
export function tmdbImage(path: string | null | undefined, size = 'w500'): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${TMDB_IMG}/${size}${path}`
}

// ─── Utilities ────────────────────────────────────────────────────────────────
export function formatRating(n: number) { return (Math.round(n * 10) / 10).toFixed(1) }
export function formatRuntime(m: number) {
  if (!m) return ''
  return m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`
}
export function getYear(d: string) {
  try { return d ? new Date(d).getFullYear().toString() : '' } catch { return '' }
}

// Legacy exports for compatibility
export const getTMDBMovieDetails = getMovieDetail
export const getTMDBTvDetails    = getTvDetail
export const setAuthToken        = (_t: string | null) => {}
export const getStoredToken      = () => null
