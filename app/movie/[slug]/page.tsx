import { Suspense } from 'react'
import MovieDetails from './MovieDetails'

export default function MoviePage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <MovieDetails slug={params.slug} />
    </Suspense>
  )
}

function DetailsSkeleton() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] rounded-xl shimmer-bg" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-10 w-3/4 rounded shimmer-bg" />
            <div className="h-6 w-1/2 rounded shimmer-bg" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded shimmer-bg" />
              <div className="h-4 w-full rounded shimmer-bg" />
              <div className="h-4 w-3/4 rounded shimmer-bg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
