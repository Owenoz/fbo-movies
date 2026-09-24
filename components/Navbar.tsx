'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Film, Tv, Home, Menu, X, Crown, Trophy, LogOut, Shield } from 'lucide-react'
import Logo from './Logo'
import { checkSubscriptionStatus } from '@/lib/subscription'
import { supabase } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/admin-config'

const navLinks = [
  { href: '/',        label: 'Home',     icon: Home },
  { href: '/movies',  label: 'Movies',   icon: Film },
  { href: '/tv',      label: 'TV Shows', icon: Tv },
  { href: '/sports',  label: 'Sports',   icon: Trophy },
  { href: '/search',  label: 'Search',   icon: Search },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [hasSubscription, setHasSubscription] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const { hasAccess } = checkSubscriptionStatus()
    setHasSubscription(hasAccess)
    
    // Check if user is admin
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.email) {
      setUserEmail(session.user.email)
      setIsAdmin(isAdminEmail(session.user.email))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[rgba(13,0,26,0.92)] border-b border-purple-900/40 shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
            : 'bg-[rgba(13,0,26,0.75)] border-b border-white/5',
        ].join(' ')}
        style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 group flex-none">
              <Logo size={45} showText={false} />
            </Link>

            {/* ── Desktop Links ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      'relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                      active
                        ? 'text-white'
                        : 'text-white/60 hover:text-white',
                    ].join(' ')}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full border border-purple-500/50"
                        style={{ background: 'linear-gradient(135deg, rgba(147,51,234,0.25), rgba(59,130,246,0.25))' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* ── Desktop Search & Subscribe ── */}
            <div className="hidden md:flex items-center gap-3">
              <form onSubmit={e => { e.preventDefault(); if (searchVal.trim()) window.location.href=`/search?q=${encodeURIComponent(searchVal)}` }}>
                <div className="relative flex items-center">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  <input value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="Search movies…"
                    className="pl-9 pr-4 py-2 rounded-full text-sm text-white placeholder-white/30 w-44 focus:w-60 transition-all duration-300 outline-none border border-white/10 focus:border-purple-500/60"
                    style={{ background:'rgba(255,255,255,0.07)', backdropFilter:'blur(10px)' }} />
                </div>
              </form>
              
              {!hasSubscription && (
                <Link
                  href="/subscribe"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold text-sm shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
                >
                  <Crown className="w-4 h-4" />
                  Subscribe
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin/users"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                  title="Admin Panel"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all hover:scale-105 border border-white/20"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* ── Mobile Toggle ── */}
            <button
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.07)' }}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 p-4"
            style={{
              background: 'rgba(13,0,26,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(147,51,234,0.2)',
            }}
          >
            {/* mobile search */}
            <form
              className="relative mb-3"
              onSubmit={e => {
                e.preventDefault()
                if (searchVal.trim()) {
                  setMobileOpen(false)
                  window.location.href = `/search?q=${encodeURIComponent(searchVal)}`
                }
              }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search movies, shows…"
                className="w-full pl-9 pr-4 py-2.5 rounded-full text-sm text-white placeholder-white/30 outline-none border border-white/10"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
            </form>

            {!hasSubscription && (
              <Link
                href="/subscribe"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full mb-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm shadow-lg"
              >
                <Crown className="w-4 h-4" />
                Subscribe Now
              </Link>
            )}

            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all duration-200',
                  pathname === href
                    ? 'text-white border border-purple-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5',
                ].join(' ')}
                style={pathname === href ? { background: 'rgba(147,51,234,0.15)' } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin/users"
                onClick={() => setMobileOpen(false)}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all duration-200',
                  pathname.startsWith('/admin')
                    ? 'text-white border border-blue-500/30 bg-blue-500/15'
                    : 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/20',
                ].join(' ')}
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}

            <button
              onClick={() => {
                setMobileOpen(false)
                handleLogout()
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 border border-red-500/20 mt-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
