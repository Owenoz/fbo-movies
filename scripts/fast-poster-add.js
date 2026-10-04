#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const https = require('https')

const TMDB_KEYS = [
  '577187c381c6bd81a2e6656d79af8947',
  'e9e9d8da18ae29fc430845952232787c',
  '1e0c70557163a11c8478542e9f97e013'
]

let keyIndex = 0

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { resolve(null) }
      })
    }).on('error', reject)
  })
}

async function getPoster(title) {
  const clean = title.replace(/\s*-?\s*VJ\s+\w+.*$/i, '').trim()
  const key = TMDB_KEYS[keyIndex++ % TMDB_KEYS.length]
  
  try {
    const data = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${key}&query=${encodeURIComponent(clean)}`)
    if (data?.results?.[0]?.poster_path) {
      return `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`
    }
  } catch (e) {}
  return null
}

async function main() {
  console.log('⚡ Fast Poster Adder\n')
  
  const catalogPath = path.join(__dirname, '../public/narabox_catalog.json')
  const catalog = JSON.parse(fs.readFileSync(catalogPath))
  
  const without = catalog.filter(m => !m.poster)
  console.log(`Processing ${Math.min(30, without.length)} movies...\n`)
  
  let added = 0
  for (let i = 0; i < Math.min(30, without.length); i++) {
    const movie = without[i]
    process.stdout.write(`${i+1}. ${movie.title.substring(0,40)}... `)
    
    const poster = await getPoster(movie.title)
    if (poster) {
      movie.poster = poster
      added++
      console.log('✅')
    } else {
      console.log('❌')
    }
    
    await new Promise(r => setTimeout(r, 300))
  }
  
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
  
  const newTotal = catalog.filter(m => m.poster).length
  console.log(`\n✨ Added ${added} posters!`)
  console.log(`📊 Total: ${newTotal}/${catalog.length} (${Math.round(newTotal/catalog.length*100)}%)\n`)
}

main()
