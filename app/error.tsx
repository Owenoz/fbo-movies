'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <p className="font-orbitron font-bold text-6xl text-gradient leading-none mb-4">Oops</p>
        <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
        <p className="text-white/40 mb-8">A server error occurred. Please try again.</p>
        <button onClick={reset} className="btn-galaxy">Try Again</button>
      </div>
    </div>
  )
}
