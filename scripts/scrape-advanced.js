#!/usr/bin/env node

/**
 * Advanced Ugandan VJ Movie Scraper
 * Uses axios + cheerio for better HTML parsing
 */

const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

// TMDB API Key
const TMDB_API_KEY = '577187c381c6bd81a2e6656d79af8947'

// Sites configuration
const SITES = [
  {
    name: 'TulaWatch',
    url: 'https://tulawatch.com',
    moviePage: 'https://tulawatch.com',
    selectors: {
      container: ['.movie-item', '.item', 'article', '.col-md-3', '.col-sm-6'],
      title: ['h2', 'h3', 'h4', 'h5', '.title', 'a'],
      link: ['a'],
      vj: ['.vj', '.translator', 'span'],
      image: ['img'],
      description: ['p', '.description', '.overview']
    }
  },
  {
    name: 'JTZ MAG',
    url: 'https://jtzmag.com',
    moviePage: 'https://jtzmag.com/movies',
    selectors: {
      container: ['.movie', '.film', 'article', '.post'],
      title: ['h2', 'h3', 'a'],
      link: ['a'],
      vj: ['.vj', 'span'],
      image: ['img'],
      description: ['p']
    }
  },
  {
    name: 'Ugaflix',
    url: 'https://ugaflix.com',
    moviePage: 'https://ugaflix.com/movies',
    selectors: {
      container: ['.movie', 'article', '.post'],
      title: ['h2', 'h3', 'a'],
      link: ['a'],
      vj: ['span'],
      image: ['img'],
      description: ['p']
    }
  }
]

// VJ names to detect
const VJ_NAMES = [
  'VJ Junior', 'VJ Jingo', 'VJ Ice P', 'VJ Kevo',
  'VJ Emmy', 'VJ Mark', 'VJ Neil', 'VJ IVO',
  'VJ Ashim J', 'VJ Banks', 'VJ KS', 'VJ Ivo',
  'VJ Ice'
]

// Extract VJ from text
function extractVJ(text) {
  const textLower = text.toLowerCase()
  for (const vj of VJ_NAMES) {
    if (textLower.includes(vj.toLowerCase())) {
      return vj
    }
  }
  return 'Unknown VJ'
}

