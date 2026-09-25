// Add TMDB posters to NaraBox catalog
const fs = require('fs')
const path = require('path')

const TMDB_KEY = '3e0e523aafdab0b119926238e25efc4b'

async function searchTMDB(title) {
  try {
    const cleanTitle = title
      .replace(/\s*-\s*VJ\s+\w+.*$/i, '') // Remove VJ suffix
      .replace(/Part\s+\d+$/i, '') // Remove Part 2, etc
      .trim()
    
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(cleanTitle)}`
    const res = await fetch(url)
    const data = await res.json()
    
    if (data.results && data.results[0] && data.results[0].poster_path) {
      return `https://image.tmdb.org/t/p/w342${data.results[0].poster_path}`
    }
  } catch (err) {
    console.error(`Error fetching ${title}:`, err.message)
  }
  return null
}

async function main() {
  const catalogPath = path.join(__dirname, '../public/narabox_catalog.json')
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'))
  
  console.log(`Processing ${catalog.length} movies...`)
  
  let updated = 0
  const batchSize = 5
  
  for (let i = 0; i < catalog.length; i++) {
    const movie = catalog[i]
    
    if (!movie.poster) {
      const poster = await searchTMDB(movie.title)
      if (poster) {
        movie.poster = poster
        updated++
        console.log(`✓ ${i+1}/${catalog.length} ${movie.title} → ${poster}`)
      } else {
        console.log(`✗ ${i+1}/${catalog.length} ${movie.title} - No poster found`)
      }
      
      // Rate limiting - wait between requests
      if ((i + 1) % batchSize === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }
  
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
  console.log(`\n✅ Updated ${updated} posters!`)
  console.log(`📝 Catalog saved to: ${catalogPath}`)
}

main().catch(console.error)
