import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 })
  }

  try {
    // Fetch movie data
    const dataRes = await fetch(`${req.nextUrl.origin}/api/movie-data?slug=${slug}`)
    const data = await dataRes.json()
    
    if (!data.mp4) {
      return NextResponse.json({ error: 'No video URL found' }, { status: 404 })
    }

    // For Kibanda (munoserver) URLs, we need to proxy with proper headers
    const isKibanda = data.mp4.includes('munoserver')
    
    if (isKibanda) {
      // Fetch video with Kibanda referrer
      const videoRes = await fetch(data.mp4, {
        headers: {
          'Referer': 'https://www.kibandavibes.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      if (!videoRes.ok) {
        return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
      }

      // Stream the video with download headers
      const fileName = `${data.title.replace(/[^a-z0-9]/gi, '-')}.mp4`
      
      return new NextResponse(videoRes.body, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'no-cache',
        },
      })
    } else {
      // For NaraBox, redirect directly (their URLs are not protected)
      return NextResponse.redirect(data.mp4)
    }
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
