'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Check, X, Search, Clock, CheckCircle2 } from 'lucide-react'
import { createSubscription } from '@/lib/subscription'

// In production, fetch this from a database
// For now, we'll use localStorage to demonstrate
interface PendingPayment {
  submissionId: string
  email: string
  phone_number: string
  network: 'MTN' | 'AIRTEL'
  transaction_reference: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

export default function AdminApprovePage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  // Simple password protection (in production, use proper authentication)
  const ADMIN_PASSWORD = 'fbo2025admin' // Change this!

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setError('')
      loadPendingPayments()
    } else {
      setError('Invalid password')
    }
  }

  const loadPendingPayments = () => {
    // In production, fetch from database
    // For now, load from localStorage (demo purposes)
    const saved = localStorage.getItem('fbo_pending_payments')
    if (saved) {
      setPendingPayments(JSON.parse(saved))
    }
  }

  const handleApprove = (payment: PendingPayment) => {
    // Create subscription
    createSubscription(payment.email, payment.transaction_reference)
    
    // Update payment status
    const updated = pendingPayments.map(p =>
      p.submissionId === payment.submissionId
        ? { ...p, status: 'approved' as const }
        : p
    )
    setPendingPayments(updated)
    localStorage.setItem('fbo_pending_payments', JSON.stringify(updated))
    
    alert(`✅ Approved! Subscription activated for ${payment.email}`)
  }

  const handleReject = (payment: PendingPayment) => {
    if (!confirm(`Are you sure you want to reject payment from ${payment.email}?`)) {
      return
    }
    
    // Update payment status
    const updated = pendingPayments.map(p =>
      p.submissionId === payment.submissionId
        ? { ...p, status: 'rejected' as const }
        : p
    )
    setPendingPayments(updated)
    localStorage.setItem('fbo_pending_payments', JSON.stringify(updated))
    
    alert(`❌ Rejected payment from ${payment.email}`)
  }

  const filteredPayments = pendingPayments.filter(p =>
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone_number.includes(searchTerm) ||
    p.transaction_reference.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    pending: pendingPayments.filter(p => p.status === 'pending').length,
    approved: pendingPayments.filter(p => p.status === 'approved').length,
    rejected: pendingPayments.filter(p => p.status === 'rejected').length
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 rounded-2xl border border-white/15 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h1 className="font-bold text-2xl text-white mb-2">Admin Access</h1>
            <p className="text-white/60 text-sm">Enter password to approve payments</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-galaxy py-3 rounded-xl font-bold"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-orbitron font-bold text-3xl text-white mb-2">
                Payment Approvals
              </h1>
              <p className="text-white/60">Review and approve Mobile Money payments</p>
            </div>
            <button
              onClick={() => {
                setAuthenticated(false)
                setPassword('')
              }}
              className="btn-glass px-4 py-2 rounded-xl"
            >
              Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
              <Clock className="w-6 h-6 text-yellow-400 mb-2" />
              <div className="text-2xl font-bold text-white">{stats.pending}</div>
              <div className="text-yellow-300 text-sm">Pending</div>
            </div>
            <div className="glass-card p-4 rounded-xl border border-green-500/30 bg-green-500/10">
              <CheckCircle2 className="w-6 h-6 text-green-400 mb-2" />
              <div className="text-2xl font-bold text-white">{stats.approved}</div>
              <div className="text-green-300 text-sm">Approved</div>
            </div>
            <div className="glass-card p-4 rounded-xl border border-red-500/30 bg-red-500/10">
              <X className="w-6 h-6 text-red-400 mb-2" />
              <div className="text-2xl font-bold text-white">{stats.rejected}</div>
              <div className="text-red-300 text-sm">Rejected</div>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by email, phone, or transaction ref..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all"
            />
          </div>
        </motion.div>

        {/* Payments List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredPayments.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl border border-white/15 text-center">
              <p className="text-white/60">No payments found</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div
                key={payment.submissionId}
                className={`glass-card p-6 rounded-2xl border transition-all ${
                  payment.status === 'pending'
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : payment.status === 'approved'
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        payment.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : payment.status === 'approved'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {payment.status.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        payment.network === 'MTN'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {payment.network}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/50 text-xs">Email</label>
                        <p className="text-white font-medium">{payment.email}</p>
                      </div>
                      <div>
                        <label className="text-white/50 text-xs">Phone</label>
                        <p className="text-white font-medium">{payment.phone_number}</p>
                      </div>
                      <div>
                        <label className="text-white/50 text-xs">Transaction Ref</label>
                        <p className="text-white font-mono text-sm">{payment.transaction_reference}</p>
                      </div>
                      <div>
                        <label className="text-white/50 text-xs">Amount</label>
                        <p className="text-white font-bold">UGX {payment.amount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-white/50 text-xs">Submitted</label>
                      <p className="text-white/70 text-sm">
                        {new Date(payment.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {payment.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(payment)}
                        className="p-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 transition-all"
                        title="Approve"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(payment)}
                        className="p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 transition-all"
                        title="Reject"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}
