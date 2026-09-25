'use client'

import { useEffect, useRef } from 'react'

export default function SportsPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Block popups and ads
    const blockPopups = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    window.addEventListener('beforeunload', blockPopups)
    
    return () => {
      window.removeEventListener('beforeunload', blockPopups)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Fullscreen Embedded Sports Stream */}
      <iframe
        ref={iframeRef}
        src="http://www.fawanews.sc/"
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-modals"
        title="Live Sports Streaming - FAWANEWS"
        loading="eager"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          display: 'block',
          backgroundColor: '#000'
        }}
      />
    </div>
  )
}
