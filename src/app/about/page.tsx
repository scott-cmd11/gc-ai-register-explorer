import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'About — AI Register Explorer',
  description: 'About the AI Register Explorer: who built it, how it works, and how to contact the operator.',
}

export default function AboutPage() {
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
          About This Project
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>Last updated: March 2026</p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>

          {/* What it is */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>What is the AI Register Explorer?</h2>
            <p>
              The <strong>AI Register Explorer</strong> is an independent, open-source data visualization tool that makes the Government
              of Canada's Artificial Intelligence Registry more accessible and searchable. It presents the same data published on{' '}
              <a href="https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b" target="_blank" rel="noopener noreferrer"
                className="underline transition-colors" style={{ color: 'var(--accent)' }}>
                open.canada.ca
              </a>{' '}
              in an interactive interface with search, filters, charts, and CSV export.
            </p>
            <p className="mt-3">
              This site is <strong>not an official Government of Canada website</strong> and is not affiliated with, endorsed by, or sponsored
              by the Government of Canada or any federal department. It is a personal project built to improve public access to information
              that is already openly licensed and publicly available.
            </p>
          </section>

          {/* Operator */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Who operates this site?</h2>
            <p>
              This site is operated by <strong>Scott Hazlitt</strong>, an individual developer based in Manitoba, Canada.
              Scott is not acting on behalf of any company, government body, or organization.
            </p>
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

          {/* Data source & methodology */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Data source & methodology</h2>
            <ul className="space-y-3 list-none">
              <li><strong style={{ color: 'var(--text-primary)' }}>Source:</strong> All data is fetched directly from the official Government of Canada open data API at{' '}
                <a href="https://open.canada.ca" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>open.canada.ca</a>{' '}
                and is published under the{' '}
                <a href="https://open.canada.ca/en/open-government-licence-canada" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>
                  Open Government Licence – Canada
                </a>.
              </li>
              <li><strong style={{ color: 'var(--text-primary)' }}>No curation or filtering:</strong> The site displays all records returned by the source API without manual review, modification, ranking, or removal. The PII flag and all other fields are reproduced as-is from the government dataset.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Updates:</strong> Data is cached for one hour. Refreshing the page after that window will pull the latest published records from the source.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>No AI classification:</strong> No artificial intelligence is used to summarize, classify, or categorize entries. The interface itself was built with AI-assisted development tools, but no AI processing is applied to the government data.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Accuracy:</strong> This tool reflects the data as published by the Government of Canada. If records are incomplete, outdated, or contain errors, those issues originate from the source dataset. For official corrections, contact the relevant federal department.</li>
            </ul>
          </section>

          {/* Corrections & takedowns */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Corrections, takedowns & privacy requests</h2>
            <p>
              Because this site reproduces publicly available government data without modification, requests to correct or remove specific
              entries should be directed to the Government of Canada dataset maintainers via{' '}
              <a href="https://open.canada.ca" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>open.canada.ca</a>.
            </p>
            <p className="mt-3">
              If you have a privacy concern, believe the site has unintentionally published personal information, or wish to make an
              inquiry under PIPEDA, please contact Scott directly at{' '}
              <a href="mailto:scott.hazlitt@gmail.com" className="underline" style={{ color: 'var(--accent)' }}>scott.hazlitt@gmail.com</a>.
              Requests will be reviewed within 30 days.
            </p>
          </section>

          {/* Accessibility */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Accessibility</h2>
            <p>
              This site is built with accessibility in mind. It includes skip navigation, semantic headings, ARIA roles and labels,
              keyboard navigation support, and focus management in modal dialogs. The interface aims for WCAG 2.1 Level AA conformance.
            </p>
            <p className="mt-3">
              If you encounter an accessibility barrier, please email{' '}
              <a href="mailto:scott.hazlitt@gmail.com" className="underline" style={{ color: 'var(--accent)' }}>scott.hazlitt@gmail.com</a>{' '}
              describing the issue and your assistive technology. Feedback is welcome and will be addressed as promptly as possible.
            </p>
          </section>

          {/* Open source */}
          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Open source</h2>
            <p>
              The source code for this project is publicly available on{' '}
              <a href="https://github.com/scott-cmd11/gc-ai-register-explorer" target="_blank" rel="noopener noreferrer"
                className="underline" style={{ color: 'var(--accent)' }}>
                GitHub
              </a>.
              Contributions, issues, and suggestions are welcome.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t py-8" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-base)' }}>
        <div className="max-w-screen-md mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} Scott Hazlitt — Independent Project</p>
          <nav className="flex items-center gap-4" aria-label="Legal pages">
            <Link href="/" className="hover:underline transition-colors">Home</Link>
            <Link href="/privacy" className="hover:underline transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline transition-colors">Terms of Use</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
