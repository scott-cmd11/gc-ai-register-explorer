import type { Metadata } from 'next'
import PrivacyPageContent from './content'

export const metadata: Metadata = {
  title: 'Privacy Policy — AI Register Explorer',
  description: 'Privacy Policy for the AI Register Explorer, explaining what information is collected and how it is used.',
}

export default function PrivacyPage() {
  return <PrivacyPageContent />
}
