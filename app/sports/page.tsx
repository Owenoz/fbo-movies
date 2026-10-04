'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function SportsPage() {
  useEffect(() => {
    // Redirect to fawanews.sc immediately
    window.location.href = 'http://www.fawanews.sc/'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">Redirecting to Live Sports...</h2>
        <p className="text-white/60">Taking you to FAWANEWS Sports</p>
      </div>
    </div>
  )
}
