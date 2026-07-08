'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import LanguageToggle from './LanguageToggle'

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const { t } = useLanguage()

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    setTheme((current as 'light' | 'dark') || 'light')
  }, [])

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    setTheme(next)
    document.body.style.backgroundColor = ''
    void document.body.offsetHeight
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'light' ? t('theme_switch_dark') : t('theme_switch_light')}
      className="h-9 w-9 rounded-lg flex items-center justify-center transition-colors shrink-0"
      style={{ color: 'var(--text-tertiary)', border: '1px solid transparent' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
    >
      {theme === 'light' ? (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      )}
    </button>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { lang, t } = useLanguage()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sourceDataUrl = lang === 'fr'
    ? 'https://ouvert.canada.ca/data/fr/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b'
    : 'https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b'

  const navItems = [
    { href: '/about', label: t('footer_about') },
    { href: '/privacy', label: t('footer_privacy_policy') },
    { href: '/terms', label: t('footer_terms_of_use') },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 transition-all duration-200 atlas-header"
      style={{
        background: scrolled ? 'color-mix(in srgb, var(--bg-elevated) 90%, transparent)' : 'color-mix(in srgb, var(--bg-base) 74%, transparent)',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(18px) saturate(120%)' : 'none',
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: brand mark */}
        <div className="flex items-center gap-7">
        <Link href="/" className="flex items-center gap-3 rounded-sm focus:outline-none" aria-label="AI Register Explorer home">
          <div className="h-9 w-9 rounded-md flex items-center justify-center shrink-0 atlas-brand-mark">
            <span className="font-display text-[0.92rem] font-black tracking-tight">AI</span>
          </div>
          <span className="text-base font-extrabold hidden sm:inline font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>AI Register Explorer</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1" aria-label={lang === 'fr' ? 'Navigation principale' : 'Primary navigation'}>
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="atlas-nav-link rounded-md px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
                  background: active ? 'var(--accent-light)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          <a
            href={sourceDataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            aria-label={t('source_data_aria')}
          >
            <span>{t('source_data')}</span>
            <svg aria-hidden="true" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
          <LanguageToggle />
          <span className="h-4 w-px hidden md:block" style={{ background: 'var(--border-color)' }} aria-hidden="true" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
