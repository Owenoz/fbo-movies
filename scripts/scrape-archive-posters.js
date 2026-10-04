#!/usr/bin/env node

/**
 * Internet Archive Poster Scraper
 * Searches Internet Archive for movie posters and adds them to catalog
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')

// Internet Archive Search API
const IA_SEARCH_URL = 'https://archive.org/advancedsearch.php'

// Search for movie poster on Internet Archive
async function searchArchivePoster(movieTitle) {
  try {
    // Clean title for search
    const cleanTitle = movieTitle
      .replace(/\s*-?\s*vj\s+\w+.*$/i, '')
      .replace(/\s+part\s+\d+/i, '')
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s+-\s+.*$/i, '')
      .trim()
    
    if (!cleanTitle || cleanTitle.length < 3) return null
    
    // Search query: movie title + poster in images collection
    const query = `(${cleanTitle} poster) AND mediatype:image`
    
    const params = {
      q: query,
      fl: ['identifier', 'title', 'format'],
      rows: 5,
      output: 'json'
    }
    
    const response = await axios.get(IA_SEARCH_URL, {
      params,
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 MovieApp/1.0'
      }
    })
    
    if (response.data && response.data.response && response.data.response.docs) {
      const docs = response.data.response.docs
      
      // Find best match
      for (const doc of docs) {
        const identifier = doc.identifier
        
        // Try to find a suitable image format
        const formats = doc.format || []
        const hasImage = formats.some(f => 
          f.toLowerCase().includes('jpeg') || 
          f.toLowerCase().includes('jpg') ||
          f.toLowerCase().includes('png')
        )
        
        if (hasImage) {
          // Construct image URL - Internet Archive uses this pattern
          // https://archive.org/download/identifier/identifier.jpg
          const possibleUrls = [
            `https://archive.org/download/${identifier}/${identifier}.jpg`,
            `https://archive.org/download/${identifier}/${identifier}.jpeg`,
            `https://archive.org/download/${identifier}/${identifier}.png`,
            `https://archive.org/download/${identifier}/cover.jpg`,
            `https://archive.org/download/${identifier}/poster.jpg`,
            `https://archive.org/services/img/${identifier}`
          ]
          
          // Return first possible URL (we'll validate it later)
          return possibleUrls[0]
        }
      }
    }
    
    return null
    
  } catch (error) {
    return null
  }
}

// Search TVMaze for show/movie poster
async function searchTVMaze(movieTitle) {
  try {
    const cleanTitle = movieTitle
      .replace(/\s*-?\s*vj\s+\w+.*$/i, '')
      .replace(/\s+part\s+\d+/i, '')
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s+-\s+.*$/i, '')
      .trim()
    
    if (!cleanTitle || cleanTitle.length < 2) return null
    
    // TVMaze API - no key needed!
    const searchUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(cleanTitle)}`
    const response = await axios.get(searchUrl, { timeout: 5000 })
    
    if (response.data && response.data.length > 0) {
      const show = response.data[0].show
      if (show && show.image && show.image.original) {
        return show.image.original
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

// Alternative: Try TMDB as fallback
async function searchTMDB(movieTitle) {
  const TMDB_API_KEY = '577187c381c6bd81a2e6656d79af8947'
  
  try {
    const cleanTitle = movieTitle
      .replace(/\s*-?\s*vj\s+\w+.*$/i, '')
      .replace(/\s+part\s+\d+/i, '')
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s+-\s+.*$/i, '')
      .trim()
    
    if (!cleanTitle || cleanTitle.length < 2) return null
    
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}`
    const response = await axios.get(searchUrl, { timeout: 5000 })
    
    if (response.data.results && response.data.results.length > 0) {
      const movie = response.data.results[0]
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
async function main() {
  console.log('🎬 Multi-Source Poster Scraper\n')
  console.log('Searching Archive.org + TVMaze + TMDB for posters...\n')
  
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
  
  console.log('🔍 Searching Internet Archive + TVMaze + TMDB...\n')
  
  let archiveFound = 0
  let tvmazeFound = 0
  let tmdbFound = 0
  const batchSize = 50 // Process first 50 to avoid long wait
  
  for (let i = 0; i < Math.min(batchSize, moviesWithoutPosters.length); i++) {
    const movie = moviesWithoutPosters[i]
    
    // Find index in original catalog
    const index = catalog.findIndex(m => m.slug === movie.slug)
    if (index === -1) continue
    
    // Progress update
    if (i > 0 && i % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log(`   Processed ${i}/${Math.min(batchSize, moviesWithoutPosters.length)} (Archive: ${archiveFound}, TVMaze: ${tvmazeFound}, TMDB: ${tmdbFound})`)
    }
    
    // Try Internet Archive first
    let poster = await searchArchivePoster(movie.title)
    let source = 'Archive'
    
    // Fallback to TVMaze
    if (!poster) {
      poster = await searchTVMaze(movie.title)
      source = 'TVMaze'
    }
    
    // Fallback to TMDB if neither has it
    if (!poster) {
      poster = await searchTMDB(movie.title)
      source = 'TMDB'
    }
    
    if (poster) {
      catalog[index].poster = poster
      if (source === 'Archive') {
        archiveFound++
        console.log(`📦 [${i + 1}] ${movie.title} - Archive.org`)
      } else if (source === 'TVMaze') {
        tvmazeFound++
        console.log(`📺 [${i + 1}] ${movie.title} - TVMaze`)
      } else {
        tmdbFound++
        console.log(`🎬 [${i + 1}] ${movie.title} - TMDB`)
      }
    } else {
      console.log(`⏭️  [${i + 1}] ${movie.title} - Not found`)
    }
  }
  
  // Save updated catalog
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
  
  const totalWithPosters = catalog.filter(m => m.poster).length
  const totalAdded = archiveFound + tvmazeFound + tmdbFound
  
  console.log(`\n✨ Done!`)
  console.log(`📊 Added ${totalAdded} new posters (Archive: ${archiveFound}, TVMaze: ${tvmazeFound}, TMDB: ${tmdbFound})`)
  console.log(`🎨 Total movies with posters: ${totalWithPosters}/${catalog.length}`)
  console.log(`📁 Catalog updated\n`)
}

// Run
main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
