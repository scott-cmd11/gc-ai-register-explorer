'use client'

import { useLanguage } from '@/lib/i18n'

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  const toggle = () => setLang(lang === 'en' ? 'fr' : 'en')

  return (
    <button
      onClick={toggle}
      aria-label={lang === 'en' ? 'Passer au français' : 'Switch to English'}
      className="h-9 px-3 rounded-md flex items-center justify-center text-sm font-semibold transition-colors shrink-0"
      style={{ color: 'var(--text-tertiary)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {lang === 'en' ? 'FR' : 'EN'}
    </button>
  )
}
