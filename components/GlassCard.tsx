'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'purple' | 'blue' | 'pink' | 'cyan' | 'none'
  onClick?: () => void
  delay?: number
}

const glowColors = {
  purple: 'hover:shadow-glow-purple hover:border-purple-500/50',
  blue:   'hover:shadow-glow-blue hover:border-blue-500/50',
  pink:   'hover:shadow-glow-pink hover:border-pink-500/50',
  cyan:   'hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:border-cyan-500/50',
  none:   '',
}

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = 'purple',
  onClick,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -4 } : undefined}
      onClick={onClick}
      className={[
        'glass-card',
        hover ? `glass-hover transition-all duration-300 cursor-pointer ${glowColors[glow]}` : '',
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  )
}

// ─── Skeleton variant ──────────────────────────────────────────────────────────
export function GlassCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card shimmer-bg ${className}`} />
  )
}
