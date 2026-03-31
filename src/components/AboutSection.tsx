'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'

export default function AboutSection() {
  const { lang, t } = useLanguage()

  const openCanadaUrl = lang === 'fr'
    ? 'https://ouvert.canada.ca/data/fr/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b'
    : 'https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b'

  const licenceUrl = lang === 'fr'
    ? 'https://ouvert.canada.ca/fr/licence-du-gouvernement-ouvert-canada'
    : 'https://open.canada.ca/en/open-government-licence-canada'

  return (
    <div className="w-full border-t mt-12 py-16" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-base)' }}>
      <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">

        {/* About & Purpose */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded flex items-center justify-center" style={{ background: 'var(--text-primary)' }}>
              <svg className="h-3.5 w-3.5" style={{ color: 'var(--bg-base)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('about_title')}</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span dangerouslySetInnerHTML={{ __html: t('about_text') }} />{' '}
            {t('about_built_by')}{' '}
            <a href="https://www.linkedin.com/in/scott-hazlitt/" target="_blank" rel="noopener noreferrer"
              className="underline hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
              Scott Hazlitt
            </a>{t('about_bio')}
          </p>
          <div className="pt-2 space-y-3">
            <div className="flex gap-3 items-start p-3 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <svg className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--status-decommission)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('disclaimer_title')}</h4>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-tertiary)' }} dangerouslySetInnerHTML={{ __html: t('disclaimer_text') }} />
              </div>
            </div>
          </div>
        </div>

        {/* Methodology */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>{t('methodology')}</h3>
          <ul className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex gap-3">
              <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>{t('data_source_label')}</strong><br />
                {t('data_source_text')}{' '}
                <a href={openCanadaUrl}
                  target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70 transition-opacity">
                  open.canada.ca
                </a>{' '}
                {t('data_source_suffix')}
              </span>
            </li>
            <li className="flex gap-3">
              <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>{t('updates_label')}</strong><br />
                {t('updates_text')}
              </span>
            </li>
            <li className="flex gap-3">
              <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>{t('licence_label')}</strong><br />
                <a href={licenceUrl}
                  target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70 transition-opacity">
                  {t('licence_link')}
                </a>
              </span>
            </li>
          </ul>
        </div>

        {/* Glossary */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>{t('glossary')}</h3>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="p-2.5 rounded-md border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{t('glossary_pii')}</strong><br />
              <span className="text-xs">{t('glossary_pii_desc')}</span>
            </li>
            <li className="p-2.5 rounded-md border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{t('glossary_production')}</strong><br />
              <span className="text-xs">{t('glossary_production_desc')}</span>
            </li>
            <li className="p-2.5 rounded-md border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{t('glossary_aia')}</strong><br />
              <span className="text-xs">{t('glossary_aia_desc')}</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-screen-xl mx-auto px-6 mt-16 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
        <p>© {new Date().getFullYear()} <a href="https://scotthazlitt.ai" target="_blank" rel="noopener noreferrer" className="hover:underline">Scott Hazlitt</a> — {t('footer_independent')}</p>
        <nav className="flex items-center gap-4" aria-label={lang === 'fr' ? 'Navigation du pied de page' : 'Footer navigation'}>
          <Link href="/about" className="hover:underline transition-colors">{t('footer_about')}</Link>
          <Link href="/privacy" className="hover:underline transition-colors">{t('footer_privacy')}</Link>
          <Link href="/terms" className="hover:underline transition-colors">{t('footer_terms')}</Link>
          <div className="flex items-center gap-3 pl-1 border-l" style={{ borderColor: 'var(--border-color)' }}>
            {/* Website */}
            <a href="https://scotthazlitt.ai" target="_blank" rel="noopener noreferrer"
              aria-label="Scott Hazlitt's website"
              className="hover:opacity-70 transition-opacity">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 01.284-2.253" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/in/scott-hazlitt/" target="_blank" rel="noopener noreferrer"
              aria-label="Scott Hazlitt on LinkedIn"
              className="hover:opacity-70 transition-opacity">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            {/* GitHub */}
            <a href="https://github.com/scott-cmd11" target="_blank" rel="noopener noreferrer"
              aria-label="Scott Hazlitt on GitHub"
              className="hover:opacity-70 transition-opacity">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </div>
        </nav>
      </div>
    </div>
  )
}
