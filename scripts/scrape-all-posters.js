#!/usr/bin/env node

/**
 * Aggressive Multi-Source Poster Scraper
 * Gets as many posters as possible from ALL sources
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')

// TMDB API Key
const TMDB_API_KEY = '577187c381c6bd81a2e6656d79af8947'

// Search Internet Archive
async function searchArchive(title) {
  try {
    const cleanTitle = title.replace(/\s*-?\s*vj\s+\w+.*$/i, '').replace(/\s+part\s+\d+/i, '').trim()
    if (!cleanTitle || cleanTitle.length < 3) return null
    
    const query = `(${cleanTitle} poster) AND mediatype:image`
    const response = await axios.get('https://archive.org/advancedsearch.php', {
      params: { q: query, fl: ['identifier', 'format'], rows: 3, output: 'json' },
      timeout: 6000
    })
    
    if (response.data?.response?.docs) {
      for (const doc of response.data.response.docs) {
        const formats = doc.format || []
        if (formats.some(f => /jpe?g|png/i.test(f))) {
          return `https://archive.org/download/${doc.identifier}/${doc.identifier}.jpg`
        }
      }
    }
    return null
  } catch { return null }
}

// Search TVMaze
async function searchTVMaze(title) {
  try {
    const cleanTitle = title.replace(/\s*-?\s*vj\s+\w+.*$/i, '').replace(/\s+part\s+\d+/i, '').trim()
    if (!cleanTitle || cleanTitle.length < 2) return null
    
    const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(cleanTitle)}`, { timeout: 5000 })
    if (response.data?.[0]?.show?.image?.original) {
      return response.data[0].show.image.original
    }
    return null
  } catch { return null }
}

// Search TMDB
async function searchTMDB(title) {
  try {
    const cleanTitle = title.replace(/\s*-?\s*vj\s+\w+.*$/i, '').replace(/\s+part\s+\d+/i, '').trim()
    if (!cleanTitle || cleanTitle.length < 2) return null
    
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}`, { timeout: 5000 })
    if (response.data.results?.[0]?.poster_path) {
      return `https://image.tmdb.org/t/p/w500${response.data.results[0].poster_path}`
    }
    return null
  } catch { return null }
}

// Main function - process ALL movies
async function main() {
  console.log('🎬 AGGRESSIVE Poster Scraper - Getting ALL Posters!\n')
  
  const catalogPath = path.join(__dirname, '../public/narabox_catalog.json')
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
  
  const moviesWithoutPosters = catalog.filter(m => !m.poster)
  console.log(`📊 Total movies: ${catalog.length}`)
  console.log(`🎨 Movies without posters: ${moviesWithoutPosters.length}`)
  console.log(`\n🔥 Processing ALL ${moviesWithoutPosters.length} movies!\n`)
  
  let archiveFound = 0, tvmazeFound = 0, tmdbFound = 0
  
  for (let i = 0; i < moviesWithoutPosters.length; i++) {
    const movie = moviesWithoutPosters[i]
    const index = catalog.findIndex(m => m.slug === movie.slug)
    if (index === -1) continue
    
    // Progress update every 10 movies
    if (i > 0 && i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log(`   [${i}/${moviesWithoutPosters.length}] Archive: ${archiveFound}, TVMaze: ${tvmazeFound}, TMDB: ${tmdbFound}`)
      
      // Save progress every 50 movies
      if (i % 50 === 0) {
        fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
        console.log(`   💾 Progress saved!`)
      }
    }
    
    // Try all 3 sources
    let poster = await searchArchive(movie.title)
    let source = 'Archive'
    
    if (!poster) {
      poster = await searchTVMaze(movie.title)
      source = 'TVMaze'
    }
    
    if (!poster) {
      poster = await searchTMDB(movie.title)
      source = 'TMDB'
    }
    
    if (poster) {
      catalog[index].poster = poster
      if (source === 'Archive') archiveFound++
      else if (source === 'TVMaze') tvmazeFound++
      else tmdbFound++
      console.log(`✅ [${i + 1}] ${movie.title} - ${source}`)
    }
  }
  
  // Final save
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
  
  const totalWithPosters = catalog.filter(m => m.poster).length
  const totalAdded = archiveFound + tvmazeFound + tmdbFound
  
  console.log(`\n✨ COMPLETE!`)
  console.log(`📊 Added ${totalAdded} new posters`)
  console.log(`   Archive: ${archiveFound} | TVMaze: ${tvmazeFound} | TMDB: ${tmdbFound}`)
  console.log(`🎨 Total: ${totalWithPosters}/${catalog.length} movies now have posters (${Math.round(totalWithPosters/catalog.length*100)}%)`)
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
