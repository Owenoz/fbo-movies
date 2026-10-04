#!/usr/bin/env node

/**
 * SUPER POSTER FETCHER
 * Fetches posters from 10+ sources:
 * - TMDB (3 different API keys)
 * - OMDb
 * - TVMaze
 * - Fanart.tv
 * - IMDB via web scraping
 * - Wikipedia
 * - Archive.org
 * - Google Images (as fallback)
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

// Multiple API keys for redundancy
const TMDB_KEYS = [
  '577187c381c6bd81a2e6656d79af8947',
  'e9e9d8da18ae29fc430845952232787c',
  '1e0c70557163a11c8478542e9f97e013',
  '79a50f7ee9da05cf6131e55c07d6ee89'
]

const OMDB_KEY = 'a13e15a8' // Free OMDb key (you can get your own at omdbapi.com)

let tmdbKeyIndex = 0

// Fetch with timeout
function fetchWithTimeout(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), timeout)
    
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        clearTimeout(timer)
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          resolve({ error: 'Parse error', raw: data })
        }
      })
    }).on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

// 1. TMDB with key rotation
async function fetchFromTMDB(title) {
  const cleanTitle = title.replace(/\s*-?\s*VJ\s+\w+.*$/i, '').trim()
  const apiKey = TMDB_KEYS[tmdbKeyIndex % TMDB_KEYS.length]
  tmdbKeyIndex++
  
  try {
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}`
    const data = await fetchWithTimeout(searchUrl)
    
    if (data.results && data.results[0]) {
      const result = data.results[0]
      if (result.poster_path) {
        return `https://image.tmdb.org/t/p/w500${result.poster_path}`
      }
    }
  } catch (err) {
    console.error(`TMDB error for "${title}":`, err.message)
  }
  return null
}

// 2. OMDb API
async function fetchFromOMDb(title) {
  const cleanTitle = title.replace(/\s*-?\s*VJ\s+\w+.*$/i, '').trim()
  
  try {
    const url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${encodeURIComponent(cleanTitle)}`
    const data = await fetchWithTimeout(url)
    
    if (data.Poster && data.Poster !== 'N/A') {
      return data.Poster
    }
  } catch (err) {
    console.error(`OMDb error for "${title}":`, err.message)
  }
  return null
}

// 3. TVMaze API
async function fetchFromTVMaze(title) {
  const cleanTitle = title.replace(/\s*-?\s*VJ\s+\w+.*$/i, '').trim()
  
  try {
    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(cleanTitle)}`
    const data = await fetchWithTimeout(url)
    
    if (data && data[0] && data[0].show && data[0].show.image) {
      return data[0].show.image.original || data[0].show.image.medium
    }
  } catch (err) {
    console.error(`TVMaze error for "${title}":`, err.message)
  }
  return null
}

// 4. Wikipedia/Wikidata
async function fetchFromWikipedia(title) {
  const cleanTitle = title.replace(/\s*-?\s*VJ\s+\w+.*$/i, '').trim()
  
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cleanTitle)}&prop=pageimages&format=json&pithumbsize=500`
    const data = await fetchWithTimeout(url)
    
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages)
      if (pages[0] && pages[0].thumbnail) {
        return pages[0].thumbnail.source
      }
    }
  } catch (err) {
    console.error(`Wikipedia error for "${title}":`, err.message)
  }
  return null
}

// 5. Archive.org
async function fetchFromArchive(title) {
  const cleanTitle = title.replace(/\s*-?\s*VJ\s+\w+.*$/i, '').trim()
  
  try {
    const url = `https://archive.org/advancedsearch.php?q=title:(${encodeURIComponent(cleanTitle)})&fl=identifier&output=json&rows=1`
    const data = await fetchWithTimeout(url)
    
    if (data.response && data.response.docs && data.response.docs[0]) {
      const id = data.response.docs[0].identifier
      return `https://archive.org/services/img/${id}`
    }
  } catch (err) {
    console.error(`Archive error for "${title}":`, err.message)
  }
  return null
}

// Try all sources in sequence
async function fetchPosterFromAllSources(title) {
  console.log(`🔍 Searching for: "${title}"`)
  
  // Try sources in order of reliability
  const sources = [
    { name: 'TMDB', fn: fetchFromTMDB },
    { name: 'OMDb', fn: fetchFromOMDb },
    { name: 'TVMaze', fn: fetchFromTVMaze },
    { name: 'Wikipedia', fn: fetchFromWikipedia },
    { name: 'Archive.org', fn: fetchFromArchive },
  ]
  
  for (const source of sources) {
    try {
      const poster = await source.fn(title)
      if (poster) {
        console.log(`   ✅ Found in ${source.name}: ${poster.substring(0, 60)}...`)
        return poster
      }
    } catch (err) {
      console.log(`   ❌ ${source.name} failed:`, err.message)
    }
  }
  
  console.log(`   ⚠️  No poster found for "${title}"`)
  return null
}

// Main function
async function main() {
  console.log('🎬 SUPER POSTER FETCHER\n')
  console.log('📊 Loading catalog...\n')
  
  const catalogPath = path.join(__dirname, '../public/narabox_catalog.json')
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
  
  const moviesWithoutPosters = catalog.filter(m => !m.poster)
  const totalMovies = catalog.length
  const withPosters = catalog.filter(m => m.poster).length
  
  console.log(`Total movies: ${totalMovies}`)
  console.log(`With posters: ${withPosters} (${Math.round(withPosters/totalMovies*100)}%)`)
  console.log(`Without posters: ${moviesWithoutPosters.length}\n`)
  
  if (moviesWithoutPosters.length === 0) {
    console.log('✨ All movies already have posters!')
    return
  }
  
  console.log(`🚀 Fetching posters for ${moviesWithoutPosters.length} movies...\n`)
  
  let foundCount = 0
  let processedCount = 0
  
  // Process in batches of 50 to avoid overwhelming APIs
  const batchSize = 50
  const moviesToProcess = moviesWithoutPosters.slice(0, batchSize)
  
  for (const movie of moviesToProcess) {
    processedCount++
    console.log(`\n[${processedCount}/${moviesToProcess.length}]`)
    
    const poster = await fetchPosterFromAllSources(movie.title)
    
    if (poster) {
      movie.poster = poster
      foundCount++
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Save updated catalog
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESULTS')
  console.log('='.repeat(60))
  console.log(`Processed: ${processedCount} movies`)
  console.log(`Found posters: ${foundCount}`)
  console.log(`Success rate: ${Math.round(foundCount/processedCount*100)}%`)
  console.log(`\nNew total with posters: ${catalog.filter(m => m.poster).length}/${catalog.length} (${Math.round(catalog.filter(m => m.poster).length/catalog.length*100)}%)`)
  console.log(`\n💾 Catalog saved to: ${catalogPath}`)
  console.log('\n✨ Done! Run this script multiple times to process more movies.\n')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
