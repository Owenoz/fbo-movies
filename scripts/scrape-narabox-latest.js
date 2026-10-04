#!/usr/bin/env node

/**
 * NaraBox Latest Movies Scraper
 * Automatically fetches the latest movies from NaraBox and updates catalog
 */

const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

// NaraBox URLs
const NARABOX_BASE = 'https://naraboxtv.com'
const NARABOX_MOVIES = 'https://naraboxtv.com/movies'

// Extract VJ from text
function extractVJ(text) {
  const vjs = [
    'VJ Junior', 'VJ Jingo', 'VJ Ice P', 'VJ Kevo',
    'VJ Emmy', 'VJ Mark', 'VJ Neil', 'VJ IVO',
    'VJ Ashim J', 'VJ Banks', 'VJ KS', 'VJ Ice'
  ]
  
  const textLower = text.toLowerCase()
  for (const vj of vjs) {
    if (textLower.includes(vj.toLowerCase())) {
      return vj
    }
  }
  
  return 'Unknown VJ'
}

// Create slug from title
function makeSlug(title, vj) {
  const slug = `${title} ${vj}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return slug
}

// Scrape NaraBox movies page
async function scrapeNaraBox() {
  console.log('🎬 NaraBox Latest Movies Scraper\n')
  console.log('📡 Fetching latest movies from NaraBox...\n')
  
  try {
    const response = await axios.get(NARABOX_MOVIES, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    })
    
    const $ = cheerio.load(response.data)
    const movies = []
    
    // Try various selectors for movie cards
    const selectors = [
      '.movie-item',
      '.movie-card', 
      '.post-item',
      'article',
      '.video-item',
      '[class*="movie"]',
      '[class*="film"]'
    ]
    
    let movieElements = $()
    for (const selector of selectors) {
      movieElements = $(selector)
      if (movieElements.length > 0) {
        console.log(`   Found ${movieElements.length} movies with selector: ${selector}`)
        break
      }
    }
    
    if (movieElements.length === 0) {
      // Try finding all links to /movies/
      movieElements = $('a[href*="/movies/"]').parent()
      console.log(`   Found ${movieElements.length} movie links`)
    }
    
    movieElements.each((i, elem) => {
      if (i >= 100) return false // Limit to 100 latest movies
      
      try {
        const $elem = $(elem)
        
        // Extract title
        const titleElem = $elem.find('h2, h3, h4, h5, .title, a').first()
        let title = titleElem.text().trim()
        
        if (!title || title.length < 3) return
        
        // Extract URL
        const linkElem = $elem.find('a[href*="/movies/"]').first()
        if (!linkElem.length) return
        
        const href = linkElem.attr('href')
        const url = href.startsWith('http') ? href : NARABOX_BASE + href
        
        // Extract slug from URL
        const slugMatch = url.match(/\/movies\/([^\/]+)/)
        const slug = slugMatch ? slugMatch[1] : makeSlug(title, '')
        
        // Extract VJ
        const containerText = $elem.text()
        const vj = extractVJ(containerText) || extractVJ(title)
        
        // Extract poster image
        const imgElem = $elem.find('img').first()
        let poster = null
        if (imgElem.length) {
          const src = imgElem.attr('src') || imgElem.attr('data-src') || imgElem.attr('data-lazy')
          if (src && src.startsWith('http')) {
            poster = src
          }
        }
        
        // Extract overview/description
        const descElem = $elem.find('p, .description, .overview, .excerpt').first()
        const overview = descElem.text().trim() || null
        
        movies.push({
          title,
          vj,
          slug,
          url,
          poster,
          overview,
          mp4: null, // Will be filled when user clicks to watch
          addedAt: Date.now()
        })
        
      } catch (err) {
        // Skip this movie
      }
    })
    
    console.log(`✅ Scraped ${movies.length} movies from NaraBox\n`)
    return movies
    
  } catch (error) {
    console.error(`❌ Error scraping NaraBox: ${error.message}`)
    return []
  }
}

// Merge new movies with existing catalog
function mergeCatalogs(existingCatalog, newMovies) {
  console.log('🔄 Merging with existing catalog...')
  
  const existingSlugs = new Set(existingCatalog.map(m => m.slug))
  let addedCount = 0
  
  for (const movie of newMovies) {
    if (!existingSlugs.has(movie.slug)) {
      existingCatalog.unshift(movie) // Add to beginning (latest first)
      addedCount++
    }
  }
  
  console.log(`   Added ${addedCount} new movies`)
  console.log(`   Total movies now: ${existingCatalog.length}\n`)
  
  return existingCatalog
}

// Main function
async function main() {
  const catalogPath = path.join(__dirname, '../public/narabox_catalog.json')
  
  // Load existing catalog
  let existingCatalog = []
  if (fs.existsSync(catalogPath)) {
    existingCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
    console.log(`📚 Existing catalog: ${existingCatalog.length} movies\n`)
  }
  
  // Scrape latest movies
  const newMovies = await scrapeNaraBox()
  
  if (newMovies.length === 0) {
    console.log('⚠️  No new movies found. Using existing catalog.')
    return
  }
  
  // Merge catalogs
  const mergedCatalog = mergeCatalogs(existingCatalog, newMovies)
  
  // Save updated catalog
  fs.writeFileSync(catalogPath, JSON.stringify(mergedCatalog, null, 2))
  console.log(`✅ Catalog updated and saved!`)
  console.log(`📊 Total: ${mergedCatalog.length} movies\n`)
}

// Run
main().catch(err => {
  console.error('❌ Fatal error:', err.message)
  process.exit(1)
})
