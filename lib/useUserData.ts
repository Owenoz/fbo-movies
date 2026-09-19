'use client'

import { useState, useEffect } from 'react'

// ─── User Data Types ──────────────────────────────────────────────────────────
export interface WatchlistItem {
  slug: string
  title: string
  vj: string
  poster?: string
  addedAt: number
}

export interface WatchHistoryItem {
  slug: string
  title: string
  vj: string
  poster?: string
  watchedAt: number
  progress: number // 0-100
  duration: number // seconds
}

export interface MovieRating {
  slug: string
  rating: number // 1-5
  review?: string
  createdAt: number
}

// ─── LocalStorage Keys ────────────────────────────────────────────────────────
const WATCHLIST_KEY = 'fbo_watchlist'
const HISTORY_KEY = 'fbo_history'
const RATINGS_KEY = 'fbo_ratings'

// ─── Watchlist Hook ───────────────────────────────────────────────────────────
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(WATCHLIST_KEY)
    setWatchlist(stored ? JSON.parse(stored) : [])
    setLoaded(true)
  }, [])

  const addToWatchlist = (item: Omit<WatchlistItem, 'addedAt'>) => {
    const newList = [{ ...item, addedAt: Date.now() }, ...watchlist.filter(i => i.slug !== item.slug)]
    setWatchlist(newList)
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newList))
  }

  const removeFromWatchlist = (slug: string) => {
    const newList = watchlist.filter(i => i.slug !== slug)
    setWatchlist(newList)
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newList))
  }

  const isInWatchlist = (slug: string) => watchlist.some(i => i.slug === slug)

  const toggleWatchlist = (item: Omit<WatchlistItem, 'addedAt'>) => {
    if (isInWatchlist(item.slug)) {
      removeFromWatchlist(item.slug)
    } else {
      addToWatchlist(item)
    }
  }

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, toggleWatchlist, loaded }
}

// ─── Watch History Hook ───────────────────────────────────────────────────────
export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY)
    setHistory(stored ? JSON.parse(stored) : [])
    setLoaded(true)
  }, [])

  const addToHistory = (item: Omit<WatchHistoryItem, 'watchedAt'>) => {
    // Remove existing entry for this slug
    const filtered = history.filter(i => i.slug !== item.slug)
    const newHistory = [{ ...item, watchedAt: Date.now() }, ...filtered].slice(0, 50) // keep last 50
    setHistory(newHistory)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
  }

  const updateProgress = (slug: string, progress: number, duration: number) => {
    const existing = history.find(i => i.slug === slug)
    if (existing) {
      const updated = history.map(i => 
        i.slug === slug ? { ...i, progress, duration, watchedAt: Date.now() } : i
      )
      setHistory(updated)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    }
  }

  const getProgress = (slug: string) => {
    return history.find(i => i.slug === slug)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  // Get continue watching (progress > 5% and < 95%)
  const continueWatching = history.filter(i => i.progress > 5 && i.progress < 95).slice(0, 10)

  return { history, addToHistory, updateProgress, getProgress, clearHistory, continueWatching, loaded }
}

// ─── Ratings Hook ─────────────────────────────────────────────────────────────
export function useRatings() {
  const [ratings, setRatings] = useState<MovieRating[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(RATINGS_KEY)
    setRatings(stored ? JSON.parse(stored) : [])
    setLoaded(true)
  }, [])

  const addRating = (slug: string, rating: number, review?: string) => {
    const filtered = ratings.filter(r => r.slug !== slug)
    const newRating: MovieRating = { slug, rating, review, createdAt: Date.now() }
    const newRatings = [newRating, ...filtered]
    setRatings(newRatings)
    localStorage.setItem(RATINGS_KEY, JSON.stringify(newRatings))
  }

  const getRating = (slug: string) => {
    return ratings.find(r => r.slug === slug)
  }

  const removeRating = (slug: string) => {
    const newRatings = ratings.filter(r => r.slug !== slug)
    setRatings(newRatings)
    localStorage.setItem(RATINGS_KEY, JSON.stringify(newRatings))
  }

  return { ratings, addRating, getRating, removeRating, loaded }
}
