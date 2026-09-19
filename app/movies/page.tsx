import { Suspense } from 'react'
import { Metadata } from 'next'
import MoviesBrowse from './MoviesBrowse'

export const metadata: Metadata = { title: 'Movies' }

export default function MoviesPage() {
  return (
    <Suspense fallback={<MoviesBrowseSkeleton />}>
      <MoviesBrowse />
    </Suspense>
  )
}

function MoviesBrowseSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="h-10 w-48 rounded shimmer-bg" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[2/3] rounded-xl shimmer-bg" />
            <div className="mt-2 h-3 w-3/4 rounded shimmer-bg" />
          </div>
        ))}
      </div>
    </div>
  )
}
