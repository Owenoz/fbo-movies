import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Movie Poster'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const title = slug.replace(/-vj-.*$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 'bold', color: 'white', textAlign: 'center', maxWidth: 1000 }}>
            {title}
          </div>
          <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.8)' }}>
            FBO Movies - VJ Translated
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
