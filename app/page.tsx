import { Suspense } from 'react'
import HomeContent from './HomeContent'

export const revalidate = 300

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContent />
    </Suspense>
  )
}

function HomePageSkeleton() {
  return (
    <>
      <div className="w-full shimmer-bg" style={{ height: '92vh', minHeight: '520px' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-48 rounded shimmer-bg" />
            <div className="flex gap-3">
              {Array.from({length:7}).map((_,j) => (
                <div key={j} className="flex-none w-36">
                  <div className="aspect-[2/3] rounded-xl shimmer-bg" />
                  <div className="mt-2 h-3 w-3/4 rounded shimmer-bg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
