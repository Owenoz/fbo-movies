'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone ||
                       document.referrer.includes('android-app://')

    if (isInstalled) {
      console.log('[Install] App already installed')
      return
    }

    // Always show button for manual install instructions
    setShowButton(true)

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      console.log('[Install] beforeinstallprompt fired')
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Use the deferred prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('[Install] User choice:', outcome)
      
      if (outcome === 'accepted') {
        setShowButton(false)
      }
      setDeferredPrompt(null)
    } else {
      // Show manual install instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)
      
      let message = 'To install this app:\n\n'
      
      if (isIOS) {
        message += '1. Tap the Share button (□↑)\n'
        message += '2. Scroll and tap "Add to Home Screen"\n'
        message += '3. Tap "Add"'
      } else if (isAndroid) {
        message += '1. Tap the menu (⋮) in your browser\n'
        message += '2. Tap "Install app" or "Add to Home screen"\n'
        message += '3. Tap "Install"'
      } else {
        message += '1. Click the install icon (⊕) in your browser address bar\n'
        message += 'OR\n'
        message += '1. Click browser menu\n'
        message += '2. Click "Install FBO Movies"'
      }
      
      alert(message)
    }
  }

  if (!showButton) return null

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-full shadow-2xl transition-all hover:scale-105"
    >
      <Download className="w-5 h-5" />
      Install App
    </button>
  )
}
