'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Crown, Zap, X } from 'lucide-react'
import { checkSubscriptionStatus, getDaysRemaining } from '@/lib/subscription'
import Link from 'next/link'

interface SubscriptionPaywallProps {
  children: React.ReactNode
  requireSubscription?: boolean
}

export default function SubscriptionPaywall({ children, requireSubscription = true }: SubscriptionPaywallProps) {
  const router = useRouter()
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [isWhitelisted, setIsWhitelisted] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    if (!requireSubscription) {
      setCheckingAccess(false)
      setHasAccess(true)
      return
    }

    const { hasAccess: access, isWhitelisted: whitelisted } = checkSubscriptionStatus()
    setHasAccess(access)
    setIsWhitelisted(whitelisted)
    setShowPaywall(!access)
    setCheckingAccess(false)
  }, [requireSubscription])

  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!requireSubscription || hasAccess) {
    return <>{children}</>
  }

  return (
    <>
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 sm:p-10 rounded-3xl border-2 border-purple-500/30 max-w-2xl w-full text-center relative"
              style={{
                background: 'linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(59,130,246,0.15) 100%)'
              }}
            >
              {/* Close button */}
              <button
                onClick={() => router.back()}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/50"
              >
                <Crown className="w-12 h-12 text-white" />
              </motion.div>

              {/* Title */}
              <h2 className="font-orbitron font-bold text-3xl sm:text-4xl text-white mb-4 glow-text-purple">
                Premium Content
              </h2>

              {/* Description */}
              <p className="text-white/80 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                Subscribe now to unlock unlimited access to thousands of VJ-translated movies
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                {[
                  { icon: '🎬', text: '462+ VJ Movies' },
                  { icon: '🌟', text: '53,000+ Titles' },
                  { icon: '📺', text: 'HD Quality' },
                  { icon: '⚡', text: 'Instant Access' }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                  >
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <div className="text-white/80 text-sm font-medium">{feature.text}</div>
                  </motion.div>
                ))}
              </div>

              {/* Price */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <div className="text-white/60 text-sm mb-2">Only</div>
                <div className="font-orbitron font-bold text-5xl text-white mb-1">
                  <span className="text-gradient">UGX 5,000</span>
                </div>
                <div className="text-white/60 text-sm">for 30 days</div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link
                  href="/subscribe"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 px-10 py-4 rounded-xl font-bold text-white text-lg shadow-2xl shadow-purple-500/50 transition-all hover:scale-105 active:scale-95"
                >
                  <Zap className="w-6 h-6 fill-current" />
                  Subscribe Now
                </Link>
              </motion.div>

              {/* Footer */}
              <p className="text-white/50 text-xs mt-6">
                Secure payment via MTN & Airtel Mobile Money
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blurred background content */}
      <div className={showPaywall ? 'pointer-events-none blur-sm' : ''}>
        {children}
      </div>
    </>
  )
}

// Subscription status banner
export function SubscriptionBanner() {
  const [show, setShow] = useState(false)
  const [daysLeft, setDaysLeft] = useState(0)
  const [isWhitelisted, setIsWhitelisted] = useState(false)

  useEffect(() => {
    const { hasAccess, isWhitelisted: whitelisted } = checkSubscriptionStatus()
    if (hasAccess) {
      const days = getDaysRemaining()
      setDaysLeft(days)
      setIsWhitelisted(whitelisted)
      
      // Show banner if subscription is expiring soon (less than 7 days)
      if (!whitelisted && days > 0 && days <= 7) {
        setShow(true)
      }
    }
  }, [])

  if (!show || isWhitelisted) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 left-0 right-0 z-40 px-4"
    >
      <div className="max-w-4xl mx-auto bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white">Subscription Expiring Soon</div>
            <div className="text-white/80 text-sm">{daysLeft} {daysLeft === 1 ? 'day' : 'days'} remaining</div>
          </div>
        </div>
        <Link
          href="/subscribe"
          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg font-bold text-white text-sm transition-colors whitespace-nowrap"
        >
          Renew Now
        </Link>
      </div>
    </motion.div>
  )
}
