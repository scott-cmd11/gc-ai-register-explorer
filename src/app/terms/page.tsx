import type { Metadata } from 'next'
import TermsPageContent from './content'

export const metadata: Metadata = {
  title: 'Terms of Use — AI Register Explorer',
  description: 'Terms of Use for the AI Register Explorer, including disclaimer, permitted use, and governing law.',
}

export default function TermsPage() {
  return <TermsPageContent />
}
