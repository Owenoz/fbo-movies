import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <p className="font-orbitron font-bold text-9xl text-gradient leading-none mb-4">404</p>
        <h1 className="text-2xl font-semibold text-white mb-2">Page Not Found</h1>
        <p className="text-white/40 mb-8">The content you're looking for doesn't exist or was removed.</p>
        <Link href="/" className="btn-galaxy inline-flex items-center gap-2">
          Go Home
        </Link>
      </div>
    </div>
  )
}
