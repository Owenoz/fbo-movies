'use client'

// Free access whitelist
const FREE_ACCESS_EMAILS = [
  'muyanjaowen3@gmail.com',  // Admin email - free access
]

export interface Subscription {
  email: string
  status: 'active' | 'expired' | 'pending'
  startDate: string
  expiryDate: string
  transactionId?: string
  amount: number
}

const SUBSCRIPTION_KEY = 'fbo_subscription'
const SUBSCRIPTION_PRICE = 5000 // 5000 UGX

export function isEmailWhitelisted(email: string): boolean {
  return FREE_ACCESS_EMAILS.includes(email.toLowerCase().trim())
}

export function getSubscription(): Subscription | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(SUBSCRIPTION_KEY)
  if (!data) return null
  
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function saveSubscription(subscription: Subscription): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription))
}

export function hasActiveSubscription(email?: string): boolean {
  // Check if email is whitelisted
  if (email && isEmailWhitelisted(email)) {
    return true
  }

  const sub = getSubscription()
  if (!sub) return false
  
  // Check if subscription is active and not expired
  if (sub.status !== 'active') return false
  
  const now = new Date()
  const expiry = new Date(sub.expiryDate)
  
  return expiry > now
}

export function checkSubscriptionStatus(): { hasAccess: boolean; subscription: Subscription | null; isWhitelisted: boolean } {
  const sub = getSubscription()
  
  // Check whitelist first
  if (sub?.email && isEmailWhitelisted(sub.email)) {
    return {
      hasAccess: true,
      subscription: sub,
      isWhitelisted: true
    }
  }
  
  // Check regular subscription
  const hasAccess = hasActiveSubscription()
  
  return {
    hasAccess,
    subscription: sub,
    isWhitelisted: false
  }
}

export function createSubscription(email: string, transactionId: string): Subscription {
  const now = new Date()
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 30) // 30 days subscription
  
  const subscription: Subscription = {
    email: email.toLowerCase().trim(),
    status: 'active',
    startDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    transactionId,
    amount: SUBSCRIPTION_PRICE,
  }
  
  saveSubscription(subscription)
  return subscription
}

export function clearSubscription(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SUBSCRIPTION_KEY)
}

export function getSubscriptionPrice(): number {
  return SUBSCRIPTION_PRICE
}

export function getDaysRemaining(): number {
  const sub = getSubscription()
  if (!sub || sub.status !== 'active') return 0
  
  const now = new Date()
  const expiry = new Date(sub.expiryDate)
  const diff = expiry.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  
  return days > 0 ? days : 0
}
