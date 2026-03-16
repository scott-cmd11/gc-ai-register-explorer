'use client'

import { useLanguage } from '@/lib/i18n'

export function SkipNav() {
  const { t } = useLanguage()
  return (
    <a href="#main-content" className="skip-nav">
      {t('skip_nav')}
    </a>
  )
}
