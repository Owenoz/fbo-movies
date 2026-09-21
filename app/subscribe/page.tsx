'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Loader2, Shield, Crown, Zap, Copy, CheckCircle2, Smartphone, AlertCircle } from 'lucide-react'
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
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')
  const [copied, setCopied] = useState(false)

  const price = getSubscriptionPrice()
  
  // Your Mobile Money Number
  const MOMO_NUMBER = '0793854272'
  const MOMO_NAME = 'FBO Movies'

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
      // Store email for later
      localStorage.setItem('subscription_email', email)

      // Check if email is whitelisted (admin)
      if (isEmailWhitelisted(email)) {
        // Auto-approve for whitelisted emails
        createSubscription(email, 'ADMIN_FREE_ACCESS')
        setStep('success')
        setTimeout(() => router.push('/'), 2000)
        return
      }

      // Submit payment details for manual verification
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
        // Save to localStorage for admin review
        const pending = JSON.parse(localStorage.getItem('fbo_pending_payments') || '[]')
        pending.push(data.paymentData)
        localStorage.setItem('fbo_pending_payments', JSON.stringify(pending))
        
        setStep('processing')
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

  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 rounded-2xl border border-white/15 max-w-lg w-full text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
          />
          <h2 className="font-bold text-2xl text-white mb-3">Payment Submitted!</h2>
          <p className="text-white/70 mb-4">
            We've received your payment details. Your subscription will be activated once we verify your transaction.
          </p>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6">
            <p className="text-blue-300 text-sm">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Usually takes 5-30 minutes during business hours.
            </p>
          </div>
          <p className="text-white/60 text-sm mb-6">
            Transaction Reference: <span className="text-white font-mono">{transactionRef}</span>
          </p>
          <div className="space-y-3">
            <Link href="/" className="block btn-galaxy px-6 py-3 rounded-xl font-bold">
              Back to Home
            </Link>
            <button
              onClick={() => setStep('form')}
              className="block w-full btn-glass px-6 py-3 rounded-xl font-bold"
            >
              Submit Another Payment
            </button>
          </div>
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
            Pay via Mobile Money and get access to thousands of movies!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Payment Instructions & Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            
            {/* Step 1: Choose Network */}
            <div className="glass-card p-6 rounded-2xl border border-white/15">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">1</div>
                <h2 className="font-bold text-xl text-white">Choose Your Network</h2>
              </div>
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
                  <Smartphone className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-bold text-lg">MTN MoMo</div>
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
                  <Smartphone className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-bold text-lg">Airtel Money</div>
                </button>
              </div>
            </div>

            {/* Step 2: Make Payment */}
            <div className="glass-card p-6 rounded-2xl border border-white/15">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">2</div>
                <h2 className="font-bold text-xl text-white">Make Payment</h2>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-white/60 text-sm">Send Money To:</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white font-bold text-2xl">{MOMO_NUMBER}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(MOMO_NUMBER)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white/70" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm">Name:</label>
                  <p className="text-white font-bold">{MOMO_NAME}</p>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm">Amount:</label>
                  <p className="text-white font-bold text-2xl">UGX {price.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-300 text-sm">
                  <strong>How to pay:</strong><br/>
                  {network === 'MTN' && `1. Dial *165# → 2. Send Money → 3. Enter ${MOMO_NUMBER} → 4. Enter UGX 5,000 → 5. Enter PIN`}
                  {network === 'AIRTEL' && `1. Dial *185# → 2. Send Money → 3. Enter ${MOMO_NUMBER} → 4. Enter UGX 5,000 → 5. Enter PIN`}
                </p>
              </div>
            </div>

            {/* Step 3: Submit Details */}
            <div className="glass-card p-6 rounded-2xl border border-white/15">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">3</div>
                <h2 className="font-bold text-xl text-white">Submit Transaction Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Phone Number (that sent money)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="0776123456"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Transaction Reference / ID *
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    required
                    placeholder="e.g. 2025011234567"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all"
                  />
                  <p className="text-white/50 text-xs mt-2">
                    Check your SMS for the transaction reference/ID after sending money to {MOMO_NUMBER}
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 py-4 rounded-xl font-bold text-white shadow-lg shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Payment Details
                      <Zap className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-white/50 text-xs text-center">
                  Your subscription will be activated within 5-30 minutes after verification
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
                  'No auto-renewal'
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
              <h3 className="font-bold text-lg text-white mb-2">Fast & Secure</h3>
              <p className="text-white/70 text-sm">
                Direct Mobile Money payment. Simple verification process. Trusted by hundreds of movie fans.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-blue-500/30 bg-blue-500/10">
              <AlertCircle className="w-10 h-10 text-blue-400 mb-3" />
              <h3 className="font-bold text-lg text-white mb-2">Need Help?</h3>
              <p className="text-white/70 text-sm mb-3">
                Contact us if your subscription isn't activated within 30 minutes.
              </p>
              <p className="text-blue-300 text-sm font-medium">
                WhatsApp: {MOMO_NUMBER}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
