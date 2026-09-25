'use client'

import { useEffect } from 'react'

export default function SportsPage() {
  useEffect(() => {
    // Redirect to fawanews (http version with www)
    window.location.href = 'http://www.fawanews.sc/'
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center animate-pulse">
            <span className="text-5xl">🔥</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Redirecting to FAWANEWS</h1>
          <p className="text-gray-400 mb-6">Taking you to live sports streaming...</p>
          
          {/* Manual link if auto-redirect fails */}
          <a 
            href="http://www.fawanews.sc/" 
            className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105"
          >
            Click here if not redirected
          </a>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>⚽ Watch live football, cricket, basketball and more</p>
          <p className="mt-1">🔴 HD Quality streams • 📱 Mobile friendly</p>
        </div>
      </div>
    </div>
  )
}
