import Link from 'next/link'

export default function AboutSection() {
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
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>About This Project</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The <strong>AI Register Explorer</strong> is an independent data visualization tool designed to make the Government of Canada&apos;s
            Artificial Intelligence Registry more accessible, searchable, and insightful. Built and maintained by{' '}
            <a href="https://www.linkedin.com/in/scott-hazlitt/" target="_blank" rel="noopener noreferrer"
              className="underline hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
              Scott Hazlitt
            </a>, a developer based in Manitoba, Canada.
          </p>
          <div className="pt-2 space-y-3">
            <div className="flex gap-3 items-start p-3 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <svg className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--status-decommission)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Important Disclaimers</h4>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  This project is <strong>not affiliated with, endorsed by, or sponsored by the Government of Canada</strong>.
                  It is an independent tool that reproduces publicly available open data. The interface was built with AI-assisted
                  development tools. Data is provided for informational purposes only and may not reflect the most current entries
                  in the official registry.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Methodology */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>Methodology</h3>
          <ul className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex gap-3">
              <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>Data Source:</strong><br />
                Pulled directly from the official{' '}
                <a href="https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b"
                  target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70 transition-opacity">
                  open.canada.ca
                </a>{' '}
                AI registry API. No curation or modification applied.
              </span>
            </li>
            <li className="flex gap-3">
              <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>Updates:</strong><br />
                Cached for 1 hour. Reflects the latest published records from the source on each refresh cycle.
              </span>
            </li>
            <li className="flex gap-3">
              <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>Licence:</strong><br />
                <a href="https://open.canada.ca/en/open-government-licence-canada"
                  target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70 transition-opacity">
                  Open Government Licence – Canada
                </a>
              </span>
            </li>
          </ul>
        </div>

        {/* Glossary */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>Glossary</h3>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="p-2.5 rounded-md border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>PII</strong><br />
              <span className="text-xs">Personally Identifiable Information. Indicates if the AI system processes sensitive citizen data, as reported by the department.</span>
            </li>
            <li className="p-2.5 rounded-md border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>In Production</strong><br />
              <span className="text-xs">The AI system is actively deployed and in use by the respective federal department.</span>
            </li>
            <li className="p-2.5 rounded-md border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Algorithmic Impact Assessment</strong><br />
              <span className="text-xs">A mandatory risk-assessment tool used by the Government of Canada to evaluate AI system pipelines.</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-screen-xl mx-auto px-6 mt-16 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
        <p>© {new Date().getFullYear()} <a href="https://www.linkedin.com/in/scott-hazlitt/" target="_blank" rel="noopener noreferrer" className="hover:underline">Scott Hazlitt</a> — Independent Project</p>
        <nav className="flex items-center gap-4" aria-label="Footer navigation">
          <Link href="/about" className="hover:underline transition-colors">About</Link>
          <Link href="/privacy" className="hover:underline transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:underline transition-colors">Terms</Link>
          <a href="mailto:scott.hazlitt@gmail.com" className="hover:underline transition-colors">Contact</a>
        </nav>
      </div>
    </div>
  )
}
