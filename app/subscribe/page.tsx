'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Loader2, Copy, CheckCircle2, ArrowRight, AlertCircle, Crown } from 'lucide-react'
import { createSubscription, getSubscriptionPrice, isEmailWhitelisted } from '@/lib/subscription'
import Link from 'next/link'

export default function SubscribePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [network, setNetwork] = useState<'MTN' | 'AIRTEL'>('MTN')
  const [transactionRef, setTransactionRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [copied, setCopied] = useState(false)

  const price = getSubscriptionPrice()
  const MOMO_NUMBER = '0793854272'

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      localStorage.setItem('subscription_email', email)

      // Check if whitelisted
      if (isEmailWhitelisted(email)) {
        createSubscription(email, 'ADMIN_FREE_ACCESS')
        setLoading(false)
        setStep('success')
        setTimeout(() => router.push('/'), 2000)
        return
      }

      // Submit payment
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone_number: phone,
          network,
          transaction_reference: transactionRef,
          amount: price
        })
      })

      const data = await response.json()

      if (data.success) {
        // Save to localStorage
        const pending = JSON.parse(localStorage.getItem('fbo_pending_payments') || '[]')
        pending.push(data.paymentData)
        localStorage.setItem('fbo_pending_payments', JSON.stringify(pending))
        
        setLoading(false)
        setStep('success')
      } else {
        setError(data.error || 'Submission failed')
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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 rounded-3xl border border-white/20 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="font-bold text-2xl text-white mb-3">Payment Submitted!</h1>
          <p className="text-white/70 mb-4">
            We'll activate your subscription within 30 minutes after verifying your payment.
          </p>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
            <p className="text-purple-300 text-sm">
              Transaction: <span className="font-mono font-bold">{transactionRef}</span>
            </p>
          </div>
          <Link href="/" className="btn-galaxy inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold w-full">
            Back to Home
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30 mb-4">
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 font-bold text-sm">PREMIUM</span>
          </div>
          <h1 className="font-bold text-3xl md:text-4xl text-white mb-3">
            Subscribe to FBO Movies
          </h1>
          <p className="text-white/60 text-lg">
            UGX {price.toLocaleString()} for 30 days unlimited access
          </p>
        </motion.div>

        {/* Payment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 rounded-3xl border border-white/20"
        >
          
          {/* Step 1: Send Money */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">1</div>
              <h2 className="font-bold text-xl text-white">Send Money</h2>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6 mb-4">
              <div className="text-center mb-4">
                <p className="text-white/60 text-sm mb-2">Send to this number:</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-white font-bold text-3xl">{MOMO_NUMBER}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(MOMO_NUMBER)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    title="Copy number"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-white/70" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-white/50 text-xs mb-1">Amount</p>
                  <p className="text-white font-bold text-xl">UGX {price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs mb-1">Duration</p>
                  <p className="text-white font-bold text-xl">30 Days</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
                <p className="text-yellow-300 text-sm font-medium">MTN MoMo</p>
                <p className="text-white/60 text-xs mt-1">*165#</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
                <p className="text-red-300 text-sm font-medium">Airtel Money</p>
                <p className="text-white/60 text-xs mt-1">*185#</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10 mb-8" />

          {/* Step 2: Submit Form */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">2</div>
              <h2 className="font-bold text-xl text-white">Submit Payment Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  placeholder="0776123456"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Network Used
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNetwork('MTN')}
                    className={`p-3 rounded-xl border-2 font-medium transition-all ${
                      network === 'MTN'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                        : 'bg-white/5 border-white/20 text-white/50 hover:border-white/40'
                    }`}
                  >
                    MTN MoMo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNetwork('AIRTEL')}
                    className={`p-3 rounded-xl border-2 font-medium transition-all ${
                      network === 'AIRTEL'
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-white/5 border-white/20 text-white/50 hover:border-white/40'
                    }`}
                  >
                    Airtel Money
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  required
                  placeholder="Enter the transaction ID from SMS"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                />
                <p className="text-white/40 text-xs mt-2">
                  Check your SMS for the transaction reference after sending money
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 py-4 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Payment
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-white/40 text-xs text-center mt-4">
                Your subscription activates within 30 minutes after verification
              </p>
            </form>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {['462+ VJ Movies', '53K+ Explore', 'HD Quality', 'Any Device'].map((feature, i) => (
            <div key={i} className="glass-card p-4 rounded-xl border border-white/10 text-center">
              <Check className="w-5 h-5 text-green-400 mx-auto mb-2" />
              <p className="text-white/80 text-sm font-medium">{feature}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
