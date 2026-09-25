// Scrape Kibanda Vibes Blogger feed
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function fetchKibandaPage(startIndex = 1) {
  const url = `https://www.kibandavibes.com/feeds/posts/default?alt=json&start-index=${startIndex}&max-results=100`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function extractMovieData(entry) {
  try {
    const title = entry.title.$t
    const content = entry.content.$t
    const link = entry.link.find(l => l.rel === 'alternate')?.href
    
    // Extract VJ from title
    const vjMatch = title.match(/VJ\s+(\w+)/i)
    const vj = vjMatch ? `VJ ${vjMatch[1]}` : 'Unknown'
    
    // Extract MP4 URL from video tag
    const mp4Match = content.match(/<source src="([^"]+)"/)
    const mp4 = mp4Match ? mp4Match[1] : null
    
    // Extract poster from img tag
    const posterMatch = content.match(/<img[^>]+src="([^"]+)"/)
    const poster = posterMatch ? posterMatch[1] : null
    
    // Extract description
    const descMatch = content.match(/<strong>Description:<\/strong>\s*([^<]+)/)
    const overview = descMatch ? descMatch[1].trim() : ''
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/\s*-\s*vj\s+\w+\s*/gi, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    return {
      title: title.replace(/\s*-\s*VJ\s+\w+\s*$/i, '').trim(),
      vj,
      slug,
      url: link,
      mp4,
      poster,
      overview: overview || `Watch ${title} translated in Luganda on Kibanda Vibes.`
    }
  } catch (err) {
    console.error('Parse error:', err.message)
    return null
  }
}

async function main() {
  console.log('\n🎬 Scraping Kibanda Vibes...\n')
  
  const movies = []
  let startIndex = 1
  let hasMore = true
  
  while (hasMore) {
    console.log(`Fetching entries ${startIndex}...`)
    
    const data = await fetchKibandaPage(startIndex)
    const entries = data.feed.entry || []
    
    console.log(`  Found ${entries.length} entries`)
    
    entries.forEach(entry => {
      const movie = extractMovieData(entry)
      if (movie && movie.mp4) {
        movies.push(movie)
        console.log(`  ✓ ${movie.title} - ${movie.vj}`)
      }
    })
    
    startIndex += 100
    hasMore = entries.length === 100
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Save catalog
  const outputPath = path.join(__dirname, '../public/kibanda_catalog.json')
  fs.writeFileSync(outputPath, JSON.stringify(movies, null, 2))
  
  console.log(`\n✅ Scraped ${movies.length} movies from Kibanda Vibes`)
  console.log(`📝 Saved to: ${outputPath}\n`)
}

main().catch(console.error)
