'use client'

import { LanguageProvider } from '@/lib/i18n'
import { Lang } from '@/lib/language'
import { SkipNav } from '@/components/SkipNav'

export function Providers({ children, initialLang }: { children: React.ReactNode; initialLang: Lang }) {
  return (
    <LanguageProvider initialLang={initialLang}>
      <SkipNav />
      {children}
    </LanguageProvider>
  )
}
