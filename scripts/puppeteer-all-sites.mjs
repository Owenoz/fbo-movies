#!/usr/bin/env node

/**
 * Multi-Site Puppeteer Scraper
 * Scrapes: unseen.africa, byadala.com, pearlmoviestv.com, kawogo, yourvj, myvj
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SITES = [
  { name: 'Unseen Africa', url: 'https://unseen.africa', scrolls: 25 },
  { name: 'Byadala', url: 'https://byadala.com', scrolls: 25 },
  { name: 'Pearl Movies TV', url: 'https://pearlmoviestv.com', scrolls: 25 },
  { name: 'Kawogo', url: 'https://kawogo.com', scrolls: 25 },
  { name: 'YourVJ', url: 'https://yourvj.com', scrolls: 25 },
  { name: 'MyVJ', url: 'https://myvj.ug', scrolls: 25 },
]

async function scrapeSite(browser, site) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🎬 Scraping: ${site.name}`)
  console.log(`🌐 URL: ${site.url}`)
  console.log('='.repeat(60))
  
  try {
    const page = await browser.newPage()
    
    // Set user agent to avoid blocking
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    console.log('📡 Loading page...')
    await page.goto(site.url, { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    }).catch(async (err) => {
      console.log('⚠️  networkidle2 timeout, trying domcontentloaded...')
      await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    })
    
    console.log('📜 Scrolling to load content...')
    for (let i = 0; i < site.scrolls; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight))
      await new Promise(resolve => setTimeout(resolve, 800))
      if ((i + 1) % 5 === 0) console.log(`   Scrolled ${i + 1}/${site.scrolls} times`)
    }
    
    console.log('🔍 Extracting movie data...')
    const movies = await page.evaluate((siteName) => {
      const results = []
      
      // Try multiple selectors for movies
      const selectors = [
        'a[href*="/movie"]',
        'a[href*="/play"]',
        'a[href*="/watch"]',
        'a[href*="/video"]',
        'div[class*="movie"]',
        'div[class*="video"]',
        'div[class*="card"]',
        'div[class*="item"]',
        'article',
        '.post',
        '.entry'
      ]
      
      const movieElements = new Set()
      selectors.forEach(sel => {
        try {
          document.querySelectorAll(sel).forEach(el => movieElements.add(el))
        } catch (e) {}
      })
      
      movieElements.forEach(elem => {
        try {
          // Get title
          const titleElem = elem.querySelector('h1, h2, h3, h4, h5, h6, .title, [class*="title"], [class*="name"]')
          let title = titleElem?.textContent?.trim() || 
                      elem.getAttribute('title') || 
                      elem.getAttribute('data-title') || ''
          
          // Clean title
          title = title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
          
          if (!title || title.length < 3 || title.length > 200) return
          if (title.toLowerCase().includes('loading')) return
          if (title.toLowerCase().includes('advertisement')) return
          
          // Get URL
          const link = elem.closest('a') || elem.querySelector('a')
          let url = link?.href || ''
          if (!url || url === 'javascript:void(0)' || url === '#') return
          
          // Get poster
          const img = elem.querySelector('img')
          let poster = img?.src || 
                      img?.getAttribute('data-src') || 
                      img?.getAttribute('data-lazy') || 
                      img?.getAttribute('data-original') ||
                      img?.getAttribute('data-srcset')?.split(',')[0]?.split(' ')[0] || ''
          
          // Clean poster URL
          if (poster && poster.startsWith('//')) poster = 'https:' + poster
          if (poster && poster.includes('placeholder')) poster = ''
          if (poster && poster.includes('loading')) poster = ''
          
          // Get VJ
          const allText = elem.textContent || ''
          const vjs = ['VJ Junior', 'VJ Emmy', 'VJ Ice P', 'VJ Mark', 'VJ Neil', 'VJ IVO', 'VJ Ivo', 'VJ Kevo', 'VJ Jingo']
          let vj = 'VJ Junior'
          for (const v of vjs) {
            if (allText.toLowerCase().includes(v.toLowerCase())) {
              vj = v
              break
            }
          }
          
          // Get description
          const descElem = elem.querySelector('p, .description, .overview, .excerpt, [class*="desc"]')
          const overview = descElem?.textContent?.trim()?.substring(0, 500) || null
          
          // Get year
          const yearMatch = allText.match(/\(?(20\d{2})\)?/)
          const year = yearMatch ? yearMatch[1] : null
          
          results.push({
            title,
            vj,
            slug: `${title} ${vj}`.toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .substring(0, 100),
            url,
            poster: poster || null,
            overview,
            year,
            source: siteName,
            addedAt: Date.now()
          })
        } catch (err) {
          // Skip problematic elements
        }
      })
      
      return results
    }, site.name)
    
    await page.close()
    
    // Remove duplicates
    const seen = new Set()
    const unique = movies.filter(m => {
      const key = m.title.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    
    console.log(`✅ Found ${unique.length} unique movies`)
    console.log(`🎨 ${unique.filter(m => m.poster).length} have posters (${Math.round(unique.filter(m => m.poster).length / unique.length * 100)}%)`)
    
    return unique
    
  } catch (error) {
    console.error(`❌ Error scraping ${site.name}:`, error.message)
    return []
  }
}

async function scrapeAllSites() {
  console.log('🚀 Multi-Site Puppeteer Scraper')
  console.log(`📊 Scraping ${SITES.length} sites...\n`)
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  })
  
  const allMovies = []
  
  for (const site of SITES) {
    const movies = await scrapeSite(browser, site)
    allMovies.push(...movies)
    
    // Save individual site catalog
    const filename = site.name.toLowerCase().replace(/\s+/g, '_')
    const filepath = path.join(__dirname, `../public/${filename}_catalog.json`)
    fs.writeFileSync(filepath, JSON.stringify(movies, null, 2))
    console.log(`💾 Saved to: ${filepath}`)
  }
  
  await browser.close()
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 FINAL SUMMARY')
  console.log('='.repeat(60))
  
  // Remove duplicates across all sites
  const seen = new Map()
  const unique = []
  
  for (const movie of allMovies) {
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
  
  console.log(`\n📦 Total movies scraped: ${allMovies.length}`)
  console.log(`✅ Unique movies: ${unique.length}`)
  console.log(`🎨 With posters: ${unique.filter(m => m.poster).length} (${Math.round(unique.filter(m => m.poster).length / unique.length * 100)}%)`)
  
  // Save combined catalog
  const outputPath = path.join(__dirname, '../public/all_sites_catalog.json')
  fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2))
  console.log(`\n💾 Combined catalog saved to: ${outputPath}`)
  
  // Show breakdown by site
  console.log('\n📚 Movies by Source:')
  const sourceCount = {}
  unique.forEach(m => {
    sourceCount[m.source] = (sourceCount[m.source] || 0) + 1
  })
  Object.entries(sourceCount).sort((a, b) => b[1] - a[1]).forEach(([source, count]) => {
    console.log(`  ${source}: ${count}`)
  })
  
  console.log('\n✨ All done! Run merge-all-catalogs.mjs to combine with existing movies.\n')
}

scrapeAllSites().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