// Create slug
function makeSlug(title, vj) {
  const slug = `${title} ${vj}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return slug
}

// Fetch TMDB poster
async function fetchTMDBPoster(title) {
  try {
    const cleanTitle = title
      .replace(/\s*-?\s*vj\s+\w+.*$/i, '')
      .replace(/\s+part\s+\d+/i, '')
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s+-\s+.*$/i, '')
      .trim()
    
    if (!cleanTitle || cleanTitle.length < 2) return null
    
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}`
    const response = await axios.get(searchUrl, { timeout: 5000 })
    
    if (response.data.results && response.data.results.length > 0) {
      const movie = response.data.results[0]
      if (movie.poster_path) {
        return `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

// Scrape a site
async function scrapeSite(siteConfig) {
  console.log(`\n📡 Scraping ${siteConfig.name}...`)
  const movies = []
  
  try {
    // Fetch HTML
    const response = await axios.get(siteConfig.moviePage, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    })
    
    const $ = cheerio.load(response.data)
    
    // Try each container selector
    let containers = $()
    for (const selector of siteConfig.selectors.container) {
      containers = $(selector)
      if (containers.length > 0) {
        console.log(`   Found ${containers.length} items with selector: ${selector}`)
        break
      }
    }
    
    if (containers.length === 0) {
      console.log('   ⚠️  No movie containers found')
      return movies
    }
    
    // Process each container
    containers.each((i, elem) => {
      if (i >= 50) return false // Limit to 50 movies per site
      
      try {
        const $elem = $(elem)
        
        // Extract title
        let title = ''
        for (const selector of siteConfig.selectors.title) {
          const titleElem = $elem.find(selector).first()
          if (titleElem.length > 0) {
            title = titleElem.text().trim()
            if (title.length > 3) break
          }
        }
        
        if (!title || title.length < 3 || title.length > 150) return
        
        // Extract URL
        let url = siteConfig.url
        const linkElem = $elem.find('a').first()
        if (linkElem.length > 0) {
          const href = linkElem.attr('href')
          if (href) {
            url = href.startsWith('http') ? href : siteConfig.url + href
          }
        }
        
        // Extract VJ
        const containerText = $elem.text()
        const vj = extractVJ(containerText)
        
        // Extract poster
        let poster = null
        const imgElem = $elem.find('img').first()
        if (imgElem.length > 0) {
          const src = imgElem.attr('src') || imgElem.attr('data-src') || imgElem.attr('data-lazy')
          if (src && src.startsWith('http')) {
            poster = src
          }
        }
        
        // Extract description
        let overview = null
        for (const selector of siteConfig.selectors.description) {
          const descElem = $elem.find(selector).first()
          if (descElem.length > 0) {
            overview = descElem.text().trim()
            if (overview.length > 20) break
          }
        }
        
        movies.push({
          title,
          vj,
          slug: makeSlug(title, vj),
          url,
          poster,
          overview,
          source: siteConfig.name
        })
        
      } catch (err) {
        // Skip this item
      }
    })
    
    console.log(`   ✅ Extracted ${movies.length} movies`)
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  return movies
}

// Main function
async function main() {
  console.log('🎬 Advanced Ugandan VJ Movie Scraper\n')
  console.log('Using: axios + cheerio for robust HTML parsing\n')
  
  let allMovies = []
  
  // Scrape all sites
  for (const site of SITES) {
    const movies = await scrapeSite(site)
    allMovies = allMovies.concat(movies)
    
    // Wait between sites
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Remove duplicates
  const seenTitles = new Set()
  const uniqueMovies = []
  
  for (const movie of allMovies) {
    const titleLower = movie.title.toLowerCase()
    if (!seenTitles.has(titleLower)) {
      seenTitles.add(titleLower)
      uniqueMovies.push(movie)
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total scraped: ${allMovies.length}`)
  console.log(`   Unique movies: ${uniqueMovies.length}`)
  
  // Add TMDB posters for movies without them
  console.log(`\n🎨 Fetching TMDB posters...`)
  let postersAdded = 0
  
  for (let i = 0; i < Math.min(30, uniqueMovies.length); i++) {
    const movie = uniqueMovies[i]
    
    if (!movie.poster) {
      const poster = await fetchTMDBPoster(movie.title)
      if (poster) {
        movie.poster = poster
        postersAdded++
        console.log(`   ✅ [${i + 1}] ${movie.title}`)
      } else {
        console.log(`   ⏭️  [${i + 1}] ${movie.title}`)
      }
      
      // Rate limiting
      if (i % 5 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }
  }
  
  console.log(`   Added ${postersAdded} TMDB posters`)
  
  // Save to files
  const naraPath = path.join(__dirname, '../public/narabox_catalog.json')
  fs.writeFileSync(naraPath, JSON.stringify(uniqueMovies, null, 2))
  console.log(`\n✅ Saved ${uniqueMovies.length} movies to narabox_catalog.json`)
  
  const kibandaPath = path.join(__dirname, '../public/kibanda_catalog.json')
  fs.writeFileSync(kibandaPath, JSON.stringify([], null, 2))
  console.log('✅ Created empty kibanda_catalog.json')
  
  console.log(`\n🎉 Scraping complete!`)
  console.log(`   Movies with posters: ${uniqueMovies.filter(m => m.poster).length}/${uniqueMovies.length}`)
  console.log(`   Movies with overview: ${uniqueMovies.filter(m => m.overview).length}/${uniqueMovies.length}\n`)
}

// Run
main().catch(err => {
  console.error('❌ Fatal error:', err.message)
  process.exit(1)
})
