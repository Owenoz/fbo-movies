import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    const isKibanda = data.mp4.includes('munoserver') || data.mp4.includes('club')
    
    // For Kibanda URLs, they use streaming servers that can't be downloaded
    // We need to inform the user to use a video downloader extension instead
    if (isKibanda) {
      // Return JSON with instructions since direct download won't work
      return NextResponse.json({
        error: 'Kibanda movies use streaming servers',
        message: 'Please use the Watch button to stream this movie. Downloads are not available for Kibanda movies due to their streaming protection.',
        streamUrl: data.mp4,
        canStream: true,
        canDownload: false
      }, { status: 400 })
    }
    
    // For NaraBox (direct MP4 URLs), redirect to download
    const fileName = `${data.title.replace(/[^a-z0-9]/gi, '-')}.mp4`
    
    // Create response with download headers
    const response = await fetch(data.mp4, {
      headers: {
        'Range': 'bytes=0-',
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
    }

    // Return the video stream with proper headers
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': response.headers.get('Content-Length') || '',
        'Accept-Ranges': 'bytes',
      },
    })
    
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
