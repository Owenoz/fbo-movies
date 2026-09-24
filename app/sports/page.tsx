'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { initAdBlocker } from './ad-blocker'

export default function SportsPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Initialize advanced ad blocker
    initAdBlocker()

    // Enhanced ad blocking for iframe
    const blockAds = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document
          
          // Block ad scripts
          const scripts = iframeDoc.querySelectorAll('script[src*="ads"], script[src*="doubleclick"], script[src*="googlesyndication"]')
          scripts.forEach(script => script.remove())
          
          // Block ad iframes
          const adIframes = iframeDoc.querySelectorAll('iframe[src*="ads"], iframe[src*="doubleclick"]')
          adIframes.forEach(iframe => iframe.remove())
          
          // Block popups
          if (iframeDoc.defaultView) {
            iframeDoc.defaultView.open = function() { return null; }
          }
        } catch (e) {
          // Cross-origin restrictions - handled by CSP
        }
      }
    }

    // Block ads on load
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', blockAds)
    }

    // Prevent context menu
    const preventContext = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', preventContext)

    return () => {
      document.removeEventListener('contextmenu', preventContext)
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', blockAds)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black">
      {/* Loading State */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute inset-0 bg-black flex items-center justify-center z-10 pointer-events-none"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center"
          >
            <span className="text-3xl">⚽</span>
          </motion.div>
          <p className="text-white/60 text-sm">Loading Live Sports...</p>
        </div>
      </motion.div>

      {/* Full Screen Embedded Stream - No Browser UI */}
      <iframe
        ref={iframeRef}
        src="https://yashintv.xyz"
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
        title="Live Sports Streaming"
        loading="eager"
        referrerPolicy="no-referrer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          display: 'block',
          backgroundColor: '#000'
        }}
      />

      {/* Ad Blocker Overlay - Blocks popups */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{ mixBlendMode: 'normal' }}
      />
    </div>
  )
}
