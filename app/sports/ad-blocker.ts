// Client-side ad blocker for sports streaming
export function initAdBlocker() {
  if (typeof window === 'undefined') return

  // List of common ad domains to block
  const adDomains = [
    'doubleclick.net',
    'googlesyndication.com',
    'google-analytics.com',
    'googleadservices.com',
    'amazon-adsystem.com',
    'adnxs.com',
    'advertising.com',
    'taboola.com',
    'outbrain.com',
    'criteo.com',
    'pubmatic.com',
    'advertising.com',
    'adsafeprotected.com',
    'adf.ly',
    'popads.net',
    'popcash.net',
    'propellerads.com',
    'mgid.com',
    'revcontent.com',
    'adform.net',
    'bidswitch.net',
  ]

  // Block ad requests
  const originalFetch = window.fetch
  window.fetch = function(...args) {
    const url = args[0]?.toString() || ''
    
    // Block if URL contains ad domain
    if (adDomains.some(domain => url.includes(domain))) {
      return Promise.reject(new Error('Ad blocked'))
    }
    
    return originalFetch.apply(this, args)
  }

  // Block ad iframes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'IFRAME') {
          const iframe = node as HTMLIFrameElement
          const src = iframe.src || ''
          
          // Block if iframe contains ad domain
          if (adDomains.some(domain => src.includes(domain))) {
            iframe.remove()
          }
        }
        
        // Block common ad containers
        if (node.nodeType === 1) {
          const element = node as HTMLElement
          const classNames = element.className?.toString() || ''
          const id = element.id || ''
          
          if (
            classNames.includes('ad-') ||
            classNames.includes('advertisement') ||
            id.includes('ad-') ||
            id.includes('advertisement')
          ) {
            element.style.display = 'none'
          }
        }
      })
    })
  })

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Block popups
  const originalOpen = window.open
  window.open = function(...args) {
    const url = args[0]?.toString() || ''
    
    // Allow same-origin
    if (url && (url.startsWith('/') || url.includes(window.location.hostname))) {
      return originalOpen.apply(this, args)
    }
    
    // Block external popups
    console.log('Blocked popup:', url)
    return null
  }

  console.log('Ad blocker initialized')
}
