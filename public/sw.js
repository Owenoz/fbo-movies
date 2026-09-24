// Service Worker for FBO Movies PWA
const CACHE_NAME = 'fbo-movies-v1'
const urlsToCache = [
  '/',
  '/movies',
  '/tv',
  '/sports',
  '/search',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[PWA] Caching app shell')
        return cache.addAll(urlsToCache)
      })
      .catch((err) => {
        console.log('[PWA] Cache failed:', err)
      })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[PWA] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response
        }

        // Clone the request
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache API calls and images
          if (event.request.url.includes('/api/') || 
              event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }

          return response
        }).catch(() => {
          // Return offline page or cached response
          return caches.match('/')
        })
      })
  )
})
