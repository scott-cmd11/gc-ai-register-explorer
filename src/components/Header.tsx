'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { translator } from '@/lib/register/copy'
import { Icon } from './register/shared'

export default function Header({
  onNavigate,
}: {
  onNavigate?: (view: 'records' | 'patterns') => void
}) {
  const { lang, setLang } = useLanguage(),
    t = translator(lang)
  const [theme, setTheme] = useState('light'),
    menu = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme ?? 'light')
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
      localStorage.setItem('ai-register.theme', next)
    } catch {}
    const url = new URL(location.href)
    url.searchParams.set('theme', next)
    history.replaceState(history.state, '', url)
  }
  const navigation = (
    <>
      {(['records', 'patterns'] as const).map((view) => (
        <a
          key={view}
          href={
            onNavigate
              ? view === 'records'
                ? '#register'
                : '#insights'
              : `/?view=${view}&lang=${lang}#${view === 'records' ? 'register' : 'insights'}`
          }
          onClick={() => {
            onNavigate?.(view)
            menu.current?.removeAttribute('open')
          }}
        >
          {t(view === 'records' ? 'navRegister' : 'navInsights')}
        </a>
      ))}
      <Link href="/about" onClick={() => menu.current?.removeAttribute('open')}>
        {t('navAbout')}
      </Link>
    </>
  )
  return (
    <header className="site-header shell">
      <Link className="brand" href="/" aria-label={`${t('brand')} ${t('country')}`}>
        <svg className="brand-symbol" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <path d="M5 8h7v20H5zM15 4h7v24h-7zM25 12h7v16h-7z" fill="currentColor" />
          <path d="M5 31h27" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>
          {t('brand')}
          <span className="brand-country">{t('country')}</span>
        </span>
      </Link>
      <nav className="main-nav" aria-label={t('primaryNavigation')}>
        {navigation}
      </nav>
      <div className="header-tools">
        <button
          id="theme-toggle"
          className="icon-button"
          onClick={toggleTheme}
          aria-label={t(theme === 'dark' ? 'themeLight' : 'themeDark')}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
        <button
          id="lang-toggle"
          className="language-button"
          onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
          lang={lang === 'en' ? 'fr' : 'en'}
        >
          {t('langSwitch')}
        </button>
        <details className="mobile-menu" ref={menu}>
          <summary aria-label={t('menu')}>
            <Icon name="menu" />
          </summary>
          <nav aria-label={t('primaryNavigation')}>{navigation}</nav>
        </details>
      </div>
    </header>
  )
}
