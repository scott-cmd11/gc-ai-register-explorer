'use client'

import { useLanguage } from '@/lib/i18n'

export function SkipNav() {
  const { t } = useLanguage()
  return (
    <a href="#main-content" className="skip-link">
      {t('skip_nav')}
    </a>
  )
}
