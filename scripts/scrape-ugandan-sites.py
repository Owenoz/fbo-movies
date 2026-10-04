#!/usr/bin/env python3
"""
Ugandan VJ Movie Scraper
Scrapes movies from JTZ MAG, Ugaflix, UGMovieBox, and TulaWatch
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urljoin

# User-Agent to avoid blocking
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Sites to scrape
SITES = {
    'jtzmag': 'https://jtzmag.com',
    'ugaflix': 'https://ugaflix.com',
    'ugmoviebox': 'https://ugmoviebox.com',
    'tulawatch': 'https://tulawatch.com'
}

def clean_title(title):
    """Clean movie title"""
    return title.strip()

def extract_vj(text):
    """Extract VJ name from text"""
    vj_patterns = [
        'VJ Junior', 'VJ Jingo', 'VJ Ice P', 'VJ Kevo', 
        'VJ Emmy', 'VJ Mark', 'VJ Neil', 'VJ IVO',
        'VJ Ashim J', 'VJ Banks', 'VJ KS'
    ]
    
    text_lower = text.lower()
    for vj in vj_patterns:
        if vj.lower() in text_lower:
            return vj
    
    return "Unknown VJ"

def make_slug(title, vj):
    """Create URL slug from title and VJ"""
    slug_text = f"{title} {vj}".lower()
    slug_text = re.sub(r'[^a-z0-9\s-]', '', slug_text)
    slug_text = re.sub(r'\s+', '-', slug_text)
    return slug_text

def scrape_tulawatch():
    """Scrape TulaWatch - seems most structured"""
    print("📡 Scraping TulaWatch...")
    movies = []
    
    try:
        response = requests.get(SITES['tulawatch'], headers=HEADERS, timeout=10)
        if response.status_code != 200:
            print(f"   ❌ Failed: Status {response.status_code}")
            return movies
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Look for movie containers - various possible structures
        movie_containers = (
            soup.find_all('div', class_=['movie-item', 'movie-card', 'item']) or
            soup.find_all('article') or
            soup.find_all('div', class_='col')
        )
        
        for container in movie_containers[:50]:  # Limit to first 50
            try:
                # Extract title
                title_elem = container.find(['h2', 'h3', 'h4', 'h5', 'a'])
                if not title_elem:
                    continue
                
                title = clean_title(title_elem.get_text())
                if not title or len(title) < 3:
                    continue
                
                # Extract VJ
                container_text = container.get_text()
                vj = extract_vj(container_text)
                
                # Extract link
                link_elem = container.find('a', href=True)
                url = urljoin(SITES['tulawatch'], link_elem['href']) if link_elem else SITES['tulawatch']
                
                # Extract poster if available
                img_elem = container.find('img')
                poster = img_elem.get('src') or img_elem.get('data-src') if img_elem else None
                if poster:
                    poster = urljoin(SITES['tulawatch'], poster)
                
                # Extract overview/description
                desc_elem = container.find(['p', 'div'], class_=['description', 'overview', 'excerpt'])
                overview = clean_title(desc_elem.get_text()) if desc_elem else None
                
                movies.append({
                    'title': title,
                    'vj': vj,
                    'slug': make_slug(title, vj),
                    'url': url,
                    'poster': poster,
                    'overview': overview,
                    'source': 'TulaWatch'
                })
                
            except Exception as e:
                continue
        
        print(f"   ✅ Found {len(movies)} movies")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    return movies

def scrape_jtzmag():
    """Scrape JTZ MAG"""
    print("📡 Scraping JTZ MAG...")
    movies = []
    
    try:
        # Try movies page
        url = f"{SITES['jtzmag']}/movies"
        response = requests.get(url, headers=HEADERS, timeout=10)
        
        if response.status_code != 200:
            print(f"   ❌ Failed: Status {response.status_code}")
            return movies
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Look for movie links and cards
        movie_containers = (
            soup.find_all('div', class_=['movie', 'film', 'video', 'post']) or
            soup.find_all('article') or
            soup.find_all('a', href=re.compile(r'/movie/|/film/|/watch/'))
        )
        
        for container in movie_containers[:50]:
            try:
                # Get title
                if container.name == 'a':
                    title = clean_title(container.get_text())
                    url_link = urljoin(SITES['jtzmag'], container['href'])
                else:
                    title_elem = container.find(['h2', 'h3', 'h4', 'a'])
                    if not title_elem:
                        continue
                    title = clean_title(title_elem.get_text())
                    link_elem = container.find('a', href=True)
                    url_link = urljoin(SITES['jtzmag'], link_elem['href']) if link_elem else url
                
                if not title or len(title) < 3:
                    continue
                
                vj = extract_vj(container.get_text() if hasattr(container, 'get_text') else title)
                
                movies.append({
                    'title': title,
                    'vj': vj,
                    'slug': make_slug(title, vj),
                    'url': url_link,
                    'poster': None,
                    'overview': None,
                    'source': 'JTZ MAG'
                })
                
            except Exception as e:
                continue
        
        print(f"   ✅ Found {len(movies)} movies")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    return movies

def scrape_ugaflix():
    """Scrape Ugaflix"""
    print("📡 Scraping Ugaflix...")
    movies = []
    
    try:
        url = f"{SITES['ugaflix']}/movies"
        response = requests.get(url, headers=HEADERS, timeout=10)
        
        if response.status_code != 200:
            print(f"   ❌ Failed: Status {response.status_code}")
            return movies
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Look for movie elements
        movie_elems = (
            soup.find_all('a', href=re.compile(r'/movie/|/watch/|/film/')) or
            soup.find_all('div', class_=['movie', 'film']) or
            soup.find_all('article')
        )
        
        for elem in movie_elems[:50]:
            try:
                if elem.name == 'a':
                    title = clean_title(elem.get_text())
                    url_link = urljoin(SITES['ugaflix'], elem['href'])
                else:
                    title_elem = elem.find(['h2', 'h3', 'a'])
                    if not title_elem:
                        continue
                    title = clean_title(title_elem.get_text())
                    link_elem = elem.find('a', href=True)
                    url_link = urljoin(SITES['ugaflix'], link_elem['href']) if link_elem else url
                
                if not title or len(title) < 3:
                    continue
                
                vj = extract_vj(elem.get_text() if hasattr(elem, 'get_text') else title)
                
                movies.append({
                    'title': title,
                    'vj': vj,
                    'slug': make_slug(title, vj),
                    'url': url_link,
                    'poster': None,
                    'overview': None,
                    'source': 'Ugaflix'
                })
                
            except Exception:
                continue
        
        print(f"   ✅ Found {len(movies)} movies")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    return movies

def main():
    print("🎬 Ugandan VJ Movie Scraper\n")
    
    all_movies = []
    
    # Scrape all sites
    all_movies.extend(scrape_tulawatch())
    time.sleep(2)
    
    all_movies.extend(scrape_jtzmag())
    time.sleep(2)
    
    all_movies.extend(scrape_ugaflix())
    
    # Remove duplicates based on title
    seen_titles = set()
    unique_movies = []
    
    for movie in all_movies:
        title_lower = movie['title'].lower()
        if title_lower not in seen_titles:
            seen_titles.add(title_lower)
            unique_movies.append(movie)
    
    print(f"\n📊 Summary:")
    print(f"   Total scraped: {len(all_movies)}")
    print(f"   Unique movies: {len(unique_movies)}")
    
    # Save to JSON
    output_file = '../public/narabox_catalog.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unique_movies, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Saved {len(unique_movies)} movies to {output_file}")
    
    # Also create kibanda as empty for now
    with open('../public/kibanda_catalog.json', 'w', encoding='utf-8') as f:
        json.dump([], f, indent=2)
    
    print("✅ Created empty kibanda_catalog.json")
    print("\n🎉 Scraping complete!\n")

if __name__ == "__main__":
    main()
