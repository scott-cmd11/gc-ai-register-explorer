'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import { useLanguage } from '@/lib/i18n'

const privacyCopy = {
  en: {
    back: 'Back to Explorer',
    title: 'Privacy Policy',
    updated: 'Last updated: June 2026',
    overviewTitle: 'Overview',
    overview: 'This Privacy Policy describes how Scott Hazlitt ("I", "me", or "the operator") handles information in connection with the AI Register Explorer website. It is written for a Canadian privacy context, including PIPEDA considerations, but it is not legal advice.',
    collectTitle: 'Information I collect',
    noPersonal: 'I collect no personal information directly. The Site is a read-only data viewer. There are no accounts, no login, no forms that submit data to my servers, and no analytics or tracking scripts installed.',
    search: 'Search queries stay in your browser. When you type into the search bar, that text is processed within your browser and is not sent to this site\'s server or to any third party.',
    storage: 'Browser storage and language preference. The Site stores your theme preference in localStorage and your language preference in localStorage plus a small first-party cookie named ai-register-lang. The cookie is sent only to this Site so pages can render in the selected language before JavaScript loads.',
    thirdPartyTitle: 'Information collected by third-party services',
    vercel: 'The Site is hosted on Vercel. As with any web hosting provider, Vercel\'s infrastructure automatically receives standard HTTP request data when you visit the Site, which may include your IP address, browser type, operating system, referring URL, and the date and time of your request.',
    vercelPolicy: 'Vercel\'s handling of this data is governed by their Privacy Policy. Vercel is a US-based company, so request data may be processed in the United States.',
    fonts: 'The Site uses font files bundled through Next.js font optimization and served from the Site\'s own assets. The browser should not contact Google Fonts directly for normal page rendering.',
    cookiesTitle: 'Cookies',
    cookies: 'This Site sets one first-party language preference cookie named ai-register-lang. It does not use advertising, analytics, or cross-site tracking cookies. Theme preference remains in localStorage.',
    useTitle: 'How information is used',
    use: 'I do not collect, use, or disclose personal information for any purpose. The language cookie is used only to render pages in your selected language. The server-side API route fetches data from the Government of Canada open data API and returns it to your browser; it does not intentionally log or store visitor information.',
    dataTitle: 'Data about Government of Canada AI systems',
    data: 'The data displayed on this Site comes from the Government of Canada AI Registry, published under the Open Government Licence - Canada. This dataset is public information. The personal-information flag visible in the interface indicates whether a government AI system processes personal information; it is not itself personal information about a site visitor.',
    rightsTitle: 'Your rights under PIPEDA',
    rights: 'Because this Site does not directly collect personal information about visitors, there is generally no visitor record to access or correct. If you believe the Site has inadvertently collected or published your personal information, contact me and I will review the concern.',
    contactTitle: 'Contact',
    contactIntro: 'For privacy-related questions, corrections, or complaints, contact:',
    opc: 'If you are not satisfied with my response, you may contact the Office of the Privacy Commissioner of Canada.',
    changesTitle: 'Changes to this policy',
    changes: 'If this policy is updated, the "Last updated" date at the top of this page will change.',
    footerIndependent: 'Independent Project',
    legalNav: 'Legal pages',
    home: 'Home',
    about: 'About',
    terms: 'Terms of Use',
  },
  fr: {
    back: 'Retour à l’explorateur',
    title: 'Politique de confidentialité',
    updated: 'Dernière mise à jour : juin 2026',
    overviewTitle: 'Aperçu',
    overview: 'La présente politique de confidentialité décrit la manière dont Scott Hazlitt (« je », « me » ou « l’exploitant ») traite les renseignements liés au site AI Register Explorer. Elle est rédigée dans un contexte canadien de protection de la vie privée, y compris les considérations liées à la LPRPDE, mais elle ne constitue pas un avis juridique.',
    collectTitle: 'Renseignements que je recueille',
    noPersonal: 'Je ne recueille directement aucun renseignement personnel. Le site est un visualiseur de données en lecture seule. Il n’y a pas de compte, pas de connexion, pas de formulaire qui transmet des données à mes serveurs, et aucun script d’analytique ou de suivi n’est installé.',
    search: 'Les recherches restent dans votre navigateur. Lorsque vous tapez dans la barre de recherche, le texte est traité dans votre navigateur et n’est pas envoyé au serveur de ce site ni à un tiers.',
    storage: 'Stockage du navigateur et préférence linguistique. Le site enregistre votre préférence de thème dans localStorage et votre préférence de langue dans localStorage ainsi que dans un petit témoin interne nommé ai-register-lang. Ce témoin est transmis seulement à ce site afin que les pages puissent s’afficher dans la langue choisie avant le chargement de JavaScript.',
    thirdPartyTitle: 'Renseignements recueillis par des services tiers',
    vercel: 'Le site est hébergé par Vercel. Comme tout fournisseur d’hébergement Web, l’infrastructure de Vercel reçoit automatiquement les données HTTP standard lorsque vous visitez le site, ce qui peut inclure votre adresse IP, votre type de navigateur, votre système d’exploitation, l’URL de référence ainsi que la date et l’heure de la demande.',
    vercelPolicy: 'Le traitement de ces données par Vercel est régi par sa politique de confidentialité. Vercel est une entreprise basée aux États-Unis; les données de demande peuvent donc être traitées aux États-Unis.',
    fonts: 'Le site utilise des fichiers de police regroupés par l’optimisation des polices de Next.js et servis à partir des ressources du site. Le navigateur ne devrait pas communiquer directement avec Google Fonts pour l’affichage normal des pages.',
    cookiesTitle: 'Témoins',
    cookies: 'Ce site crée un seul témoin interne de préférence linguistique nommé ai-register-lang. Il n’utilise aucun témoin publicitaire, analytique ou de suivi intersite. La préférence de thème demeure dans localStorage.',
    useTitle: 'Utilisation des renseignements',
    use: 'Je ne recueille, n’utilise ni ne communique de renseignements personnels à quelque fin que ce soit. Le témoin linguistique sert seulement à afficher les pages dans la langue choisie. La route API côté serveur récupère les données de l’API de données ouvertes du gouvernement du Canada et les retourne à votre navigateur; elle ne consigne ni ne stocke intentionnellement de renseignements sur les visiteurs.',
    dataTitle: 'Données sur les systèmes d’IA du gouvernement du Canada',
    data: 'Les données affichées sur ce site proviennent du Registre de l’IA du gouvernement du Canada, publié sous la Licence du gouvernement ouvert - Canada. Cet ensemble de données est public. L’indicateur de renseignements personnels visible dans l’interface indique si un système d’IA gouvernemental traite des renseignements personnels; il ne s’agit pas d’un renseignement personnel concernant un visiteur du site.',
    rightsTitle: 'Vos droits en vertu de la LPRPDE',
    rights: 'Comme ce site ne recueille pas directement de renseignements personnels sur les visiteurs, il n’existe généralement aucun dossier de visiteur à consulter ou à corriger. Si vous croyez que le site a recueilli ou publié par inadvertance vos renseignements personnels, communiquez avec moi et j’examinerai la situation.',
    contactTitle: 'Contact',
    contactIntro: 'Pour toute question, correction ou plainte liée à la confidentialité, communiquez avec :',
    opc: 'Si vous n’êtes pas satisfait de ma réponse, vous pouvez communiquer avec le Commissariat à la protection de la vie privée du Canada.',
    changesTitle: 'Modifications à cette politique',
    changes: 'Si cette politique est mise à jour, la date de « Dernière mise à jour » au haut de cette page sera modifiée.',
    footerIndependent: 'Projet indépendant',
    legalNav: 'Pages juridiques',
    home: 'Accueil',
    about: 'À propos',
    terms: 'Conditions d’utilisation',
  },
}

