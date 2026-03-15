export default function AboutSection() {
  return (
    <div className="w-full border-t mt-12 py-16" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-base)' }}>
      <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">
        
        {/* About & Purpose */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded flex items-center justify-center bg-zinc-900 dark:bg-zinc-100">
              <svg className="h-3.5 w-3.5 text-white dark:text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>About This Project</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The <strong>Canadian AI Landscape Explorer</strong> is an independent data visualization tool designed to make the Government of Canada's Artificial Intelligence Registry more accessible, searchable, and insightful. It transforms raw tabular data into an interactive, high-level overview of how various federal departments are deploying, piloting, or building AI systems.
          </p>
          <div className="pt-4 space-y-3">
            <div className="flex gap-3 items-start p-3 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <svg className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Important Disclaimers</h4>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  This project was built independently and is <strong>not officially affiliated</strong> with the Government of Canada. Additionally, the code and design for this interface were <strong>AI-generated</strong> using various modern development tools.
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
                <strong style={{ color: 'var(--text-primary)' }}>Data Source:</strong><br/>
                Pulls directly from the official <a href="https://open.canada.ca" className="underline hover:text-blue-500 transition-colors">open.canada.ca</a> registry API.
              </span>
            </li>
            <li className="flex gap-3">
              <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>Updates:</strong><br/>
                Data is refreshed automatically on page load to ensure the UI reflects the latest published federal datasets.
              </span>
            </li>
          </ul>
        </div>

        {/* Glossary */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>Glossary</h3>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-md border" style={{ borderColor: 'var(--border-color)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>PII</strong><br/>
              <span className="text-xs">Personal Identifiable Information. Indicates if the AI system processes sensitive citizen data.</span>
            </li>
            <li className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-md border" style={{ borderColor: 'var(--border-color)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>In Production</strong><br/>
              <span className="text-xs">The AI system is actively deployed and in use by the respective federal department.</span>
            </li>
            <li className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-md border" style={{ borderColor: 'var(--border-color)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Algorithmic Impact Assessment</strong><br/>
              <span className="text-xs">A mandatory risk-assessment tool used by the GoC to evaluate AI system pipelines.</span>
            </li>
          </ul>
        </div>

      </div>
      
      <div className="max-w-screen-xl mx-auto px-6 mt-16 pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
        <p>© {new Date().getFullYear()} Independent Project</p>
        <p>Designed with Shadcn & Tailwind Aesthetic</p>
      </div>
    </div>
  )
}
