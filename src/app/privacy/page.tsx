import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Privacy Policy — AI Register Explorer',
  description: 'Privacy Policy for the AI Register Explorer, explaining what information is collected and how it is used.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      <Header />

      <main id="main-content" className="flex-1 max-w-screen-md mx-auto w-full px-6 pt-28 pb-20" tabIndex={-1}>

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-10 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Explorer
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>Last updated: March 2026</p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Overview</h2>
            <p>
              This Privacy Policy describes how Scott Hazlitt ("<strong>I</strong>", "<strong>me</strong>", or "<strong>the operator</strong>")
              handles information in connection with the <strong>AI Register Explorer</strong> website at{' '}
              <a href="https://ai-register-explorer.vercel.app" target="_blank" rel="noopener noreferrer"
                className="underline" style={{ color: 'var(--accent)' }}>
                ai-register-explorer.vercel.app
              </a>{' '}
              (the "Site"). This policy complies with the <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA)
              and applicable Canadian privacy law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Information I collect</h2>
            <p className="mb-3">
              <strong style={{ color: 'var(--text-primary)' }}>I collect no personal information directly.</strong> The Site is a
              read-only data viewer. There are no accounts, no login, no forms that submit data to my servers, and no analytics
              or tracking scripts installed.
            </p>
            <p className="mb-3">
              <strong style={{ color: 'var(--text-primary)' }}>Search queries stay in your browser.</strong> When you type into
              the search bar, that text is processed entirely within your browser and is never sent to this site's server or
              to any third party.
            </p>
            <p>
              <strong style={{ color: 'var(--text-primary)' }}>Browser storage (localStorage).</strong> The Site stores your
              theme preference (light, dark, or 90s mode) in your browser's <code>localStorage</code>. This is local to your
              device, is not a cookie, and is never transmitted to any server.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Information collected by third-party services</h2>
            <p className="mb-3">
              The Site is hosted on <strong>Vercel</strong> (Vercel Inc., San Francisco, CA, USA). As with any web hosting provider,
              Vercel's infrastructure automatically receives standard HTTP request data when you visit the Site, which may include
              your IP address, browser type, operating system, referring URL, and the date and time of your request. This is
              standard server log data processed by Vercel as part of delivering the service.
            </p>
            <p className="mb-3">
              Vercel's handling of this data is governed by their{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
                className="underline" style={{ color: 'var(--accent)' }}>
                Privacy Policy
              </a>. Note that Vercel is a US-based company; your request data may be processed in the United States.
            </p>
            <p>
              The Site also loads fonts from <strong>Google Fonts</strong> (Google LLC, Mountain View, CA, USA) via the
              Next.js font optimization service. Google may receive your IP address as part of this font delivery. Google's
              data practices are governed by{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                className="underline" style={{ color: 'var(--accent)' }}>
                Google's Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Cookies</h2>
            <p>
              This Site does not set any cookies. The theme preference described above is stored in <code>localStorage</code>,
              which is distinct from cookies and is not transmitted with HTTP requests.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>How information is used</h2>
            <p>
              I do not collect, use, or disclose personal information for any purpose. The server-side API route on this
              Site fetches data from the Government of Canada's open data API on your behalf and returns it to your browser;
              it does not log or store any information about you or your requests.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Data about Government of Canada AI systems</h2>
            <p>
              The data displayed on this Site comes from the Government of Canada's AI registry, published under the{' '}
              <a href="https://open.canada.ca/en/open-government-licence-canada" target="_blank" rel="noopener noreferrer"
                className="underline" style={{ color: 'var(--accent)' }}>
                Open Government Licence – Canada
              </a>. This data is public information; it does not contain personal information about private individuals.
              The PII flag visible in the interface indicates whether a government AI system <em>processes</em> personal
              data — it is not itself personal data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Your rights under PIPEDA</h2>
            <p className="mb-3">
              Under PIPEDA, you have the right to access personal information held about you and to request corrections.
              Because this Site collects no personal information about visitors, there is generally nothing to access or correct.
            </p>
            <p>
              If you believe the Site has inadvertently collected or published your personal information, please contact me
              at{' '}
              <a href="mailto:scott.hazlitt@gmail.com" className="underline" style={{ color: 'var(--accent)' }}>
                scott.hazlitt@gmail.com
              </a>. I will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Contact</h2>
            <p>
              For privacy-related questions, corrections, or complaints, contact:
            </p>
            <div className="mt-3 p-4 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Scott Hazlitt</p>
              <p>Manitoba, Canada</p>
              <p>
                <a href="mailto:scott.hazlitt@gmail.com" className="underline" style={{ color: 'var(--accent)' }}>
                  scott.hazlitt@gmail.com
                </a>
              </p>
            </div>
            <p className="mt-3">
              If you are not satisfied with my response, you may contact the{' '}
              <a href="https://www.priv.gc.ca/en/" target="_blank" rel="noopener noreferrer"
                className="underline" style={{ color: 'var(--accent)' }}>
                Office of the Privacy Commissioner of Canada
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Changes to this policy</h2>
            <p>
              If this policy is updated, the "Last updated" date at the top of this page will change. Continued use of the
              Site after any change constitutes acceptance of the updated policy.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t py-8" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-base)' }}>
        <div className="max-w-screen-md mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} Scott Hazlitt — Independent Project</p>
          <nav className="flex items-center gap-4" aria-label="Legal pages">
            <Link href="/" className="hover:underline transition-colors">Home</Link>
            <Link href="/about" className="hover:underline transition-colors">About</Link>
            <Link href="/terms" className="hover:underline transition-colors">Terms of Use</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