export default function PrivacyPageContent() {
  const { lang } = useLanguage()
  const c = privacyCopy[lang]
  const licenceUrl = lang === 'fr'
    ? 'https://ouvert.canada.ca/fr/licence-du-gouvernement-ouvert-canada'
    : 'https://open.canada.ca/en/open-government-licence-canada'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      <Header />

      <main id="main-content" className="document-page flex-1 w-full pt-24 pb-20" tabIndex={-1}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-8 xl:gap-12">
            <aside className="order-2 lg:order-1 lg:sticky lg:top-24 self-start">
              <div className="document-sidebar-card p-5">
                <p className="text-lg font-bold mb-5" style={{ color: 'var(--accent-text)' }}>{lang === 'fr' ? 'La confidentialité en bref' : 'Privacy at a glance'}</p>
                <ul className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {[
                    [lang === 'fr' ? 'Aucun compte' : 'No accounts', lang === 'fr' ? 'Aucun compte, profil ou connexion.' : 'No accounts, profiles, or logins.'],
                    [lang === 'fr' ? 'Aucune analytique' : 'No analytics', lang === 'fr' ? 'Aucun script analytique ou de suivi.' : 'No analytics or tracking scripts.'],
                    [lang === 'fr' ? 'Recherche locale' : 'Search stays in your browser', lang === 'fr' ? 'Les recherches sont traitées dans votre navigateur.' : 'Search queries are processed in your browser.'],
                    [lang === 'fr' ? 'Témoin linguistique' : 'Language cookie', lang === 'fr' ? 'Un témoin interne conserve la langue choisie.' : 'One first-party cookie stores language preference.'],
                    [lang === 'fr' ? 'Projet indépendant' : 'Independently operated', lang === 'fr' ? 'Ce site est exploité par Scott Hazlitt au Manitoba.' : 'Operated by Scott Hazlitt in Manitoba.'],
                  ].map(([title, body]) => (
                    <li key={title} className="border-b pb-4 last:border-b-0 last:pb-0" style={{ borderColor: 'var(--border-subtle)' }}>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                      <p className="mt-1 text-xs leading-relaxed">{body}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 rounded-md p-3 text-xs leading-relaxed" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', border: '1px solid var(--border-color)' }}>
                  {lang === 'fr' ? 'Ce site ne recueille pas directement de renseignements personnels.' : 'This site does not collect personal information directly.'}
                </p>
              </div>
            </aside>
            <div className="order-1 lg:order-2 min-w-0">
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

        <div className="document-media mb-10">
          <img src="/images/ai-register-privacy-ledger.png" alt="" aria-hidden="true" />
        </div>

        <div className="document-section p-5 sm:p-6 space-y-0 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.overviewTitle}</h2>
            <p>{c.overview}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.collectTitle}</h2>
            <p className="mb-3"><strong style={{ color: 'var(--text-primary)' }}>{c.noPersonal}</strong></p>
            <p className="mb-3">{c.search}</p>
            <p>{c.storage}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.thirdPartyTitle}</h2>
            <p className="mb-3">{c.vercel}</p>
            <p className="mb-3">
              {c.vercelPolicy}{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>
                {lang === 'fr' ? 'politique de confidentialit\u00e9 de Vercel' : 'Vercel Privacy Policy'}
              </a>.
            </p>
            <p>{c.fonts}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.cookiesTitle}</h2>
            <p>{c.cookies}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.useTitle}</h2>
            <p>{c.use}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.dataTitle}</h2>
            <p>
              {c.data}{' '}
              <a href={licenceUrl} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>
                {lang === 'fr' ? 'Licence du gouvernement ouvert - Canada' : 'Open Government Licence - Canada'}
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.rightsTitle}</h2>
            <p>{c.rights}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.contactTitle}</h2>
            <p>{c.contactIntro}</p>
            <div className="mt-3 p-4 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Scott Hazlitt</p>
              <p>Manitoba, Canada</p>
              <p>
                <a href="mailto:scott@scotthazlitt.ai" className="underline" style={{ color: 'var(--accent)' }}>
                  scott@scotthazlitt.ai
                </a>
              </p>
            </div>
            <p className="mt-3">
              {c.opc}{' '}
              <a href="https://www.priv.gc.ca/en/" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>
                {lang === 'fr' ? 'Commissariat à la protection de la vie privée du Canada' : 'Office of the Privacy Commissioner of Canada'}
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{c.changesTitle}</h2>
            <p>{c.changes}</p>
          </section>
        </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-base)' }}>
        <div className="max-w-screen-md mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} Scott Hazlitt — {c.footerIndependent}</p>
          <nav className="flex items-center gap-4" aria-label={c.legalNav}>
            <Link href="/" className="hover:underline transition-colors">{c.home}</Link>
            <Link href="/about" className="hover:underline transition-colors">{c.about}</Link>
            <Link href="/terms" className="hover:underline transition-colors">{c.terms}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
