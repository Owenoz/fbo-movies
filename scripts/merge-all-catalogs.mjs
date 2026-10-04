#!/usr/bin/env node

/**
 * Merge All Movie Catalogs
 * Combines NaraBox, Movies.ug, Unruly, Kulutimbe
 * Removes duplicates, adds TMDB posters for missing
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔄 Merging All Movie Catalogs\n')

// Load all catalogs
const loadCatalog = (filename) => {
  const filepath = path.join(__dirname, `../public/${filename}`)
  return fs.existsSync(filepath) ? JSON.parse(fs.readFileSync(filepath)) : []
}

const narabox = loadCatalog('narabox_catalog_backup.json') // Use backup to avoid overwriting
const moviesug = loadCatalog('moviesug_catalog.json')
const unruly = loadCatalog('unruly_catalog.json')
const kulutimbe = loadCatalog('kulutimbe_catalog.json')
const unseenAfrica = loadCatalog('unseen_africa_catalog.json')
const byadala = loadCatalog('byadala_catalog.json')
const pearlMovies = loadCatalog('pearl_movies_tv_catalog.json')
const kibandaNew = loadCatalog('kibanda_catalog.json')

console.log('📊 Individual Catalogs:')
console.log(`  NaraBox: ${narabox.length} movies, ${narabox.filter(m => m.poster).length} posters`)
console.log(`  Movies.ug: ${moviesug.length} movies, ${moviesug.filter(m => m.poster).length} posters`)
console.log(`  Unruly: ${unruly.length} movies, ${unruly.filter(m => m.poster).length} posters`)
console.log(`  Kulutimbe: ${kulutimbe.length} movies, ${kulutimbe.filter(m => m.poster).length} posters`)
console.log(`  Unseen Africa: ${unseenAfrica.length} movies, ${unseenAfrica.filter(m => m.poster).length} posters`)
console.log(`  Byadala: ${byadala.length} movies, ${byadala.filter(m => m.poster).length} posters`)
console.log(`  Pearl Movies TV: ${pearlMovies.length} movies, ${pearlMovies.filter(m => m.poster).length} posters`)
console.log(`  Kibanda: ${kibandaNew.length} movies, ${kibandaNew.filter(m => m.poster).length} posters`)
console.log()

// Combine all (remove source labels, unified as "Gen Z Corner")
const all = [
  ...narabox.map(m => ({ ...m, source: 'Gen Z Corner' })),
  ...moviesug.map(m => ({ ...m, source: 'Gen Z Corner' })),
  ...unruly.map(m => ({ ...m, source: 'Gen Z Corner' })),
  ...kulutimbe.map(m => ({ ...m, source: 'Gen Z Corner' })),
  ...unseenAfrica.map(m => ({ ...m, source: 'Gen Z Corner' })),
  ...byadala.map(m => ({ ...m, source: 'Gen Z Corner' })),
  ...pearlMovies.map(m => ({ ...m, source: 'Gen Z Corner' })),
  ...kibandaNew.map(m => ({ ...m, source: 'Gen Z Corner' }))
]

console.log(`📦 Total before deduplication: ${all.length} movies\n`)

// Remove duplicates (case-insensitive title matching)
const seen = new Map()
const unique = []

for (const movie of all) {
  const key = movie.title.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
  
  if (!seen.has(key)) {
    seen.set(key, movie)
    unique.push(movie)
  } else {
    // Keep the one with poster if available
    const existing = seen.get(key)
    if (movie.poster && !existing.poster) {
      const index = unique.indexOf(existing)
      unique[index] = movie
      seen.set(key, movie)
    }
  }
}

console.log(`✅ After deduplication: ${unique.length} unique movies`)
console.log(`🎨 Movies with posters: ${unique.filter(m => m.poster).length}`)
console.log(`📊 Poster coverage: ${Math.round(unique.filter(m => m.poster).length / unique.length * 100)}%\n`)

// Sort by addedAt (newest first) or title
unique.sort((a, b) => {
  // First priority: Has poster
  const aPoster = !!a.poster
  const bPoster = !!b.poster
  if (aPoster && !bPoster) return -1
  if (!aPoster && bPoster) return 1
  
  // Second priority: Newest first (by addedAt)
  if (b.addedAt && a.addedAt) return b.addedAt - a.addedAt
  
  // Fallback: alphabetical
  return a.title.localeCompare(b.title)
})

// Save merged catalog
const outputPath = path.join(__dirname, '../public/narabox_catalog.json')
fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2))

console.log(`💾 Saved merged catalog to: ${outputPath}`)
console.log()
console.log('📈 Final Stats:')
console.log(`  Total movies: ${unique.length}`)
console.log(`  With posters: ${unique.filter(m => m.poster).length} (${Math.round(unique.filter(m => m.poster).length / unique.length * 100)}%)`)
console.log(`  Without posters: ${unique.filter(m => !m.poster).length}`)
console.log()

// Show source breakdown
const sourceCount = {}
unique.forEach(m => {
  const src = m.source || 'Unknown'
  sourceCount[src] = (sourceCount[src] || 0) + 1
})

console.log('📚 Movies by Source:')
Object.entries(sourceCount).sort((a, b) => b[1] - a[1]).forEach(([source, count]) => {
  console.log(`  ${source}: ${count}`)
})

console.log('\n✨ Done! Your app now has', unique.length, 'movies!\n')
