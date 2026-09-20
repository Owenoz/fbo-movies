'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import { createSubscription } from '@/lib/subscription'
import Link from 'next/link'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [message, setMessage] = useState('Verifying your payment...')

  useEffect(() => {
    const verifyPayment = async () => {
      const transaction_id = searchParams.get('transaction_id')
      const tx_ref = searchParams.get('tx_ref')
      const status_param = searchParams.get('status')

      // Check if payment was successful based on Flutterwave redirect params
      if (status_param === 'successful' && transaction_id) {
        try {
          // Verify payment with backend
          const response = await fetch(`/api/subscribe?transaction_id=${transaction_id}&tx_ref=${tx_ref}`)
          const data = await response.json()

          if (data.success && data.verified) {
            // Extract email from customer data or use a stored value
            const email = data.data.customer?.email || localStorage.getItem('subscription_email') || 'user@example.com'
            
            // Create subscription
            createSubscription(email, transaction_id)
            
            setStatus('success')
            setMessage('Payment successful! Your subscription is now active.')
            
            // Redirect to home after 3 seconds
            setTimeout(() => router.push('/'), 3000)
          } else {
            setStatus('failed')
            setMessage('Payment verification failed. Please contact support.')
          }
        } catch (error) {
          setStatus('failed')
          setMessage('Failed to verify payment. Please try again.')
        }
      } else {
        setStatus('failed')
        setMessage('Payment was not completed. Please try again.')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-8 rounded-2xl border border-white/15 max-w-md w-full text-center"
      >
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
            <h2 className="font-bold text-2xl text-white mb-2">Verifying Payment</h2>
            <p className="text-white/70">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="font-bold text-2xl text-white mb-2">Payment Successful!</h2>
            <p className="text-white/70 mb-6">{message}</p>
            <Link href="/" className="btn-galaxy inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold">
              Start Watching
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <X className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="font-bold text-2xl text-white mb-2">Payment Failed</h2>
            <p className="text-white/70 mb-6">{message}</p>
            <div className="flex gap-3">
              <Link href="/subscribe" className="flex-1 btn-galaxy px-6 py-3 rounded-xl font-bold text-center">
                Try Again
              </Link>
              <Link href="/" className="flex-1 btn-glass px-6 py-3 rounded-xl font-bold text-center">
                Go Home
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
