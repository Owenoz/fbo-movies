import { Metadata } from 'next'
import ArchivePlayer from './ArchivePlayer'

export const metadata: Metadata = {
  title: 'Watch Movie',
  description: 'Watch classic movies from Internet Archive'
}

export default function ArchiveWatchPage({ params }: { params: { id: string } }) {
  return <ArchivePlayer identifier={params.id} />
}
