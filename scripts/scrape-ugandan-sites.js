#!/usr/bin/env node

/**
 * Ugandan VJ Movie Scraper (Node.js version)
 * Scrapes movies from TulaWatch, JTZ MAG, Ugaflix
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

// Sites to scrape
const SITES = {
  tulawatch: 'https://tulawatch.com',
  jtzmag: 'https://jtzmag.com',
  ugaflix: 'https://ugaflix.com'
}

// Fetch URL
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
    
    protocol.get(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

// Extract VJ from text
function extractVJ(text) {
  const vjs = [
    'VJ Junior', 'VJ Jingo', 'VJ Ice P', 'VJ Kevo',
    'VJ Emmy', 'VJ Mark', 'VJ Neil', 'VJ IVO',
    'VJ Ashim J', 'VJ Banks', 'VJ KS', 'VJ Ivo'
  ]
  
  const textLower = text.toLowerCase()
  for (const vj of vjs) {
    if (textLower.includes(vj.toLowerCase())) {
      return vj
    }
  }
  
  return 'Unknown VJ'
}

// Create slug
function makeSlug(title, vj) {
  const slug = `${title} ${vj}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return slug
}

// Simple HTML parser - extract text between tags
function extractMoviesFromHTML(html, siteUrl) {
  const movies = []
  
  // Extract all <a> tags with href
  const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi
  let match
  
  const seenTitles = new Set()
  
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]
    const linkText = match[2].replace(/<[^>]*>/g, '').trim()
    
    // Skip if not a movie link
    if (!href.includes('/movie') && !href.includes('/watch') && !href.includes('/film')) {
      continue
    }
    
    // Skip if too short
    if (linkText.length < 3 || linkText.length > 100) {
      continue
    }
    
    // Skip if already seen
    const titleLower = linkText.toLowerCase()
    if (seenTitles.has(titleLower)) {
      continue
    }
    
    seenTitles.add(titleLower)
    
    // Build full URL
    let fullUrl = href
    if (href.startsWith('/')) {
      fullUrl = siteUrl + href
    } else if (!href.startsWith('http')) {
      fullUrl = siteUrl + '/' + href
    }
    
    // Extract VJ from surrounding context
    const contextStart = Math.max(0, match.index - 500)
    const contextEnd = Math.min(html.length, match.index + 500)
    const context = html.substring(contextStart, contextEnd)
    const vj = extractVJ(context)
    
    movies.push({
      title: linkText,
      vj: vj,
      slug: makeSlug(linkText, vj),
      url: fullUrl,
      poster: null,
      overview: null,
      source: siteUrl
    })
  }
  
  return movies
}

// Scrape a site
async function scrapeSite(siteName, siteUrl) {
  console.log(`📡 Scraping ${siteName}...`)
  
  try {
    // Try /movies endpoint first
    let html
    try {
      html = await fetchUrl(`${siteUrl}/movies`)
    } catch (e) {
      // Fallback to homepage
      html = await fetchUrl(siteUrl)
    }
    
    const movies = extractMoviesFromHTML(html, siteUrl)
    console.log(`   ✅ Found ${movies.length} movies`)
    return movies
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return []
  }
}

// Main function
async function main() {
  console.log('🎬 Ugandan VJ Movie Scraper\n')
  
  let allMovies = []
  
  // Scrape all sites
  for (const [name, url] of Object.entries(SITES)) {
    const movies = await scrapeSite(name, url)
    allMovies = allMovies.concat(movies)
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Remove duplicates
  const seenTitles = new Set()
  const uniqueMovies = []
  
  for (const movie of allMovies) {
    const titleLower = movie.title.toLowerCase()
    if (!seenTitles.has(titleLower)) {
      seenTitles.add(titleLower)
      uniqueMovies.push(movie)
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total scraped: ${allMovies.length}`)
  console.log(`   Unique movies: ${uniqueMovies.length}`)
  
  // Save to JSON
  const outputPath = path.join(__dirname, '../public/narabox_catalog.json')
  fs.writeFileSync(outputPath, JSON.stringify(uniqueMovies, null, 2))
  console.log(`\n✅ Saved ${uniqueMovies.length} movies to narabox_catalog.json`)
  
  // Create empty kibanda
  const kibandaPath = path.join(__dirname, '../public/kibanda_catalog.json')
  fs.writeFileSync(kibandaPath, JSON.stringify([], null, 2))
  console.log('✅ Created empty kibanda_catalog.json')
  
  console.log('\n🎉 Scraping complete!\n')
}

// Run
main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
