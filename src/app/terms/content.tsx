'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import { useLanguage } from '@/lib/i18n'

const termsCopy = {
  en: {
    back: 'Back to Explorer',
    title: 'Terms of Use',
    updated: 'Last updated: June 2026',
    acceptanceTitle: 'Acceptance of terms',
    acceptance: 'By accessing or using the AI Register Explorer, you agree to these Terms of Use. If you do not agree, please do not use the Site.',
    independentTitle: 'Not an official Government of Canada website',
    notice: 'This Site is an independent project and is not affiliated with, endorsed by, or sponsored by the Government of Canada or any federal department, agency, or Crown corporation.',
    independent: 'The operator of this Site is Scott Hazlitt, a private individual in Manitoba, Canada. Use of federal government trademarks, logos, or visual identities is not intended and does not imply government sponsorship.',
    infoTitle: 'Informational purposes only',
    info1: 'All content on this Site is provided for general informational purposes only. The data is sourced from the Government of Canada public AI Registry and is reproduced without intentional modification. It may be incomplete, out of date, or contain errors originating from the source dataset.',
    info2: 'This Site should not be relied upon as a definitive, authoritative, or legally complete record of AI systems used by the Government of Canada. For official or compliance purposes, consult the source data directly.',
    licenceTitle: 'Data licence',
    licence: 'The underlying data displayed on this Site is published by the Government of Canada under the Open Government Licence - Canada. Use of that data is subject to the terms of that licence. This Site does not claim ownership over the government data.',
    useTitle: 'Permitted use',
    useIntro: 'You may use the Site for lawful purposes, including research, journalism, education, and general information. You may not:',
    use1: 'Use automated scrapers or bots to overload the Site infrastructure',
    use2: 'Misrepresent the Site as an official government resource',
    use3: 'Use the Site in any manner that violates applicable Canadian law',
    warrantyTitle: 'No warranty',
    warranty: 'The Site and its content are provided "as is" and "as available" without warranty of any kind, express or implied, including warranties of accuracy, completeness, merchantability, fitness for a particular purpose, or non-infringement.',
    liabilityTitle: 'Limitation of liability',
    liability: 'To the maximum extent permitted by applicable law, Scott Hazlitt shall not be liable for any direct, indirect, incidental, special, or consequential damages arising out of or related to your use of, or inability to use, the Site or its content.',
    linksTitle: 'Third-party links',
    links: 'The Site contains links to external websites, including open.canada.ca, Vercel, LinkedIn, GitHub, and other resources. These links are provided for convenience only. The operator has no control over and accepts no responsibility for the content, privacy practices, or availability of those sites.',
    lawTitle: 'Governing law',
    law: 'These Terms of Use are governed by the laws of the Province of Manitoba and the applicable federal laws of Canada, without regard to conflict of law principles. Disputes arising under these terms shall be subject to the courts of Manitoba.',
    changesTitle: 'Changes to these terms',
    changes: 'These terms may be updated from time to time. The "Last updated" date at the top of this page will reflect changes.',
    contactTitle: 'Contact',
    contact: 'Questions about these Terms of Use may be directed to',
    official: 'Official source data',
    important: 'Important notice',
    footerIndependent: 'Independent Project',
    legalNav: 'Legal pages',
    home: 'Home',
    about: 'About',
    privacy: 'Privacy Policy',
  },
  fr: {
    back: 'Retour à l’explorateur',
    title: 'Conditions d’utilisation',
    updated: 'Dernière mise à jour : juin 2026',
    acceptanceTitle: 'Acceptation des conditions',
    acceptance: 'En accédant à AI Register Explorer ou en l’utilisant, vous acceptez les présentes conditions d’utilisation. Si vous ne les acceptez pas, veuillez ne pas utiliser le site.',
    independentTitle: 'Ce n’est pas un site officiel du gouvernement du Canada',
    notice: 'Ce site est un projet indépendant et n’est ni affilié au gouvernement du Canada, ni approuvé par celui-ci, ni parrainé par celui-ci ou par un ministère, organisme ou société d’État fédéral.',
    independent: 'L’exploitant de ce site est Scott Hazlitt, un particulier situé au Manitoba, Canada. L’utilisation de marques, logos ou identités visuelles du gouvernement fédéral n’est pas intentionnelle et n’implique aucun parrainage gouvernemental.',
    infoTitle: 'À titre informatif seulement',
    info1: 'Tout le contenu du site est fourni à titre informatif général seulement. Les données proviennent du Registre public de l’IA du gouvernement du Canada et sont reproduites sans modification intentionnelle. Elles peuvent être incomplètes, périmées ou contenir des erreurs provenant de l’ensemble de données source.',
    info2: 'Ce site ne doit pas être considéré comme un registre définitif, faisant autorité ou juridiquement complet des systèmes d’IA utilisés par le gouvernement du Canada. Pour les besoins officiels ou de conformité, consultez directement les données source.',
    licenceTitle: 'Licence des données',
    licence: 'Les données sous-jacentes affichées sur ce site sont publiées par le gouvernement du Canada sous la Licence du gouvernement ouvert - Canada. L’utilisation de ces données est assujettie aux conditions de cette licence. Ce site ne revendique aucun droit de propriété sur les données gouvernementales.',
    useTitle: 'Utilisation permise',
    useIntro: 'Vous pouvez utiliser le site à des fins légales, notamment pour la recherche, le journalisme, l’éducation et l’information générale. Vous ne pouvez pas :',
    use1: 'Utiliser des robots ou collecteurs automatisés pour surcharger l’infrastructure du site',
    use2: 'Présenter le site comme une ressource gouvernementale officielle',
    use3: 'Utiliser le site d’une manière qui contrevient au droit canadien applicable',
    warrantyTitle: 'Aucune garantie',
    warranty: 'Le site et son contenu sont fournis « tels quels » et « selon leur disponibilité », sans garantie d’aucune sorte, expresse ou implicite, y compris les garanties d’exactitude, d’exhaustivité, de qualité marchande, d’adéquation à un usage particulier ou d’absence de contrefaçon.',
    liabilityTitle: 'Limitation de responsabilité',
    liability: 'Dans toute la mesure permise par la loi applicable, Scott Hazlitt ne peut être tenu responsable de dommages directs, indirects, accessoires, particuliers ou consécutifs découlant de votre utilisation du site ou de son contenu, ou de votre incapacité à les utiliser.',
    linksTitle: 'Liens vers des tiers',
    links: 'Le site contient des liens vers des sites Web externes, notamment open.canada.ca, Vercel, LinkedIn, GitHub et d’autres ressources. Ces liens sont fournis uniquement par commodité. L’exploitant n’exerce aucun contrôle sur ces sites et n’assume aucune responsabilité quant à leur contenu, leurs pratiques de confidentialité ou leur disponibilité.',
    lawTitle: 'Droit applicable',
    law: 'Les présentes conditions d’utilisation sont régies par les lois de la province du Manitoba et les lois fédérales applicables du Canada, sans égard aux principes de conflit de lois. Les différends découlant de ces conditions relèvent des tribunaux du Manitoba.',
    changesTitle: 'Modifications aux présentes conditions',
    changes: 'Ces conditions peuvent être mises à jour de temps à autre. La date de « Dernière mise à jour » au haut de cette page indiquera les changements.',
    contactTitle: 'Contact',
    contact: 'Les questions concernant les présentes conditions d’utilisation peuvent être envoyées à',
    official: 'Données source officielles',
    important: 'Avis important',
    footerIndependent: 'Projet indépendant',
    legalNav: 'Pages juridiques',
    home: 'Accueil',
    about: 'À propos',
    privacy: 'Politique de confidentialité',
  },
}

