#!/usr/bin/env node

/**
 * Quick Poster Batch - Process 100 movies fast
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')

const TMDB_API_KEY = '577187c381c6bd81a2e6656d79af8947'

async function searchTMDB(title) {
  try {
    const clean = title.replace(/\s*-?\s*vj\s+\w+.*$/i, '').replace(/\s+part\s+\d+/i, '').trim()
    if (!clean || clean.length < 2) return null
    
    const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(clean)}`, { timeout: 4000 })
    return res.data.results?.[0]?.poster_path ? `https://image.tmdb.org/t/p/w500${res.data.results[0].poster_path}` : null
  } catch { return null }
}

async function searchTVMaze(title) {
  try {
    const clean = title.replace(/\s*-?\s*vj\s+\w+.*$/i, '').trim()
    if (!clean || clean.length < 2) return null
    
    const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(clean)}`, { timeout: 4000 })
    return res.data?.[0]?.show?.image?.original || null
  } catch { return null }
}

async function main() {
  console.log('🎬 Quick Poster Batch (100 movies)\n')
  
  const catalogPath = path.join(__dirname, '../public/narabox_catalog.json')
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
  
  const without = catalog.filter(m => !m.poster).slice(0, 100)
  console.log(`📊 Processing ${without.length} movies\n`)
  
  let found = 0
  
  for (let i = 0; i < without.length; i++) {
    const movie = without[i]
    const idx = catalog.findIndex(m => m.slug === movie.slug)
    if (idx === -1) continue
    
    if (i % 10 === 0 && i > 0) {
      console.log(`   [${i}/${without.length}] Found: ${found}`)
      await new Promise(r => setTimeout(r, 1000))
    }
    
    let poster = await searchTMDB(movie.title)
    if (!poster) poster = await searchTVMaze(movie.title)
    
    if (poster) {
      catalog[idx].poster = poster
      found++
      console.log(`✅ [${i + 1}] ${movie.title}`)
    }
  }
  
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
  
  const total = catalog.filter(m => m.poster).length
  console.log(`\n✨ Done! Added ${found} posters`)
  console.log(`🎨 Total: ${total}/${catalog.length} (${Math.round(total/catalog.length*100)}%)\n`)
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
