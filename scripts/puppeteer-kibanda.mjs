#!/usr/bin/env node

/**
 * Kibanda Movies Puppeteer Scraper
 * Gets movies from kibandamovies.com and kibandavibes.com
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SITES = [
  { name: 'Kibanda Movies', url: 'https://kibandamovies.com', scrolls: 30 },
  { name: 'Kibanda Vibes', url: 'https://kibandavibes.com', scrolls: 30 },
]

async function scrapeSite(browser, site) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🎬 Scraping: ${site.name}`)
  console.log(`🌐 URL: ${site.url}`)
  console.log('='.repeat(60))
  
  try {
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    console.log('📡 Loading page...')
    await page.goto(site.url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    }).catch(err => {
      console.log('⚠️  Timeout, trying anyway...')
    })
    
    console.log('📜 Scrolling to load content...')
    for (let i = 0; i < site.scrolls; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight))
      await new Promise(resolve => setTimeout(resolve, 800))
      if ((i + 1) % 10 === 0) console.log(`   Scrolled ${i + 1}/${site.scrolls} times`)
    }
    
    console.log('🔍 Extracting movie data...')
    const movies = await page.evaluate(() => {
      const results = []
      const selectors = [
        'a[href*="/movie"]',
        'a[href*="/play"]',
        'a[href*="/watch"]',
        'div[class*="movie"]',
        'div[class*="video"]',
        'div[class*="item"]',
        'article',
        '.post'
      ]
      
      const movieElements = new Set()
      selectors.forEach(sel => {
        try {
          document.querySelectorAll(sel).forEach(el => movieElements.add(el))
        } catch (e) {}
      })
      
      movieElements.forEach(elem => {
        try {
          const titleElem = elem.querySelector('h1, h2, h3, h4, h5, .title, [class*="title"]')
          let title = titleElem?.textContent?.trim() || elem.getAttribute('title') || ''
          title = title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
          
          if (!title || title.length < 3 || title.length > 200) return
          if (title.toLowerCase().includes('loading')) return
          
          const link = elem.closest('a') || elem.querySelector('a')
          let url = link?.href || ''
          if (!url || url === '#') return
          
          const img = elem.querySelector('img')
          let poster = img?.src || 
                      img?.getAttribute('data-src') || 
                      img?.getAttribute('data-lazy') || ''
          
          if (poster && poster.startsWith('//')) poster = 'https:' + poster
          if (poster && (poster.includes('placeholder') || poster.includes('loading'))) poster = ''
          
          const allText = elem.textContent || ''
          const vjs = ['VJ Junior', 'VJ Emmy', 'VJ Ice P', 'VJ Mark', 'VJ Neil', 'VJ IVO', 'VJ Kevo']
          let vj = 'VJ Junior'
          for (const v of vjs) {
            if (allText.toLowerCase().includes(v.toLowerCase())) {
              vj = v
              break
            }
          }
          
          const descElem = elem.querySelector('p, .description, .excerpt')
          const overview = descElem?.textContent?.trim()?.substring(0, 500) || null
          
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
            source: 'Kibanda',
            addedAt: Date.now()
          })
        } catch (err) {}
      })
      
      return results
    })
    
    await page.close()
    
    const seen = new Set()
    const unique = movies.filter(m => {
      const key = m.title.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    
    console.log(`✅ Found ${unique.length} unique movies`)
    console.log(`🎨 ${unique.filter(m => m.poster).length} have posters`)
    
    return unique
    
  } catch (error) {
    console.error(`❌ Error scraping ${site.name}:`, error.message)
    return []
  }
}

async function scrapeKibanda() {
  console.log('🚀 Kibanda Movies Scraper\n')
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const allMovies = []
  
  for (const site of SITES) {
    const movies = await scrapeSite(browser, site)
    allMovies.push(...movies)
  }
  
  await browser.close()
  
  // Remove duplicates
  const seen = new Map()
  const unique = []
  
  for (const movie of allMovies) {
    const key = movie.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
    
    if (!seen.has(key)) {
      seen.set(key, movie)
      unique.push(movie)
    } else {
      const existing = seen.get(key)
      if (movie.poster && !existing.poster) {
        const index = unique.indexOf(existing)
        unique[index] = movie
        seen.set(key, movie)
      }
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`✅ Total unique movies: ${unique.length}`)
  console.log(`🎨 With posters: ${unique.filter(m => m.poster).length}`)
  
  const outputPath = path.join(__dirname, '../public/kibanda_catalog.json')
  fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2))
  console.log(`💾 Saved to: ${outputPath}\n`)
}

scrapeKibanda().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
