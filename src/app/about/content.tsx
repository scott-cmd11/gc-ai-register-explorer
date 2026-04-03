'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import { useLanguage } from '@/lib/i18n'

export default function AboutPageContent() {
  const { lang, t } = useLanguage()

  const openCanadaUrl = lang === 'fr'
    ? 'https://ouvert.canada.ca/data/fr/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b'
    : 'https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b'

  const licenceUrl = lang === 'fr'
    ? 'https://ouvert.canada.ca/fr/licence-du-gouvernement-ouvert-canada'
    : 'https://open.canada.ca/en/open-government-licence-canada'

  const openCanadaBase = lang === 'fr' ? 'https://ouvert.canada.ca' : 'https://open.canada.ca'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      <Header />

      <main id="main-content" className="flex-1 max-w-screen-md mx-auto w-full px-6 pt-28 pb-20" tabIndex={-1}>

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-10 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t('back_to_explorer')}
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
          {t('about_page_title')}
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>{t('about_page_updated')}</p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{t('about_what_title')}</h2>
            <p>
              <span dangerouslySetInnerHTML={{ __html: t('about_what_p1') }} />{' '}
              <a href={openCanadaUrl} target="_blank" rel="noopener noreferrer"
                className="underline transition-colors" style={{ color: 'var(--accent)' }}>
                open.canada.ca
              </a>{' '}
              {t('about_what_p1_suffix')}
            </p>
            <p className="mt-3" dangerouslySetInnerHTML={{ __html: t('about_what_p2') }} />
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{t('about_operator_title')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('about_operator_p1') }} />
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 01.284-2.253" />
                </svg>
                <a href="https://scotthazlitt.ai" target="_blank" rel="noopener noreferrer" className="underline transition-colors" style={{ color: 'var(--accent)' }}>
                  scotthazlitt.ai
                </a>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <a href="mailto:scott@scotthazlitt.ai" className="underline transition-colors" style={{ color: 'var(--accent)' }}>
                  scott@scotthazlitt.ai
                </a>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <a href="https://www.linkedin.com/in/scott-hazlitt/" target="_blank" rel="noopener noreferrer"
                  className="underline transition-colors" style={{ color: 'var(--accent)' }}>
                  linkedin.com/in/scott-hazlitt
                </a>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <a href="https://github.com/scott-cmd11" target="_blank" rel="noopener noreferrer"
                  className="underline transition-colors" style={{ color: 'var(--accent)' }}>
                  github.com/scott-cmd11
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{t('about_data_title')}</h2>
            <ul className="space-y-3 list-none">
              <li><strong style={{ color: 'var(--text-primary)' }}>{t('source_label')}</strong> {t('about_data_source')}{' '}
                <a href={openCanadaBase} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>open.canada.ca</a>{' '}
                {t('about_data_licence')}{' '}
                <a href={licenceUrl} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>
                  {t('licence_link')}
                </a>.
              </li>
              <li><strong style={{ color: 'var(--text-primary)' }}>{t('about_no_curation_label')}</strong> {t('about_no_curation')}</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>{t('about_updates_label')}</strong> {t('about_updates')}</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>{t('about_no_ai_label')}</strong> {t('about_no_ai')}</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>{t('about_accuracy_label')}</strong> {t('about_accuracy')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{t('about_corrections_title')}</h2>
            <p>
              {t('about_corrections_p1')}{' '}
              <a href={openCanadaBase} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>open.canada.ca</a>.
            </p>
            <p className="mt-3">
              {t('about_corrections_p2')}{' '}
              <a href="mailto:scott@scotthazlitt.ai" className="underline" style={{ color: 'var(--accent)' }}>scott@scotthazlitt.ai</a>.{' '}
              {t('about_corrections_suffix')}
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{t('about_accessibility_title')}</h2>
            <p>{t('about_accessibility_p1')}</p>
            <p className="mt-3">
              {t('about_accessibility_p2_prefix')}{' '}
              <a href="mailto:scott@scotthazlitt.ai" className="underline" style={{ color: 'var(--accent)' }}>scott@scotthazlitt.ai</a>{' '}
              {t('about_accessibility_p2_suffix')}
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{t('about_opensource_title')}</h2>
            <p>
              {t('about_opensource_p1_prefix')}{' '}
              <a href="https://github.com/scott-cmd11/gc-ai-register-explorer" target="_blank" rel="noopener noreferrer"
                className="underline" style={{ color: 'var(--accent)' }}>
                GitHub
              </a>.{' '}
              {t('about_opensource_p1_suffix')}
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t py-8" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-base)' }}>
        <div className="max-w-screen-md mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} Scott Hazlitt — {t('footer_independent')}</p>
          <nav className="flex items-center gap-4" aria-label={lang === 'fr' ? 'Pages juridiques' : 'Legal pages'}>
            <Link href="/" className="hover:underline transition-colors">{t('footer_home')}</Link>
            <Link href="/privacy" className="hover:underline transition-colors">{t('footer_privacy_policy')}</Link>
            <Link href="/terms" className="hover:underline transition-colors">{t('footer_terms_of_use')}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
