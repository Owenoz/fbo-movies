import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 })
  }

  try {
    const isKibanda = url.includes('munoserver') || url.includes('.club')
    
    // Fetch video with proper headers
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    if (isKibanda) {
      headers['Referer'] = 'https://www.kibandavibes.com/'
      headers['Origin'] = 'https://www.kibandavibes.com'
    }
    
    // Handle range requests for seeking
    const range = req.headers.get('range')
    if (range) {
      headers['Range'] = range
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      console.error('Stream fetch failed:', response.status, response.statusText)
      return NextResponse.json({ 
        error: 'Failed to fetch video',
        status: response.status,
        url: url.substring(0, 50) + '...'
      }, { status: response.status })
    }

    // Forward the video stream with proper headers
    const responseHeaders: HeadersInit = {
      'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
      'Cache-Control': 'public, max-age=3600',
      'Accept-Ranges': 'bytes',
    }

    // Forward content-length if available
    const contentLength = response.headers.get('Content-Length')
    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength
    }

    // Forward content-range for seeking support
    const contentRange = response.headers.get('Content-Range')
    if (contentRange) {
      responseHeaders['Content-Range'] = contentRange
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    })

  } catch (error) {
    console.error('Stream proxy error:', error)
    return NextResponse.json({ 
      error: 'Stream failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
