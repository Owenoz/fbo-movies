import { MetadataRoute } from 'next'
import { getNaraCatalogServer } from '@/lib/narabox'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://fbo-movies-one.vercel.app'
  const catalog = await getNaraCatalogServer()

  const movieUrls = catalog.map(movie => ({
    url: `${baseUrl}/movie/${movie.slug}`,
    lastModified: movie.addedAt ? new Date(movie.addedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...movieUrls,
  ]
}
