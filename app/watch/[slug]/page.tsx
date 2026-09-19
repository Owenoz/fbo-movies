import { Metadata } from 'next'
import WatchClient from './WatchClient'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: params.slug.replace(/-vj-[^-]+.*$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
}

export default function WatchPage({ params }: Props) {
  return <WatchClient slug={params.slug} />
}
