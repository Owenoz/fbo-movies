import { Metadata } from 'next'
import SportsPlayer from './SportsPlayer'

export const metadata: Metadata = {
  title: 'Watch Live Sports',
  description: 'Watch live football match streaming'
}

export default function SportsWatchPage({ params }: { params: { matchId: string } }) {
  return <SportsPlayer matchId={params.matchId} />
}
