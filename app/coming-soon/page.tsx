import { Metadata } from 'next'
import ComingSoonContent from './ComingSoonContent'

export const metadata: Metadata = {
  title: 'Coming Soon - FBO Movies',
  description: 'Upcoming VJ-translated Luganda movies releasing soon on FBO Movies',
}

export default function ComingSoonPage() {
  return <ComingSoonContent />
}
