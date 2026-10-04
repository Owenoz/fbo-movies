#!/usr/bin/env node

/**
 * Complete Ugandan VJ Sites Scraper
 * Scrapes from movies.ug, unrulymovies.com, kulutimbe.com - sites with posters!
 */

const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

// Sites that have movies WITH posters
const SITES = [
  {
    name: 'Movies.ug',
    url: 'https://movies.ug',
    mainPage: 'https://movies.ug'
  },
  {
    name: 'Unruly Movies',
    url: 'https://unrulymovies.com',
    mainPage: 'https://unrulymovies.com'
  },
  {
    name: 'Kulutimbe',
    url: 'https://kulutimbe.com',
    mainPage: 'https://kulutimbe.com'
  }
]

// VJ detection
const VJS = [
  'VJ Junior', 'VJ Jingo', 'VJ Ice P', 'VJ Kevo',
  'VJ Emmy', 'VJ Mark', 'VJ Neil', 'VJ IVO', 'VJ Ivo',
  'VJ Ashim J', 'VJ Banks', 'VJ KS', 'VJ Ice', 'VJ Emmy'
]

function extractVJ(text) {
  const textLower = text.toLowerCase()
  for (const vj of VJS) {
    if (textLower.includes(vj.toLowerCase())) {
      return vj
    }
  }
  return 'VJ Junior' // Default
}

