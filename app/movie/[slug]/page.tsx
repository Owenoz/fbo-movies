import { Suspense } from 'react'
import { Metadata } from 'next'
import MovieDetails from './MovieDetails'
import { getNaraCatalogServer, getKibandaCatalogServer } from '@/lib/narabox'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [naraCatalog, kibandaCatalog] = await Promise.all([
    getNaraCatalogServer(),
    getKibandaCatalogServer()
  ])
  const allMovies = [...naraCatalog, ...kibandaCatalog]
  const movie = allMovies.find(m => m.slug === params.slug)
  
  if (!movie) {
    return { title: 'Movie Not Found' }
  }

  return {
    title: `${movie.title} - ${movie.vj}`,
    description: movie.overview || `Watch ${movie.title} translated by ${movie.vj} on FBO Movies. Stream VJ-translated Ugandan movies online.`,
    openGraph: {
      title: `${movie.title} - ${movie.vj}`,
      description: movie.overview || `Watch ${movie.title} with ${movie.vj} translation`,
      images: movie.poster ? [{ url: movie.poster, width: 1200, height: 630 }] : [],
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${movie.title} - ${movie.vj}`,
      description: movie.overview || `Watch ${movie.title} on FBO Movies`,
      images: movie.poster ? [movie.poster] : [],
    },
  }
}

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
