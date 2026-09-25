import { Metadata } from 'next'
import RequestForm from './RequestForm'

export const metadata: Metadata = {
  title: 'Request a Movie - FBO Movies',
  description: 'Request your favorite movies to be translated in Luganda by our VJs',
}

export default function RequestPage() {
  return <RequestForm />
}
