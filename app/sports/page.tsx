'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, ExternalLink } from 'lucide-react'
import { initAdBlocker } from './ad-blocker'

export default function SportsPage() {
  useEffect(() => {
    // Initialize ad blocker
    initAdBlocker()
    
    // Redirect to yashintv.xyz after a brief moment
    const timer = setTimeout(() => {
      window.location.href = 'https://yashintv.xyz'
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-600 flex items-center justify-center"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-white font-bold text-2xl mb-2">Opening Live Sports...</h1>
        <p className="text-white/60 mb-4">Taking you to Yashin TV</p>
        <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
          <ExternalLink className="w-4 h-4" />
          <span>yashintv.xyz</span>
        </div>
      </motion.div>
    </div>
  )
}
