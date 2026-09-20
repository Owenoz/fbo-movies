'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CreditCard, Check, Loader2, Shield, Crown, Zap } from 'lucide-react'
import { createSubscription, getSubscriptionPrice, isEmailWhitelisted } from '@/lib/subscription'
import Link from 'next/link'

export default function SubscribePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [network, setNetwork] = useState<'MTN' | 'AIRTEL'>('MTN')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')

  const price = getSubscriptionPrice()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check if email is whitelisted (admin)
      if (isEmailWhitelisted(email)) {
        // Auto-approve for whitelisted emails
        createSubscription(email, 'ADMIN_FREE_ACCESS')
        setStep('success')
        setTimeout(() => router.push('/'), 2000)
        return
      }

      // Regular payment flow
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone_number: phone,
          network,
          amount: price
        })
      })

      const data = await response.json()

      if (data.success && data.link) {
        // Redirect to Flutterwave payment page
        setStep('processing')
        window.location.href = data.link
      } else {
        setError(data.error || 'Payment initiation failed')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="font-orbitron font-bold text-3xl text-white mb-3">Welcome to FBO Movies!</h1>
          <p className="text-white/70 mb-6">Your subscription is now active</p>
          <Link href="/" className="btn-galaxy inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold">
            Start Watching
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30 mb-4">
            <Crown className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-bold text-sm">PREMIUM ACCESS</span>
          </div>
          <h1 className="font-orbitron font-bold text-4xl md:text-5xl text-white mb-4">
            Subscribe to FBO Movies
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Get unlimited access to thousands of VJ-translated Ugandan movies
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/15">
              <h2 className="font-bold text-2xl text-white mb-6 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-purple-400" />
                Payment Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="256XXXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all"
                  />
                  <p className="text-white/50 text-xs mt-2">Include country code (256 for Uganda)</p>
                </div>

                {/* Network Selection */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Mobile Money Network
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNetwork('MTN')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        network === 'MTN'
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                          : 'bg-white/5 border-white/20 text-white/60 hover:border-white/40'
                      }`}
                    >
                      <div className="font-bold text-lg">MTN</div>
                      <div className="text-xs mt-1">Mobile Money</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNetwork('AIRTEL')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        network === 'AIRTEL'
                          ? 'bg-red-500/20 border-red-500 text-red-300'
                          : 'bg-white/5 border-white/20 text-white/60 hover:border-white/40'
                      }`}
                    >
                      <div className="font-bold text-lg">Airtel</div>
                      <div className="text-xs mt-1">Money</div>
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 py-4 rounded-xl font-bold text-white shadow-lg shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay UGX {price.toLocaleString()}
                      <Zap className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-white/50 text-xs text-center">
                  Secure payment powered by Flutterwave
                </p>
              </form>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="glass-card p-6 rounded-2xl border border-white/15">
              <h3 className="font-bold text-lg text-white mb-4">What You Get</h3>
              <ul className="space-y-3">
                {[
                  'Unlimited movie streaming',
                  '462+ VJ translated movies',
                  '53,000+ explore movies',
                  '200+ Internet Archive classics',
                  'HD quality playback',
                  'Watch on any device',
                  '30 days access',
                  'Cancel anytime'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-green-500/30 bg-green-500/10">
              <Shield className="w-10 h-10 text-green-400 mb-3" />
              <h3 className="font-bold text-lg text-white mb-2">Secure Payment</h3>
              <p className="text-white/70 text-sm">
                Your payment is processed securely through Flutterwave, trusted by millions across Africa.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
