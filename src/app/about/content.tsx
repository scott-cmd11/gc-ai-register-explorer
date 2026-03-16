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
                <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <a href="mailto:scott.hazlitt@gmail.com" className="underline transition-colors" style={{ color: 'var(--accent)' }}>
                  scott.hazlitt@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                <a href="https://www.linkedin.com/in/scott-hazlitt/" target="_blank" rel="noopener noreferrer"
                  className="underline transition-colors" style={{ color: 'var(--accent)' }}>
                  linkedin.com/in/scott-hazlitt
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
              <a href="mailto:scott.hazlitt@gmail.com" className="underline" style={{ color: 'var(--accent)' }}>scott.hazlitt@gmail.com</a>.{' '}
              {t('about_corrections_suffix')}
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{t('about_accessibility_title')}</h2>
            <p>{t('about_accessibility_p1')}</p>
            <p className="mt-3">
              {t('about_accessibility_p2_prefix')}{' '}
              <a href="mailto:scott.hazlitt@gmail.com" className="underline" style={{ color: 'var(--accent)' }}>scott.hazlitt@gmail.com</a>{' '}
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
