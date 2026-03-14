interface Props {
  query: string
  onChange: (q: string) => void
}

export default function Header({ query, onChange }: Props) {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-red-500 text-xl leading-none select-none">🍁</span>
          <div>
            <span className="font-semibold text-sm tracking-wide">GC AI Register</span>
            <span className="hidden sm:inline text-slate-400 text-xs ml-2">Explorer</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search systems, departments, vendors…"
            className="w-full bg-slate-800 text-white placeholder-slate-400 text-sm pl-8 pr-8 py-1.5 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => onChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* External link */}
        <a
          href="https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <span>Source data</span>
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </header>
  )
}
