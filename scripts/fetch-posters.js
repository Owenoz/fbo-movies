#!/usr/bin/env node

/**
 * Quick poster fetcher - Uses Wikipedia/IMDb/free sources
 * No API keys needed!
 */

const fs = require('fs')
const path = require('path')

// Extended poster URLs for popular movies (from Wikipedia/IMDb)
const SAMPLE_POSTERS = {
  'limitless': 'https://upload.wikimedia.org/wikipedia/en/4/4f/Limitless_Poster.jpg',
  'iron will': 'https://upload.wikimedia.org/wikipedia/en/7/70/Ironmanposter.JPG',
  'iron man': 'https://upload.wikimedia.org/wikipedia/en/7/70/Ironmanposter.JPG',
  'spider-man': 'https://upload.wikimedia.org/wikipedia/en/f/f3/Spider-Man2002Poster.jpg',
  'spider man': 'https://upload.wikimedia.org/wikipedia/en/f/f3/Spider-Man2002Poster.jpg',
  'the runner': 'https://m.media-amazon.com/images/M/MV5BNjE5NzA4MTI4NV5BMl5BanBnXkFtZTgwNzMwMTg3MjE@._V1_.jpg',
  'motor city': 'https://m.media-amazon.com/images/M/MV5BMTk0MzczOTI0M15BMl5BanBnXkFtZTgwNzY4MTI3MjE@._V1_.jpg',
  'mutiny': 'https://upload.wikimedia.org/wikipedia/en/8/8b/Mutiny_on_the_Bounty_%281962_film%29_poster.jpg',
  'home alone': 'https://upload.wikimedia.org/wikipedia/en/7/76/Home_alone_poster.jpg',
  'avatar': 'https://upload.wikimedia.org/wikipedia/en/d/d6/Avatar_poster.jpg',
  'titanic': 'https://upload.wikimedia.org/wikipedia/en/1/18/Titanic_%281997_film%29_poster.png',
  'inception': 'https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg',
  'interstellar': 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
  'joker': 'https://upload.wikimedia.org/wikipedia/en/e/e1/Joker_%282019_film%29_poster.jpg',
  'john wick': 'https://upload.wikimedia.org/wikipedia/en/9/98/John_Wick_TeaserPoster.jpg',
  'gladiator': 'https://upload.wikimedia.org/wikipedia/en/f/fb/Gladiator_%282000_film_poster%29.png',
  'the dark knight': 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg',
  'dark knight': 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg',
  'matrix': 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg',
  'fast': 'https://upload.wikimedia.org/wikipedia/en/3/3e/Fast_%26_Furious_7_poster.jpg',
  'furious': 'https://upload.wikimedia.org/wikipedia/en/3/3e/Fast_%26_Furious_7_poster.jpg',
  'avengers': 'https://upload.wikimedia.org/wikipedia/en/8/8a/The_Avengers_%282012_film%29_poster.jpg',
  'thor': 'https://upload.wikimedia.org/wikipedia/en/9/95/Thor_poster.jpg',
  'captain america': 'https://upload.wikimedia.org/wikipedia/en/3/37/Captain_America_The_First_Avenger_poster.jpg',
  'black panther': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Black_Panther_film_poster.jpg',
  'deadpool': 'https://upload.wikimedia.org/wikipedia/en/2/23/Deadpool_%282016_poster%29.png',
  'shrek': 'https://upload.wikimedia.org/wikipedia/en/3/39/Shrek.jpg',
  'frozen': 'https://upload.wikimedia.org/wikipedia/en/0/05/Frozen_%282013_film%29_poster.jpg',
  'toy story': 'https://upload.wikimedia.org/wikipedia/en/1/13/Toy_Story.jpg',
  'finding nemo': 'https://upload.wikimedia.org/wikipedia/en/2/29/Finding_Nemo.jpg',
  'lion king': 'https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg',
  'jurassic': 'https://upload.wikimedia.org/wikipedia/en/e/e7/Jurassic_Park_poster.jpg',
  'harry potter': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Harry_Potter_and_the_Philosopher%27s_Stone_banner.jpg',
  'star wars': 'https://upload.wikimedia.org/wikipedia/en/8/87/StarWarsMoviePoster1977.jpg',
  'lord of the rings': 'https://upload.wikimedia.org/wikipedia/en/8/8a/The_Lord_of_the_Rings_The_Fellowship_of_the_Ring_%282001%29.jpg',
  'pirates': 'https://upload.wikimedia.org/wikipedia/en/8/89/Pirates_of_the_Caribbean_-_The_Curse_of_the_Black_Pearl_%282003%29.jpg',
  'transformers': 'https://upload.wikimedia.org/wikipedia/en/b/b2/Transformers_07_poster.jpg',
  'mission impossible': 'https://upload.wikimedia.org/wikipedia/en/3/3f/Mission-_Impossible_%E2%80%93_Dead_Reckoning_Part_One_poster.jpg',
  'james bond': 'https://upload.wikimedia.org/wikipedia/en/c/c4/Casino_Royale_poster.jpg',
  'skyfall': 'https://upload.wikimedia.org/wikipedia/en/e/e2/Skyfall_poster.jpg'
}

const naraPath = path.join(__dirname, '../public/narabox_catalog.json')

console.log('🎬 Adding Posters to Movies\n')

if (!fs.existsSync(naraPath)) {
  console.log('❌ Catalog not found')
  process.exit(1)
}

const catalog = JSON.parse(fs.readFileSync(naraPath, 'utf8'))
console.log(`Found ${catalog.length} movies\n`)

let updated = 0

for (let i = 0; i < catalog.length; i++) {
  const movie = catalog[i]
  
  // Skip if already has a poster
  if (movie.poster && movie.poster !== '') {
    console.log(`⏭️  [${i + 1}] ${movie.title} - Already has poster`)
    continue
  }
  
  const cleanTitle = movie.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  
  // Try to find a poster
  let poster = null
  for (const [key, url] of Object.entries(SAMPLE_POSTERS)) {
    if (cleanTitle.includes(key) || key.includes(cleanTitle.split(' ')[0])) {
      poster = url
      break
    }
  }
  
  if (poster) {
    catalog[i].poster = poster
    updated++
    console.log(`✅ [${i + 1}] ${movie.title} - Added poster`)
  } else {
    console.log(`⚠️  [${i + 1}] ${movie.title} - No poster found`)
  }
}

fs.writeFileSync(naraPath, JSON.stringify(catalog, null, 2))

console.log(`\n✨ Done! Updated ${updated} movies`)
console.log(`📊 ${catalog.filter(m => m.poster).length}/${catalog.length} movies now have posters`)
console.log('💡 Changes saved to catalog\n')
