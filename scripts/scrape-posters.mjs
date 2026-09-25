// Scrape poster URLs directly from NaraBox movie pages
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function scrapePoster(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    
    const html = await res.text()
    
    // Look for poster URL in HTML (og:image or similar)
    const ogImageMatch = html.match(/property="og:image"\s+content="([^"]+)"/)
    if (ogImageMatch) {
      return ogImageMatch[1]
    }
    
    // Look for poster in JSON-LD
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/s)
    if (jsonLdMatch) {
      const data = JSON.parse(jsonLdMatch[1])
      if (data.image) return data.image
    }
    
    // Look for img with poster class
    const posterMatch = html.match(/<img[^>]+class="[^"]*poster[^"]*"[^>]+src="([^"]+)"/)
    if (posterMatch) {
      return posterMatch[1]
    }
    
  } catch (err) {
    console.error(`  Error: ${err.message}`)
  }
  return null
}

async function main() {
  const catalogPath = path.join(__dirname, '../public/narabox_catalog.json')
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'))
  
  const missing = catalog.filter(m => !m.poster)
  console.log(`\n🎬 Found ${missing.length} movies without posters\n`)
  
  let updated = 0
  
  for (let i = 0; i < missing.length; i++) {
    const movie = missing[i]
    console.log(`[${i+1}/${missing.length}] ${movie.title}`)
    console.log(`  URL: ${movie.url}`)
    
    const poster = await scrapePoster(movie.url)
    if (poster) {
      movie.poster = poster
      updated++
      console.log(`  ✓ Found: ${poster}\n`)
    } else {
      console.log(`  ✗ No poster found\n`)
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Save every 5 movies
    if ((i + 1) % 5 === 0) {
      fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
      console.log(`💾 Progress saved: ${updated} posters added\n`)
    }
  }
  
  // Final save
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
  
  console.log(`\n✅ COMPLETE!`)
  console.log(`   Added ${updated} posters`)
  console.log(`   Failed: ${missing.length - updated} movies\n`)
}

main().catch(console.error)
