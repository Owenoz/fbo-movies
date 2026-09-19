import { Metadata } from 'next'
import { Suspense } from 'react'
import SearchClient from './SearchClient'

export const metadata: Metadata = { title: 'Search' }

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-10 w-40 rounded shimmer-bg mb-8" />
        <div className="h-14 w-full rounded-2xl shimmer-bg mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}><div className="aspect-[2/3] rounded-xl shimmer-bg" /></div>
          ))}
        </div>
      </div>
    }>
      <SearchClient />
    </Suspense>
  )
}
