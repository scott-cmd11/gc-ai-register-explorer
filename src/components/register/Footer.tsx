'use client'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'
import { translator } from '@/lib/register/copy'
import { Icon } from './shared'

export default function Footer() {
  const { lang } = useLanguage(),
    t = translator(lang)
  return (
    <footer className="site-footer shell">
      <Link className="footer-brand" href="/">
        {t('brand')} <span>{t('country')}</span>
      </Link>
      <p>{t('footerLine')}</p>
      <nav
        className="footer-meta"
        aria-label={lang === 'fr' ? 'Renseignements sur le site' : 'Site information'}
      >
        <Link href="/about">{lang === 'fr' ? 'À propos' : 'About'}</Link>
        <Link href="/privacy">{lang === 'fr' ? 'Confidentialité' : 'Privacy'}</Link>
        <Link href="/terms">{lang === 'fr' ? 'Conditions' : 'Terms'}</Link>
        <Link href="/walkthrough">{lang === 'fr' ? 'Visite guidée' : 'Walkthrough'}</Link>
      </nav>
      <a className="icon-button" href="#top" aria-label={t('returnToTop')}>
        <Icon name="up" />
      </a>
    </footer>
  )
}
