'use client'

import { useState, useEffect } from 'react'
import { Play } from 'lucide-react'

interface MoviePosterProps {
  title: string
  vj?: string
  posterUrl?: string | null
  posterPath?: string | null
  id: number
}

// Generate gradient based on ID
function getGradient(id: number): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ]
  return gradients[Math.abs(id) % gradients.length]
}

export default function MoviePoster({ title, vj, posterUrl, posterPath, id }: MoviePosterProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // If we have a poster URL or path, use it directly
    if (posterUrl) {
      setImgSrc(posterUrl)
      setLoading(false)
      return
    }
    
    if (posterPath) {
      setImgSrc(`https://image.tmdb.org/t/p/w342${posterPath}`)
      setLoading(false)
      return
    }
    
    // Fetch from TMDB using title search
    const fetchPoster = async () => {
      try {
        // Clean title - remove VJ suffix
        const cleanTitle = title
          .replace(/\s*-?\s*VJ\s+\w+.*$/i, '')
          .replace(/\s+Part\s+\d+$/i, '')
          .trim()
        
        const res = await fetch(`/api/poster?title=${encodeURIComponent(cleanTitle)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.poster) {
            setImgSrc(data.poster)
          }
        }
      } catch (err) {
        console.error('Poster fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPoster()
  }, [posterUrl, posterPath, title])

  const handleImageError = () => {
    setError(true)
    setImgSrc(null)
  }

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

  // Fallback: Beautiful gradient with title
  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center gap-3 px-3 py-4"
      style={{ background: getGradient(id) }}
    >
      <Play className="w-12 h-12 text-white/40" />
      <span className="text-white font-bold text-sm text-center line-clamp-4 leading-tight drop-shadow-lg">
        {title}
      </span>
      {vj && (
        <span className="text-white/80 text-xs font-medium drop-shadow">
          {vj}
        </span>
      )}
    </div>
  )
}