export default function TermsPageContent() {
  const { lang } = useLanguage()
  const c = termsCopy[lang]
  const sourceDataUrl = lang === 'fr'
    ? 'https://ouvert.canada.ca/data/fr/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b'
    : 'https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b'
  const licenceUrl = lang === 'fr'
    ? 'https://ouvert.canada.ca/fr/licence-du-gouvernement-ouvert-canada'
    : 'https://open.canada.ca/en/open-government-licence-canada'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      <Header />

      <main id="main-content" className="flex-1 max-w-screen-md mx-auto w-full px-6 pt-28 pb-20" tabIndex={-1}>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-10 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {c.back}
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
          {c.title}
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>{c.updated}</p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.acceptanceTitle}</h2>
            <p>{c.acceptance}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.independentTitle}</h2>
            <div className="p-4 rounded-lg mb-4" style={{ background: 'var(--status-decommission-bg)', border: '1px solid var(--status-decommission)', color: 'var(--status-decommission-text)' }}>
              <p className="font-semibold mb-1">{c.important}</p>
              <p className="text-xs leading-relaxed">
                {c.notice}{' '}
                <a href={sourceDataUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {c.official}
                </a>.
              </p>
            </div>
            <p>{c.independent}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.infoTitle}</h2>
            <p className="mb-3">{c.info1}</p>
            <p>
              {c.info2}{' '}
              <a href={sourceDataUrl} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>
                {c.official}
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.licenceTitle}</h2>
            <p>
              {c.licence}{' '}
              <a href={licenceUrl} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>
                {lang === 'fr' ? 'Licence du gouvernement ouvert - Canada' : 'Open Government Licence - Canada'}
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.useTitle}</h2>
            <p className="mb-3">{c.useIntro}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{c.use1}</li>
              <li>{c.use2}</li>
              <li>{c.use3}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.warrantyTitle}</h2>
            <p>{c.warranty}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.liabilityTitle}</h2>
            <p>{c.liability}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.linksTitle}</h2>
            <p>{c.links}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.lawTitle}</h2>
            <p>{c.law}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.changesTitle}</h2>
            <p>{c.changes}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.contactTitle}</h2>
            <p>
              {c.contact}{' '}
              <a href="mailto:scott@scotthazlitt.ai" className="underline" style={{ color: 'var(--accent)' }}>
                scott@scotthazlitt.ai
              </a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t py-8" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-base)' }}>
        <div className="max-w-screen-md mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} Scott Hazlitt — {c.footerIndependent}</p>
          <nav className="flex items-center gap-4" aria-label={c.legalNav}>
            <Link href="/" className="hover:underline transition-colors">{c.home}</Link>
            <Link href="/about" className="hover:underline transition-colors">{c.about}</Link>
            <Link href="/privacy" className="hover:underline transition-colors">{c.privacy}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
