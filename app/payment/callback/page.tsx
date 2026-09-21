'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Simple redirect to home - manual payment doesn't need callback
export default function PaymentCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home after 2 seconds
    setTimeout(() => router.push('/'), 2000)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
        <h2 className="text-white text-xl">Redirecting...</h2>
      </div>
    </div>
  )
}
