import type { Metadata } from 'next'
import AboutPageContent from './content'

export const metadata: Metadata = {
  title: 'About — AI Register Explorer',
  description: 'About the AI Register Explorer: who built it, how it works, and how to contact the operator.',
}

export default function AboutPage() {
  return <AboutPageContent />
}