function makeSlug(title, vj) {
  return `${title} ${vj}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Scrape movies.ug
async function scrapeMoviesUg() {
  console.log('\n📡 Scraping Movies.ug...')
  const movies = []
  
  try {
    const response = await axios.get('https://movies.ug', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    })
    
    const $ = cheerio.load(response.data)
    
    // Look for movie cards/items
    $('a[href*="/movie/"], div[class*="movie"], div[class*="card"]').each((i, elem) => {
      if (i >= 100) return false
      
      try {
        const $elem = $(elem)
        const $parent = $elem.closest('div')
        
        // Get title
        let title = $elem.find('h1, h2, h3, h4, h5, .title').text().trim()
        if (!title) title = $elem.attr('title') || $elem.text().trim()
        
        // Clean title
        title = title.split('\n')[0].trim()
        if (!title || title.length < 3 || title.length > 150) return
        
        // Get URL
        let url = $elem.attr('href') || $parent.find('a').attr('href')
        if (url && !url.startsWith('http')) {
          url = 'https://movies.ug' + url
        }
        if (!url) return
        
        // Get poster
        const $img = $elem.find('img').first()
        let poster = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy')
        if (poster && !poster.startsWith('http')) {
          poster = poster.startsWith('/') ? 'https://movies.ug' + poster : 'https://movies.ug/' + poster
        }
        
        // Get VJ
        const fullText = $parent.text() + ' ' + title
        const vj = extractVJ(fullText)
        
        // Get overview
        const overview = $parent.find('p, .description, .overview').first().text().trim() || null
        
        movies.push({
          title,
          vj,
          slug: makeSlug(title, vj),
          url,
          poster,
          overview,
          source: 'Movies.ug',
          addedAt: Date.now()
        })
      } catch (err) {
        // Skip
      }
    })
    
    console.log(`   ✅ Found ${movies.length} movies`)
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  return movies
}

// Scrape unrulymovies.com
async function scrapeUnrulyMovies() {
  console.log('\n📡 Scraping Unruly Movies...')
  const movies = []
  
  try {
    const response = await axios.get('https://unrulymovies.com', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    })
    
    const $ = cheerio.load(response.data)
    
    // Look for movie elements
    $('a[href*="/movie/"], a[href*="/watch/"], div[class*="movie"]').each((i, elem) => {
      if (i >= 100) return false
      
      try {
        const $elem = $(elem)
        const $container = $elem.closest('div').parent()
        
        // Get title
        let title = $elem.find('h1, h2, h3, h4, .title').text().trim()
        if (!title) title = $elem.text().trim()
        
        title = title.split('\n')[0].trim()
        if (!title || title.length < 3 || title.length > 150) return
        
        // Get URL
        let url = $elem.attr('href')
        if (url && !url.startsWith('http')) {
          url = 'https://unrulymovies.com' + url
        }
        if (!url) return
        
        // Get poster
        const $img = $elem.find('img').first()
        let poster = $img.attr('src') || $img.attr('data-src')
        if (poster && !poster.startsWith('http')) {
          poster = poster.startsWith('/') ? 'https://unrulymovies.com' + poster : 'https://unrulymovies.com/' + poster
        }
        
        // Get VJ
        const fullText = $container.text() + ' ' + title
        const vj = extractVJ(fullText)
        
        // Get overview
        const overview = $container.find('p').first().text().trim() || null
        
        movies.push({
          title,
          vj,
          slug: makeSlug(title, vj),
          url,
          poster,
          overview,
          source: 'Unruly Movies',
          addedAt: Date.now()
        })
      } catch (err) {
        // Skip
      }
    })
    
    console.log(`   ✅ Found ${movies.length} movies`)
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  return movies
}

// Scrape kulutimbe.com
async function scrapeKulutimbe() {
  console.log('\n📡 Scraping Kulutimbe...')
  const movies = []
  
  try {
    const response = await axios.get('https://kulutimbe.com', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    })
    
    const $ = cheerio.load(response.data)
    
    // Look for movie links
    $('a[href*="/movie/"], a[href*="/watch/"]').each((i, elem) => {
      if (i >= 100) return false
      
      try {
        const $elem = $(elem)
        
        // Get title
        let title = $elem.text().trim() || $elem.attr('title')
        if (!title || title.length < 3) return
        
        // Get URL
        let url = $elem.attr('href')
        if (url && !url.startsWith('http')) {
          url = 'https://kulutimbe.com' + url
        }
        if (!url) return
        
        // Get poster
        const $img = $elem.find('img')
        let poster = $img.attr('src') || $img.attr('data-src')
        if (poster && !poster.startsWith('http')) {
          poster = poster.startsWith('/') ? 'https://kulutimbe.com' + poster : 'https://kulutimbe.com/' + poster
        }
        
        // Get VJ
        const vj = extractVJ(title + ' ' + $elem.parent().text())
        
        movies.push({
          title,
          vj,
          slug: makeSlug(title, vj),
          url,
          poster,
          overview: null,
          source: 'Kulutimbe',
          addedAt: Date.now()
        })
      } catch (err) {
        // Skip
      }
    })
    
    console.log(`   ✅ Found ${movies.length} movies`)
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  return movies
}

// Main function
async function main() {
  console.log('🎬 Ugandan VJ Sites Scraper (WITH POSTERS!)\n')
  
  let allMovies = []
  
  // Scrape all sites
  const moviesUg = await scrapeMoviesUg()
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const unruly = await scrapeUnrulyMovies()
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const kulutimbe = await scrapeKulutimbe()
  
  allMovies = [...moviesUg, ...unruly, ...kulutimbe]
  
  // Remove duplicates
  const seenTitles = new Set()
  const uniqueMovies = []
  
  for (const movie of allMovies) {
    const titleKey = movie.title.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey)
      uniqueMovies.push(movie)
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total scraped: ${allMovies.length}`)
  console.log(`   Unique movies: ${uniqueMovies.length}`)
  console.log(`   Movies with posters: ${uniqueMovies.filter(m => m.poster).length}`)
  
  // Load existing catalog
  const catalogPath = path.join(__dirname, '../public/narabox_catalog.json')
  let existingCatalog = []
  
  if (fs.existsSync(catalogPath)) {
    existingCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
    console.log(`\n📚 Existing catalog: ${existingCatalog.length} movies`)
  }
  
  // Merge with existing
  const existingSlugs = new Set(existingCatalog.map(m => m.slug))
  let addedCount = 0
  
  for (const movie of uniqueMovies) {
    if (!existingSlugs.has(movie.slug)) {
      existingCatalog.unshift(movie) // Add to beginning
      addedCount++
    }
  }
  
  console.log(`\n✅ Added ${addedCount} NEW movies`)
  console.log(`📊 Total catalog now: ${existingCatalog.length} movies`)
  
  // Save
  fs.writeFileSync(catalogPath, JSON.stringify(existingCatalog, null, 2))
  console.log(`\n💾 Catalog saved!`)
  
  // Stats
  const withPosters = existingCatalog.filter(m => m.poster).length
  console.log(`\n🎨 ${withPosters}/${existingCatalog.length} movies have posters (${Math.round(withPosters/existingCatalog.length*100)}%)\n`)
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
