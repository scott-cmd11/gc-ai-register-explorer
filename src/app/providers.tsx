'use client'

import { LanguageProvider } from '@/lib/i18n'
import { SkipNav } from '@/components/SkipNav'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SkipNav />
      {children}
    </LanguageProvider>
  )
}
