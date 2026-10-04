#!/usr/bin/env node

/**
 * Fresh NaraBox Scraper with TMDB Posters
 * Scrapes movies from NaraBox and adds TMDB posters automatically
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

// TMDB API Key from user's screenshot
const TMDB_API_KEY = '577187c381c6bd81a2e6656d79af8947'

// Fetch function using https module
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          resolve(data)
        }
      })
    }).on('error', reject)
  })
}

// Fetch TMDB poster for a movie title
async function fetchTMDBPoster(title) {
  try {
    // Clean title - remove VJ suffix
    const cleanTitle = title
      .replace(/\s*-?\s*vj\s+\w+.*$/i, '')
      .replace(/\s+part\s+\d+/i, '')
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s+-\s+.*$/i, '')
      .trim()
    
    if (!cleanTitle || cleanTitle.length < 2) return null
    
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&include_adult=false&language=en-US&page=1`
    
    const data = await fetchUrl(searchUrl)
    
    if (data.results && data.results.length > 0) {
      const movie = data.results[0]
      if (movie.poster_path) {
        return `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

// Scrape NaraBox catalog
async function scrapeNaraBox() {
  console.log('🎬 Scraping NaraBox Movies with TMDB Posters\n')
  
  try {
    // Fetch NaraBox catalog directly
    const catalogUrl = 'https://nbxgen.naraboxtv.com/catalog/narabox_full_catalog.json'
    console.log('📡 Fetching NaraBox catalog...')
    
    const catalog = await fetchUrl(catalogUrl)
    
    if (!Array.isArray(catalog)) {
      console.error('❌ Failed to fetch catalog')
      return
    }
    
    console.log(`✅ Found ${catalog.length} movies\n`)
    console.log('🎨 Fetching TMDB posters (this may take a few minutes)...\n')
    
    const movies = []
    let postersFound = 0
    
    // Process movies in batches to avoid rate limiting
    for (let i = 0; i < catalog.length; i++) {
      const movie = catalog[i]
      
      // Wait a bit between requests to avoid rate limiting
      if (i > 0 && i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log(`   Processed ${i}/${catalog.length} movies (${postersFound} posters found)`)
      }
      
      // Try to get TMDB poster
      const poster = await fetchTMDBPoster(movie.title)
      
      if (poster) {
        postersFound++
      }
      
      movies.push({
        title: movie.title,
        vj: movie.vj,
        slug: movie.slug,
        url: movie.url,
        mp4: movie.mp4,
        poster: poster || movie.poster || null,
        overview: movie.overview || null,
        runtime: movie.runtime || null,
        addedAt: Date.now()
      })
    }
    
    // Save to file
    const outputPath = path.join(__dirname, '../public/narabox_catalog.json')
    fs.writeFileSync(outputPath, JSON.stringify(movies, null, 2))
    
    console.log(`\n✨ Success!`)
    console.log(`📊 Total movies: ${movies.length}`)
    console.log(`🎨 Movies with posters: ${postersFound}`)
    console.log(`📁 Saved to: ${outputPath}\n`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run scraper
scrapeNaraBox()
