import { Suspense } from 'react'
import { Metadata } from 'next'
import TvBrowse from './TvBrowse'

export const metadata: Metadata = { title: 'TV Shows' }

export default function TvPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10">
      <div className="h-10 w-48 rounded shimmer-bg mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i}><div className="aspect-[2/3] rounded-xl shimmer-bg" /></div>
        ))}
      </div>
    </div>}>
      <TvBrowse />
    </Suspense>
  )
}
