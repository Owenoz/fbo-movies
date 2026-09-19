/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/**' },
      { protocol: 'https', hostname: 'base.iqube.sbs', pathname: '/**' },
      { protocol: 'https', hostname: 'img.kawogomovies.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.themoviedb.org', pathname: '/**' },
    ],
    unoptimized: false,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
