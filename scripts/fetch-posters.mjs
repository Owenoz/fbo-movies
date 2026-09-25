// Fetch TMDB posters using native fetch (ES modules)
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TMDB_KEY = '3e0e523aafdab0b119926238e25efc4b'

async function searchTMDB(title) {
  try {
    // Clean title - remove VJ suffix and extras
    let cleanTitle = title
      .replace(/\s*-?\s*VJ\s+\w+.*$/i, '') // Remove "- VJ Junior" etc
      .replace(/\s+Part\s+\d+$/i, '') // Remove "Part 2"
      .replace(/\s+Vj\s+\w+$/i, '') // Remove "Vj Junior"
      .trim()
    
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(cleanTitle)}`
    
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    
    const data = await res.json()
    
    if (data.results && data.results.length > 0) {
      const movie = data.results[0]
      if (movie.poster_path) {
        return `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      }
    }
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`)
  }
  return null
}

async function main() {
  const catalogPath = path.join(__dirname, '../public/narabox_catalog.json')
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'))
  
  console.log(`\n🎬 Processing ${catalog.length} movies...\n`)
  
  let updated = 0
  let skipped = 0
  
  for (let i = 0; i < catalog.length; i++) {
    const movie = catalog[i]
    
    // Skip if already has poster
    if (movie.poster) {
      skipped++
      continue
    }
    
    console.log(`[${i+1}/${catalog.length}] ${movie.title}`)
    const poster = await searchTMDB(movie.title)
    
    if (poster) {
      movie.poster = poster
      updated++
      console.log(`  ✓ Found: ${poster}\n`)
    } else {
      console.log(`  ✗ No poster found\n`)
    }
    
    // Rate limiting - 4 requests per second max
    await new Promise(resolve => setTimeout(resolve, 260))
    
    // Save every 20 movies
    if ((i + 1) % 20 === 0) {
      fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
      console.log(`💾 Saved progress: ${updated} posters added\n`)
    }
  }
  
  // Final save
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
  
  console.log(`\n✅ COMPLETE!`)
  console.log(`   Updated: ${updated} movies`)
  console.log(`   Skipped: ${skipped} movies (already had posters)`)
  console.log(`   Failed: ${catalog.length - updated - skipped} movies\n`)
}

main().catch(console.error)
