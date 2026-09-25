import { NextRequest, NextResponse } from 'next/server'
import https from 'https'
import zlib from 'zlib'
import { getNaraCatalogServer, getKibandaCatalogServer } from '@/lib/narabox'

const scrapeCache = new Map<string, { data: MovieData; ts: number }>()
const TTL = 1000 * 60 * 60 * 6

export interface MovieData {
  slug: string
  title: string
  mp4: string | null
  poster: string | null
  overview: string | null
}

function fetchNaraboxPage(slug: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'naraboxtv.com',
      path: `/movies/${encodeURIComponent(slug).replace(/%2F/g, '/')}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
    }
    const req = https.get(opts as unknown as string, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (c: Buffer) => chunks.push(c))
      res.on('end', () => {
        const buf = Buffer.concat(chunks)
        const enc = res.headers['content-encoding'] || ''
        if (enc.includes('br')) {
          zlib.brotliDecompress(buf, (e, r) => e ? reject(e) : resolve(r.toString()))
        } else if (enc.includes('gz')) {
          zlib.gunzip(buf, (e, r) => e ? reject(e) : resolve(r.toString()))
        } else {
          resolve(buf.toString())
        }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function parsePage(html: string, slug: string): MovieData {
  const mp4Match = html.match(/https:\/\/nbxgen\.naraboxtv\.com\/[^\s"'\\<>]+\.mp4/i)
  const mp4 = mp4Match ? mp4Match[0].replace(/\\/g, '') : null

  const imgMatches = html.match(/https:\/\/portal\.naraboxtv\.com\/[^\s"'\\<>]+\.(?:jpg|png|webp)/gi) || []
  const poster = imgMatches[0] || null

  const descMatch = html.match(/name="description"\s+content="([^"]+)"/)
  const overview = descMatch ? descMatch[1] : null

  const titleMatch = html.match(/<title>([^<]+)<\/title>/)
  const title = titleMatch ? titleMatch[1].split(/[-–|]/)[0].trim() : slug

  return { slug, title, mp4, poster, overview }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  // 1. Check pre-validated catalogs first (fastest path — no HTTP request needed)
  const [naraCatalog, kibandaCatalog] = await Promise.all([
    getNaraCatalogServer(),
    getKibandaCatalogServer()
  ])
  const allMovies = [...naraCatalog, ...kibandaCatalog]
  const catalogEntry = allMovies.find(m => m.slug === slug)
  
  if (catalogEntry?.mp4) {
    return NextResponse.json({
      slug:     catalogEntry.slug,
      title:    catalogEntry.title,
      mp4:      catalogEntry.mp4,
      poster:   catalogEntry.poster ?? null,
      overview: catalogEntry.overview ?? null,
    } satisfies MovieData)
  }

  // 2. Check scrape cache
  const cached = scrapeCache.get(slug)
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached.data)
  }

  // 3. Live scrape
  try {
    const html = await fetchNaraboxPage(slug)
    const data = parsePage(html, slug)
    scrapeCache.set(slug, { data, ts: Date.now() })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
