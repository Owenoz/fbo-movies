// Merge old catalog (with posters) + new catalog (497 movies)
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const oldCatalog = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/narabox_catalog.json'), 'utf-8'))
  const newCatalog = JSON.parse(fs.readFileSync('/tmp/new_catalog.json', 'utf-8'))
  
  console.log(`📊 Old catalog: ${oldCatalog.length} movies`)
  console.log(`📊 New catalog: ${newCatalog.length} movies\n`)
  
  // Create a map of old movies by slug for quick lookup
  const oldMap = new Map()
  oldCatalog.forEach(m => {
    if (m.poster) {
      oldMap.set(m.slug, m.poster)
    }
  })
  
  console.log(`📸 Old catalog has ${oldMap.size} posters\n`)
  
  // Update new catalog with posters from old
  let matched = 0
  let missing = 0
  
  newCatalog.forEach(movie => {
    if (oldMap.has(movie.slug)) {
      movie.poster = oldMap.get(movie.slug)
      matched++
    } else if (!movie.poster) {
      missing++
    }
  })
  
  console.log(`✅ Matched ${matched} posters from old catalog`)
  console.log(`❌ Missing ${missing} posters for new movies\n`)
  
  // Save merged catalog
  fs.writeFileSync(
    path.join(__dirname, '../public/narabox_catalog.json'),
    JSON.stringify(newCatalog, null, 2)
  )
  
  console.log(`💾 Saved ${newCatalog.length} movies to catalog`)
  console.log(`📸 ${matched} movies have posters`)
  console.log(`🎬 ${missing} movies need posters (will show gradients)`)
}

main().catch(console.error)
