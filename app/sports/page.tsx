'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

export default function SportsPage() {
  const [showWarning, setShowWarning] = useState(true)

  const openSports = () => {
    // Open in new tab/window
    window.open('http://www.fawanews.sc/', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
          
          <div className="relative p-8 md:p-12 text-center">
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/50">
              <span className="text-5xl">🔥</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              FAWANEWS Sports
            </h1>
            
            <p className="text-gray-300 text-lg mb-8">
              Watch live football, cricket, basketball and more in HD quality
            </p>

            {/* Warning if shown */}
            {showWarning && (
              <div className="mb-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-yellow-200 text-sm mb-3">
                  ⚠️ Sports streaming will open in a new window for the best experience
                </p>
                <button
                  onClick={() => setShowWarning(false)}
                  className="text-yellow-400 text-xs underline hover:text-yellow-300"
                >
                  Don't show again
                </button>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={openSports}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-orange-500/50"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)' }}
            >
              Watch Live Sports
              <ExternalLink className="w-6 h-6" />
            </button>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">⚽</span>
                <span>Football</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🏀</span>
                <span>Basketball</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🏏</span>
                <span>Cricket</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-center text-gray-500 text-xs mt-6">
          🔴 HD Quality • 📱 Mobile Friendly • 🌍 Global Coverage
        </p>
      </div>
    </div>
  )
}
