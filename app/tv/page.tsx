import { Suspense } from 'react'
import { Metadata } from 'next'
import LiveSports from './LiveSports'

export const metadata: Metadata = { 
  title: 'Live Sports',
  description: 'Watch live football and sports matches streaming now'
}

export default function TvPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10">
      <div className="h-10 w-48 rounded shimmer-bg mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}><div className="aspect-video rounded-xl shimmer-bg" /></div>
        ))}
      </div>
    </div>}>
      <LiveSports />
    </Suspense>
  )
}
