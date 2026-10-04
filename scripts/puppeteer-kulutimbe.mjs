#!/usr/bin/env node

/**
 * Kulutimbe Puppeteer Scraper
 * Gets ALL movies with posters from kulutimbe.com
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function scrapeKulutimbe() {
  console.log('🎬 Kulutimbe Puppeteer Scraper\n')
  
  try {
    console.log('🚀 Launching browser...')
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    
    console.log('📡 Loading Kulutimbe.com...')
    await page.goto('https://kulutimbe.com', { waitUntil: 'networkidle2', timeout: 60000 })
    
    console.log('📜 Scrolling to load all movies...')
    for (let i = 0; i < 25; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight))
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(`   Scroll ${i + 1}/25`)
    }
    
    console.log('🔍 Extracting movie data...')
    const movies = await page.evaluate(() => {
      const results = []
      
      const movieElements = document.querySelectorAll(
        'a[href*="/movie"], a[href*="/watch"], div[class*="movie"], div[class*="video"], div[class*="card"], article'
      )
      
      movieElements.forEach(elem => {
        try {
          const titleElem = elem.querySelector('h1, h2, h3, h4, h5, .title, [class*="title"]')
          const title = titleElem?.textContent?.trim() || elem.getAttribute('title') || ''
          
          if (!title || title.length < 3 || title.length > 150) return
          
          const link = elem.closest('a') || elem.querySelector('a')
          const url = link?.href || ''
          if (!url) return
          
          const img = elem.querySelector('img')
          const poster = img?.src || img?.getAttribute('data-src') || img?.getAttribute('data-lazy') || ''
          
          const allText = elem.textContent || ''
          const vjs = ['VJ Junior', 'VJ Emmy', 'VJ Ice P', 'VJ Mark', 'VJ Neil', 'VJ IVO', 'VJ Ivo', 'VJ Kevo']
          let vj = 'VJ Junior'
          for (const v of vjs) {
            if (allText.toLowerCase().includes(v.toLowerCase())) {
              vj = v
              break
            }
          }
          
          const descElem = elem.querySelector('p, .description, .overview, [class*="desc"]')
          const overview = descElem?.textContent?.trim() || null
          
          results.push({
            title,
            vj,
            slug: `${title} ${vj}`.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
            url,
            poster: poster || null,
            overview,
            source: 'Kulutimbe',
            addedAt: Date.now()
          })
        } catch (err) {}
      })
      
      return results
    })
    
    await browser.close()
    
    const seen = new Set()
    const unique = movies.filter(m => {
      const key = m.title.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    
    console.log(`\n✅ Found ${unique.length} unique movies!`)
    console.log(`🎨 ${unique.filter(m => m.poster).length} have posters\n`)
    
    const outputPath = path.join(__dirname, '../public/kulutimbe_catalog.json')
    fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2))
    console.log(`💾 Saved to: ${outputPath}\n`)
    
    return unique
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

scrapeKulutimbe().then(() => {
  console.log('✨ Done!\n')
  process.exit(0)
}).catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
