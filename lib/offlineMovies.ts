/**
 * Offline movie download manager using IndexedDB
 * Stores downloaded movies for offline playback
 */

const DB_NAME = 'FBOMoviesOffline'
const DB_VERSION = 1
const STORE_NAME = 'movies'

export interface OfflineMovie {
  slug: string
  title: string
  vj: string
  blob: Blob
  downloadedAt: number
  size: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'slug' })
        store.createIndex('downloadedAt', 'downloadedAt', { unique: false })
      }
    }
  })

  return dbPromise
}

/**
 * Download a movie and save to IndexedDB
 */
export async function downloadMovie(
  slug: string,
  title: string,
  vj: string,
  videoUrl: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  try {
    // Fetch video with progress tracking
    const response = await fetch(videoUrl)
    if (!response.ok) throw new Error('Download failed')

    const contentLength = response.headers.get('Content-Length')
    const total = contentLength ? parseInt(contentLength, 10) : 0

    if (!response.body) throw new Error('No response body')

    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let receivedLength = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunks.push(value)
      receivedLength += value.length

      if (total && onProgress) {
        onProgress(Math.round((receivedLength / total) * 100))
      }
    }

    // Combine chunks into blob
    const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' })

    // Save to IndexedDB
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const offlineMovie: OfflineMovie = {
      slug,
      title,
      vj,
      blob,
      downloadedAt: Date.now(),
      size: blob.size,
    }

    await new Promise<void>((resolve, reject) => {
      const request = store.put(offlineMovie)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    console.log(`✅ Downloaded: ${title} (${(blob.size / 1024 / 1024).toFixed(2)} MB)`)
  } catch (error) {
    console.error('Download error:', error)
    throw error
  }
}

/**
 * Check if movie is downloaded
 */
export async function isMovieDownloaded(slug: string): Promise<boolean> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise<boolean>((resolve) => {
      const request = store.get(slug)
      request.onsuccess = () => resolve(!!request.result)
      request.onerror = () => resolve(false)
    })
  } catch {
    return false
  }
}

/**
 * Get downloaded movie blob URL
 */
export async function getOfflineMovie(slug: string): Promise<string | null> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise<string | null>((resolve) => {
      const request = store.get(slug)
      request.onsuccess = () => {
        const movie = request.result as OfflineMovie | undefined
        if (movie) {
          const url = URL.createObjectURL(movie.blob)
          resolve(url)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

/**
 * Delete downloaded movie
 */
export async function deleteOfflineMovie(slug: string): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  const store = transaction.objectStore(STORE_NAME)

  await new Promise<void>((resolve, reject) => {
    const request = store.delete(slug)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get all downloaded movies
 */
export async function getAllDownloadedMovies(): Promise<OfflineMovie[]> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise<OfflineMovie[]>((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch {
    return []
  }
}

/**
 * Get total storage used
 */
export async function getTotalStorageUsed(): Promise<number> {
  const movies = await getAllDownloadedMovies()
  return movies.reduce((total, movie) => total + movie.size, 0)
}

/**
 * Clear all downloads
 */
export async function clearAllDownloads(): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  const store = transaction.objectStore(STORE_NAME)

  await new Promise<void>((resolve, reject) => {
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
