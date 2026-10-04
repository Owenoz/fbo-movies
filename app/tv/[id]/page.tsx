import { Metadata } from 'next'
import ArchivePlayer from './ArchivePlayer'
import { getShowById } from '@/lib/tvmaze'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const showId = parseInt(params.id)
    if (isNaN(showId)) {
      return { title: 'TV Show' }
    }
    
    const show = await getShowById(showId)
    if (!show) {
      return { title: 'TV Show Not Found' }
    }
    
    return {
      title: `${show.name} - Watch TV Show`,
      description: show.summary?.replace(/<[^>]*>/g, '').slice(0, 160) || `Watch ${show.name} TV show`,
    }
  } catch {
    return { title: 'Watch TV Show' }
  }
}

export default function TvShowPage({ params }: Props) {
  return <ArchivePlayer identifier={params.id} />
}
