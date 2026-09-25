#!/usr/bin/env node

/**
 * Scrape movies from 3-4ug.com
 * Extracts VJ-translated Luganda movies
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const VJ_PAGES = [
  'JR',           // VJ Junior
  'EMMY',         // VJ Emmy  
  'JINGO',        // VJ Jingo
  'ICE%20P',      // VJ Ice P
  'ULIO',         // VJ Ulio
  'MUBA',         // VJ Muba
  'HAM',          // VJ Ham
  'JULIO',        // VJ Julio
  'TONNY',        // VJ Tonny
  'UNCLE%20T',    // VJ Uncle T
  'MUSA',         // VJ Musa
  'JOVAN',        // VJ Jovan
];

async function fetchHTML(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    if (!response.ok) {
      console.error(`❌ Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error.message);
    return null;
  }
}

function extractMoviesFromHTML(html, vjFilter) {
  const movies = [];
  
  // The site structure seems to have movie cards
  // Extract movie titles that match pattern: "TITLE VJ_NAME" or "TITLE VJ NAME"
  const titlePattern = /([A-Z0-9\s:'\-\.]+?)\s+(VJ\s+)?([A-Z\s]+)\s*(\d{4})?\s*([\d\.]+)?/g;
  
  let match;
  const seenTitles = new Set();
  
  while ((match = titlePattern.exec(html)) !== null) {
    const fullTitle = match[0].trim();
    const movieTitle = match[1].trim();
    const vjName = match[3] ? match[3].trim() : vjFilter;
    const year = match[4] || '2024';
    const rating = match[5] || '5.0';
    
    // Skip if we've seen this title
    if (seenTitles.has(movieTitle)) continue;
    seenTitles.add(movieTitle);
    
    // Skip if title is too short or contains HTML tags
    if (movieTitle.length < 3 || movieTitle.includes('<') || movieTitle.includes('>')) continue;
    
    // Create slug
    const slug = `${movieTitle.toLowerCase()}-vj-${vjName.toLowerCase()}`
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    movies.push({
      slug,
      title: movieTitle,
      vj: `VJ ${vjName}`,
      year: parseInt(year),
      rating: parseFloat(rating),
      overview: `${movieTitle} translated by VJ ${vjName}. Watch this exciting movie in Luganda.`,
      mp4: null, // Will need to scrape individual pages for video URLs
      poster: null,
      source: '3-4ug',
    });
  }
  
  return movies;
}

async function scrapeVJPage(vjName) {
  console.log(`\n🔍 Scraping VJ ${vjName}...`);
  
  const url = `https://3-4ug.com/movies?vj=${vjName}`;
  const html = await fetchHTML(url);
  
  if (!html) {
    console.log(`⚠️  Could not fetch page for VJ ${vjName}`);
    return [];
  }
  
  const movies = extractMoviesFromHTML(html, vjName.replace(/%20/g, ' '));
  console.log(`✅ Found ${movies.length} movies for VJ ${vjName}`);
  
  return movies;
}

async function scrapeHomePage() {
  console.log('\n🔍 Scraping homepage...');
  
  const html = await fetchHTML('https://3-4ug.com');
  if (!html) return [];
  
  // Extract latest movies from homepage
  const movies = [];
  const movieMatches = html.matchAll(/([A-Z\s0-9:'\-\.]+?)\s+(?:VJ\s+)?([A-Z\s]+)\s*(\d{4})/g);
  
  for (const match of movieMatches) {
    const title = match[1].trim();
    const vj = match[2].trim();
    const year = match[3];
    
    if (title.length < 3) continue;
    
    const slug = `${title.toLowerCase()}-vj-${vj.toLowerCase()}`
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    movies.push({
      slug,
      title,
      vj: `VJ ${vj}`,
      year: parseInt(year),
      overview: `${title} translated by VJ ${vj}. Enjoy this movie in Luganda.`,
      mp4: null,
      poster: null,
      source: '3-4ug',
    });
  }
  
  console.log(`✅ Found ${movies.length} movies on homepage`);
  return movies;
}

async function main() {
  console.log('🚀 Starting 3-4ug.com scraper...\n');
  
  let allMovies = [];
  
  // Scrape homepage first
  const homeMovies = await scrapeHomePage();
  allMovies.push(...homeMovies);
  
  // Scrape each VJ page
  for (const vj of VJ_PAGES) {
    const movies = await scrapeVJPage(vj);
    allMovies.push(...movies);
    
    // Rate limit: wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Remove duplicates by slug
  const uniqueMovies = Array.from(
    new Map(allMovies.map(m => [m.slug, m])).values()
  );
  
  // Sort by year (newest first)
  uniqueMovies.sort((a, b) => (b.year || 0) - (a.year || 0));
  
  console.log(`\n✅ Total unique movies scraped: ${uniqueMovies.length}`);
  
  // Save to public directory
  const outputPath = join(__dirname, '../public/3-4ug_catalog.json');
  writeFileSync(outputPath, JSON.stringify(uniqueMovies, null, 2), 'utf-8');
  
  console.log(`💾 Saved to: ${outputPath}`);
  console.log('\n📊 Summary:');
  console.log(`   Total movies: ${uniqueMovies.length}`);
  console.log(`   Unique VJs: ${[...new Set(uniqueMovies.map(m => m.vj))].length}`);
  console.log(`   Latest year: ${Math.max(...uniqueMovies.map(m => m.year || 0))}`);
}

main().catch(console.error);
