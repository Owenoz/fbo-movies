'use client'

import { useState, useEffect } from 'react'

// Simple analytics using localStorage
// Tracks: views per movie, popular movies, total views

interface MovieView {
  slug: string
  title: string
  vj: string
  viewedAt: number
}

interface MovieStats {
  slug: string
  title: string
  vj: string
  views: number
  lastViewed: number
}

const VIEWS_KEY = 'fbo_views'
const STATS_KEY = 'fbo_stats'

export function useAnalytics() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const trackView = (slug: string, title: string, vj: string) => {
    if (!loaded) return

    // Add to views log
    try {
      const views: MovieView[] = JSON.parse(localStorage.getItem(VIEWS_KEY) || '[]')
      views.unshift({ slug, title, vj, viewedAt: Date.now() })
      localStorage.setItem(VIEWS_KEY, JSON.stringify(views.slice(0, 100))) // keep last 100

      // Update stats
      const stats: MovieStats[] = JSON.parse(localStorage.getItem(STATS_KEY) || '[]')
      const existing = stats.find(s => s.slug === slug)
      
      if (existing) {
        existing.views++
        existing.lastViewed = Date.now()
      } else {
        stats.push({ slug, title, vj, views: 1, lastViewed: Date.now() })
      }

      // Sort by views desc
      stats.sort((a, b) => b.views - a.views)
      localStorage.setItem(STATS_KEY, JSON.stringify(stats.slice(0, 50))) // keep top 50
    } catch (e) {
      console.error('Failed to track view:', e)
    }
  }

  const getPopularMovies = (): MovieStats[] => {
    if (!loaded) return []
    try {
      return JSON.parse(localStorage.getItem(STATS_KEY) || '[]')
    } catch {
      return []
    }
  }

  const getTotalViews = (): number => {
    if (!loaded) return 0
    try {
      const views: MovieView[] = JSON.parse(localStorage.getItem(VIEWS_KEY) || '[]')
      return views.length
    } catch {
      return 0
    }
  }

  return { trackView, getPopularMovies, getTotalViews, loaded }
}
