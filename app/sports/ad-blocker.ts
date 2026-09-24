// Advanced Ad Blocker for Sports Streaming
export function initAdBlocker() {
  if (typeof window === 'undefined') return

  // Block ad domains
  const adDomains = [
    'doubleclick.net',
    'googlesyndication.com',
    'googleadservices.com',
    'google-analytics.com',
    'googletagmanager.com',
    'facebook.net',
    'connect.facebook.net',
    'scorecardresearch.com',
    'adservice.google.com',
    'pagead2.googlesyndication.com',
    'tpc.googlesyndication.com',
    'partner.googleadservices.com',
    'adnxs.com',
    'advertising.com',
    'criteo.com',
    'outbrain.com',
    'taboola.com',
    'pubmatic.com',
    'rubiconproject.com',
    'openx.net',
    'yieldmo.com',
    'contextweb.com',
    'advertising.com',
    'quantserve.com',
    'adsrvr.org',
    'adform.net',
    'rlcdn.com',
    'casalemedia.com'
  ]

  // Override window.open to prevent popups
  const originalOpen = window.open
  window.open = function(...args: any[]) {
    const url = args[0]?.toString() || ''
    
    // Block if it's an ad domain
    if (adDomains.some(domain => url.includes(domain))) {
      console.log('Blocked popup:', url)
      return null
    }
    
    // Only allow yashintv.xyz and same origin
    if (!url.includes('yashintv.xyz') && !url.startsWith('/') && url !== '') {
      console.log('Blocked external popup:', url)
      return null
    }
    
    return originalOpen.apply(window, args as any)
  }

  // Block ad iframes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'IFRAME') {
          const iframe = node as HTMLIFrameElement
          const src = iframe.src || iframe.getAttribute('src') || ''
          
          // Block ad iframes
          if (adDomains.some(domain => src.includes(domain))) {
            console.log('Blocked ad iframe:', src)
            iframe.remove()
          }
        }
      })
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // Block beforeunload popups
  window.addEventListener('beforeunload', (e) => {
    e.preventDefault()
    e.stopPropagation()
  }, true)

  // Prevent right-click context menu (optional)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })

  // Block focus stealing
  let lastFocus = document.hasFocus()
  setInterval(() => {
    if (!lastFocus && document.hasFocus()) {
      // Page regained focus - might be from a popup
      const popups = window.document.querySelectorAll('iframe:not([src*="yashintv.xyz"])')
      popups.forEach(popup => {
        if (popup.parentNode) {
          popup.remove()
        }
      })
    }
    lastFocus = document.hasFocus()
  }, 100)

  console.log('✅ Ad Blocker Active')
}
