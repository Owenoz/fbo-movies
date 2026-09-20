import { Suspense } from 'react'
import ExploreClient from './ExploreClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore 53k+ VJ Movies',
  description: 'Browse 53,000+ Luganda-translated movies from LugaFlix and NaraBox. Stream VJ Junior, VJ Emmy, VJ Ice P and more.',
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExploreClient />
    </Suspense>
  )
}

function ExploreSkeleton() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-12 w-64 rounded shimmer-bg mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[2/3] rounded-xl shimmer-bg" />
              <div className="h-4 w-3/4 rounded shimmer-bg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
