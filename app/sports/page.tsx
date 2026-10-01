'use client'

import { useEffect, useState } from 'react'

export default function SportsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Auto-hide loading after 2 seconds
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 bg-black">
      {/* Smooth loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-500">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white/60 text-sm">Loading Sports...</p>
          </div>
        </div>
      )}

      {/* Fullscreen iframe */}
      <iframe
        src="http://www.fawanews.sc/"
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-modals"
        title="Live Sports"
        onLoad={() => setIsLoading(false)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
      />
    </div>
  )
}
