'use client'

import { useState, useEffect } from 'react'
import { Film } from 'lucide-react'

interface MoviePosterProps {
  title: string
  vj?: string
  posterUrl?: string | null
  posterPath?: string | null
  id: number
}

export default function MoviePoster({ title, vj, posterUrl, posterPath, id }: MoviePosterProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Priority 1: Use TMDB poster path (already valid)
    if (posterPath) {
      setImgSrc(`https://image.tmdb.org/t/p/w500${posterPath}`)
      setLoading(false)
      return
    }
    
    // Priority 2: Use provided poster URL (NaraBox, Kibanda) - check if valid
    if (posterUrl && posterUrl.startsWith('http')) {
      setImgSrc(posterUrl)
      setLoading(false)
      return
    }
    
    // Priority 3: Fetch from TMDB API (for NaraBox movies without posters)
    const fetchPoster = async () => {
      try {
        // Clean title - remove VJ suffix and extra text
        const cleanTitle = title
          .replace(/\s*-?\s*vj\s+\w+.*$/i, '')  // Remove VJ suffix
          .replace(/\s+part\s+\d+/i, '')        // Remove Part X
          .replace(/\s*\([^)]*\)/g, '')         // Remove parentheses content
          .replace(/\s+-\s+.*$/i, '')           // Remove everything after dash
          .trim()
        
        if (!cleanTitle) return
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 4000)
        
        const res = await fetch(`/api/poster?title=${encodeURIComponent(cleanTitle)}`, {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (res.ok && mounted) {
          const data = await res.json()
          if (data.poster) {
            setImgSrc(data.poster)
          }
        }
      } catch (err) {
        // Silently fail - will show fallback
        if (err instanceof Error && err.name !== 'AbortError') {
          console.log(`Could not fetch poster for: ${title}`)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    fetchPoster()
    
    return () => {
      mounted = false
    }
  }, [posterUrl, posterPath, title])

  const handleImageError = () => {
    setError(true)
    setImgSrc(null)
  }

  // Show loading state
  if (loading && !imgSrc) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center animate-pulse"
        style={{ background: 'linear-gradient(135deg, #1a0530 0%, #2d1b4e 100%)' }}
      >
        <Film className="w-12 h-12 text-purple-400/30" />
      </div>
    )
  }

  // Show image if available and no error
  if (imgSrc && !error) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imgSrc}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        onError={handleImageError}
      />
    )
  }

  // Fallback: Simple poster with movie icon (only after trying to load)
  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center gap-4 px-4 py-6"
      style={{ background: 'linear-gradient(135deg, #1a0530 0%, #2d1b4e 100%)' }}
    >
      <Film className="w-16 h-16 text-purple-400/40" />
      <div className="text-center">
        <p className="text-white font-semibold text-sm line-clamp-3 leading-tight mb-2">
          {title}
        </p>
        {vj && (
          <span className="text-purple-300/80 text-xs font-medium">
            {vj}
          </span>
        )}
      </div>
    </div>
  )
}
