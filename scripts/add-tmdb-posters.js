#!/usr/bin/env node

/**
 * Add TMDB Posters to Existing Catalog
 * Efficiently adds posters to movies that don't have them
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

// TMDB API Key
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
          reject(new Error('Invalid JSON'))
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

// Main function
async function addPosters() {
  console.log('🎬 Adding TMDB Posters to Catalog\n')
  
  const catalogPath = path.join(__dirname, '../public/narabox_catalog.json')
  
  if (!fs.existsSync(catalogPath)) {
    console.error('❌ Catalog not found')
    process.exit(1)
  }
  
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
  console.log(`📊 Total movies: ${catalog.length}`)
  
  // Find movies without posters
  const moviesWithoutPosters = catalog.filter(m => !m.poster || m.poster === '')
  console.log(`🎨 Movies without posters: ${moviesWithoutPosters.length}\n`)
  
  if (moviesWithoutPosters.length === 0) {
    console.log('✅ All movies already have posters!')
    return
  }
  
  console.log('🔍 Fetching TMDB posters...\n')
  
  let postersAdded = 0
  const batchSize = 50 // Process first 50 movies to avoid long wait
  
  for (let i = 0; i < Math.min(batchSize, moviesWithoutPosters.length); i++) {
    const movie = moviesWithoutPosters[i]
    
    // Find index in original catalog
    const index = catalog.findIndex(m => m.slug === movie.slug)
    
    if (index === -1) continue
    
    // Wait a bit between requests
    if (i > 0 && i % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log(`   Processed ${i}/${Math.min(batchSize, moviesWithoutPosters.length)} (${postersAdded} found)`)
    }
    
    // Try to get TMDB poster
    const poster = await fetchTMDBPoster(movie.title)
    
    if (poster) {
      catalog[index].poster = poster
      postersAdded++
      console.log(`✅ [${i + 1}] ${movie.title}`)
    } else {
      console.log(`⏭️  [${i + 1}] ${movie.title}`)
    }
  }
  
  // Save updated catalog
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
  
  const totalWithPosters = catalog.filter(m => m.poster).length
  
  console.log(`\n✨ Done!`)
  console.log(`📊 Added ${postersAdded} new posters`)
  console.log(`🎨 Total movies with posters: ${totalWithPosters}/${catalog.length}`)
  console.log(`📁 Catalog updated\n`)
}

// Run
addPosters().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
