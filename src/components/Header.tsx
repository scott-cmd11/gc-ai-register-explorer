'use client'

import { useEffect, useState } from 'react'

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    if (current === 'retro') {
      const saved = (localStorage.getItem('theme-before-retro') as 'light' | 'dark') || 'light'
      setTheme(saved)
    } else {
      setTheme((current as 'light' | 'dark') || 'light')
    }
  }, [])

  const toggle = () => {
    // If retro is active, exit retro and apply the new theme
    if (document.documentElement.getAttribute('data-theme') === 'retro') {
      localStorage.removeItem('retro')
    }
    const next = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    setTheme(next)
    // Force body background repaint
    document.body.style.backgroundColor = ''
    void document.body.offsetHeight
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="h-9 w-9 rounded-md flex items-center justify-center transition-colors shrink-0"
      style={{ color: 'var(--text-tertiary)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
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

function RetroToggle() {
  const [isRetro, setIsRetro] = useState(false)

  useEffect(() => {
    setIsRetro(document.documentElement.getAttribute('data-theme') === 'retro')
  }, [])

  const toggle = () => {
    if (isRetro) {
      // Restore saved theme
      const savedTheme = localStorage.getItem('theme-before-retro') || localStorage.getItem('theme') || 'light'
      document.documentElement.setAttribute('data-theme', savedTheme)
      localStorage.setItem('theme', savedTheme)
      localStorage.removeItem('retro')
      localStorage.removeItem('theme-before-retro')
      setIsRetro(false)
    } else {
      // Save current theme, switch to retro
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light'
      localStorage.setItem('theme-before-retro', currentTheme)
      document.documentElement.setAttribute('data-theme', 'retro')
      localStorage.setItem('retro', 'true')
      setIsRetro(true)
    }
    // Force body background repaint
    document.body.style.backgroundColor = ''
    void document.body.offsetHeight
  }

  return (
    <button
      onClick={toggle}
      aria-label={isRetro ? 'Disable 90s retro mode' : 'Enable 90s retro mode'}
      className="h-9 px-2.5 rounded-md flex items-center justify-center gap-1.5 transition-colors shrink-0 text-xs font-medium"
      style={isRetro
        ? { color: '#FF00FF', background: '#C0C0C0', border: '3px outset #C0C0C0', fontFamily: "'Comic Sans MS', cursive" }
        : { color: 'var(--text-tertiary)' }
      }
      onMouseEnter={(e) => { if (!isRetro) e.currentTarget.style.background = 'var(--bg-hover)' }}
      onMouseLeave={(e) => { if (!isRetro) e.currentTarget.style.background = 'transparent' }}
    >
      <span aria-hidden="true">🕹️</span>
      <span className="hidden sm:inline">{isRetro ? 'Exit 90s' : '90s Mode'}</span>
    </button>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 transition-all duration-300"
      style={{
        background: scrolled ? 'var(--bg-surface)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        backgroundColor: scrolled ? 'color-mix(in srgb, var(--bg-surface) 85%, transparent)' : 'transparent',
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <a
            href="https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            aria-label="View source data on open.canada.ca (opens in new tab)"
          >
            <span>Source Data</span>
            <svg aria-hidden="true" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
          <RetroToggle />
          <span className="h-4 w-px mx-1 block hidden md:block" style={{ background: 'var(--border-color)' }} aria-hidden="true" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
