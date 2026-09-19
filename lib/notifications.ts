'use client'

// Push Notifications for new movies
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    })
  }
}

// Check for new movies weekly
export function setupNewMovieCheck() {
  if (typeof window === 'undefined') return

  const LAST_CHECK_KEY = 'fbo_last_movie_check'
  const MOVIE_COUNT_KEY = 'fbo_movie_count'

  const checkForNewMovies = async () => {
    try {
      const res = await fetch('/api/narabox?page=1&limit=1')
      const data = await res.json()
      const currentCount = data.total

      const lastCount = parseInt(localStorage.getItem(MOVIE_COUNT_KEY) || '0')
      
      if (lastCount > 0 && currentCount > lastCount) {
        const newMovies = currentCount - lastCount
        showNotification('🎬 New Movies Added!', {
          body: `${newMovies} new VJ-translated ${newMovies === 1 ? 'movie' : 'movies'} available to watch`,
          tag: 'new-movies',
          requireInteraction: false,
        })
      }

      localStorage.setItem(MOVIE_COUNT_KEY, String(currentCount))
      localStorage.setItem(LAST_CHECK_KEY, String(Date.now()))
    } catch (e) {
      console.error('Failed to check for new movies:', e)
    }
  }

  // Check now if it's been more than 24 hours
  const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0')
  const dayAgo = Date.now() - (24 * 60 * 60 * 1000)
  
  if (lastCheck < dayAgo) {
    checkForNewMovies()
  }

  // Check daily
  setInterval(checkForNewMovies, 24 * 60 * 60 * 1000)
}
