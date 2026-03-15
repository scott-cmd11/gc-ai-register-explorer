import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Terms of Use — AI Register Explorer',
  description: 'Terms of Use for the AI Register Explorer, including disclaimer, permitted use, and governing law.',
}

export default function TermsPage() {
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
          Terms of Use
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>Last updated: March 2026</p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Acceptance of terms</h2>
            <p>
              By accessing or using the <strong>AI Register Explorer</strong> at{' '}
              <a href="https://ai-register-explorer.vercel.app" target="_blank" rel="noopener noreferrer"
                className="underline" style={{ color: 'var(--accent)' }}>
                ai-register-explorer.vercel.app
              </a>{' '}
              (the "Site"), you agree to these Terms of Use. If you do not agree, please do not use the Site.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Not an official Government of Canada website</h2>
            <div className="p-4 rounded-lg mb-4" style={{ background: 'var(--status-decommission-bg)', border: '1px solid var(--status-decommission)', color: 'var(--status-decommission)' }}>
              <p className="font-semibold mb-1">Important notice</p>
              <p className="text-xs leading-relaxed">
                This Site is an independent project and is <strong>not affiliated with, endorsed by, or sponsored by the
                Government of Canada</strong> or any federal department, agency, or Crown corporation. The official Government of
                Canada AI Registry is available at{' '}
                <a href="https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b"
                  target="_blank" rel="noopener noreferrer" className="underline">
                  open.canada.ca
                </a>.
              </p>
            </div>
            <p>
              The operator of this Site is Scott Hazlitt, a private individual in Manitoba, Canada.
              Use of federal government trademarks, logos, or visual identities is not intended and does not imply government sponsorship.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Informational purposes only</h2>
            <p className="mb-3">
              All content on this Site is provided for <strong>general informational purposes only</strong>. The data is
              sourced from the Government of Canada's publicly available AI Registry and is reproduced without modification.
              It may be incomplete, out of date, or contain errors originating from the source dataset.
            </p>
            <p>
              This Site should not be relied upon as a definitive, authoritative, or legally complete record of AI systems
              used by the Government of Canada. For official or compliance purposes, consult the source data directly at{' '}
              <a href="https://open.canada.ca" target="_blank" rel="noopener noreferrer"
                className="underline" style={{ color: 'var(--accent)' }}>
                open.canada.ca
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Data licence</h2>
            <p>
              The underlying data displayed on this Site is published by the Government of Canada under the{' '}
              <a href="https://open.canada.ca/en/open-government-licence-canada" target="_blank" rel="noopener noreferrer"
                className="underline" style={{ color: 'var(--accent)' }}>
                Open Government Licence – Canada
              </a>. Use of that data is subject to the terms of that licence. This Site does not claim any ownership over
              the government data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Permitted use</h2>
            <p className="mb-3">You may use the Site for lawful purposes, including research, journalism, education, and general information. You may not:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use automated scrapers or bots to overload the Site's infrastructure</li>
              <li>Misrepresent the Site as an official government resource</li>
              <li>Use the Site in any manner that violates applicable Canadian law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>No warranty</h2>
            <p>
              The Site and its content are provided "<strong>as is</strong>" and "<strong>as available</strong>" without
              warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness
              for a particular purpose, accuracy, completeness, or non-infringement. The operator does not guarantee that
              the Site will be error-free, uninterrupted, or free of harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Scott Hazlitt shall not be liable for any direct, indirect,
              incidental, special, or consequential damages arising out of or related to your use of, or inability to use,
              the Site or its content, even if advised of the possibility of such damages. This includes, without limitation,
              any reliance placed on the accuracy or completeness of the data displayed.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Third-party links</h2>
            <p>
              The Site contains links to external websites, including open.canada.ca and LinkedIn. These links are provided
              for convenience only. The operator has no control over and accepts no responsibility for the content, privacy
              practices, or availability of those sites.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Governing law</h2>
            <p>
              These Terms of Use are governed by and construed in accordance with the laws of the Province of Manitoba
              and the applicable federal laws of Canada, without regard to conflict of law principles.
              Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Manitoba.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Changes to these terms</h2>
            <p>
              These terms may be updated from time to time. The "Last updated" date at the top of this page will reflect
              any changes. Continued use of the Site after an update constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Contact</h2>
            <p>
              Questions about these Terms of Use may be directed to{' '}
              <a href="mailto:scott.hazlitt@gmail.com" className="underline" style={{ color: 'var(--accent)' }}>
                scott.hazlitt@gmail.com
              </a>.
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
            <Link href="/privacy" className="hover:underline transition-colors">Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
