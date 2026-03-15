'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { fetchAllSystems } from '@/lib/api'
import { AISystem, Filters, SortDir, SortField } from '@/lib/types'
import Header from '@/components/Header'
import StatsBar from '@/components/StatsBar'
import FilterPanel from '@/components/FilterPanel'
import Charts from '@/components/Charts'
import SystemsTable, { GroupBy } from '@/components/SystemsTable'
import SystemDetail from '@/components/SystemDetail'
import AboutSection from '@/components/AboutSection'
import RetroOverlay from '@/components/RetroOverlay'

export default function HomePage() {
  const [systems, setSystems] = useState<AISystem[]>([])
  const [lastModified, setLastModified] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    department: '', status: '', personalInfo: '', developedBy: '', notificationAi: '',
  })
  const [sortField, setSortField] = useState<SortField>('name_ai_system_en')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedSystem, setSelectedSystem] = useState<AISystem | null>(null)
  const [groupBy, setGroupBy] = useState<GroupBy>('dept')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    fetchAllSystems()
      .then(({ systems, lastModified }) => { setSystems(systems); setLastModified(lastModified) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filterOptions = useMemo(() => {
    const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean).map((s) => s.trim()))).sort()
    return {
      departments: unique(systems.map((s) => s.government_organization)),
      statuses: unique(systems.map((s) => s.ai_system_status_en)),
      developedBy: unique(systems.map((s) => s.developed_by_en)),
    }
  }, [systems])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let result = systems.filter((s) => {
      if (q && !s.name_ai_system_en?.toLowerCase().includes(q) && !s.description_ai_system_en?.toLowerCase().includes(q) && !s.government_organization?.toLowerCase().includes(q) && !s.vendor_information?.toLowerCase().includes(q) && !s.ai_system_capabilities_en?.toLowerCase().includes(q) && !s.ai_system_primary_users_en?.toLowerCase().includes(q)) return false
      if (filters.department && s.government_organization !== filters.department) return false
      if (filters.status && s.ai_system_status_en !== filters.status) return false
      if (filters.personalInfo && s.involves_personal_information !== filters.personalInfo) return false
      if (filters.developedBy && s.developed_by_en !== filters.developedBy) return false
      if (filters.notificationAi && s.notification_ai !== filters.notificationAi) return false
      return true
    })
    if (sortField) {
      result = [...result].sort((a, b) => {
        const av = (a[sortField] ?? '') as string
        const bv = (b[sortField] ?? '') as string
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }
    return result
  }, [systems, query, filters, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const clearFilters = () => {
    setQuery('')
    setFilters({ department: '', status: '', personalInfo: '', developedBy: '', notificationAi: '' })
  }

  const exportCsv = () => {
    const cols: (keyof typeof filtered[0])[] = [
      'ai_register_id', 'name_ai_system_en', 'government_organization',
      'ai_system_status_en', 'status_date', 'developed_by_en', 'vendor_information',
      'involves_personal_information', 'notification_ai',
      'description_ai_system_en', 'ai_system_primary_users_en',
      'ai_system_capabilities_en', 'data_sources_en',
      'personal_information_banks_en', 'ai_system_results_en',
    ]
    const escape = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`
    const rows = [cols.join(','), ...filtered.map((s) => cols.map((c) => escape(s[c] as string)).join(','))]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `gc-ai-register-${filtered.length}-systems.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <RetroOverlay />

      <div className="relative overflow-hidden w-full pt-32 pb-20 md:pt-40 md:pb-28 border-b" style={{ borderColor: 'var(--border-color)', background: 'radial-gradient(ellipse at top, var(--bg-hover) 0%, transparent 70%)' }}>
        <div className="max-w-screen-md mx-auto px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-sm)' }}>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--status-production)' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--status-production)' }}></span>
            </span>
            Canada AI Directory
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Canadian AI <br className="hidden md:block"/>
            <span style={{ color: 'var(--text-muted)' }}>Landscape Explorer</span>
          </h1>
          
          <p className="text-base md:text-lg mb-10 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            An open directory of artificial intelligence systems developed, procured, or implemented by departments across the Government of Canada.
          </p>
          
          <div className="w-full relative group max-w-2xl text-left">
            <div className="absolute inset-0 rounded-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" style={{ background: 'var(--ring)', opacity: 0.15, filter: 'blur(20px)' }} />
            <div className="relative flex items-center w-full rounded-2xl overflow-hidden transition-all duration-300 bg-white dark:bg-zinc-950" style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
              <svg className="absolute left-5 h-6 w-6 pointer-events-none" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search systems, departments, vendors…"
                className="w-full h-16 pl-14 pr-16 text-lg bg-transparent outline-none ring-0"
                style={{ color: 'var(--text-primary)' }}
                onFocus={(e) => {
                  e.currentTarget.parentElement!.style.borderColor = 'var(--ring)'
                  e.currentTarget.parentElement!.style.boxShadow = '0 0 0 1px var(--ring), var(--shadow-lg)'
                }}
                onBlur={(e) => {
                  e.currentTarget.parentElement!.style.borderColor = 'var(--border-color)'
                  e.currentTarget.parentElement!.style.boxShadow = 'var(--shadow-lg)'
                }}
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-12 transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1 opacity-50 transition-opacity aria-[hidden=true]:opacity-0" aria-hidden={query.length > 0}>
                <kbd className="font-sans px-2 py-0.5 text-xs rounded border bg-transparent" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>⌘K</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!loading && !error && (
        <div className="w-full border-b mb-8" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-base)' }}>
          <StatsBar systems={systems} lastModified={lastModified} />
        </div>
      )}

      <main id="main-content" className="flex-1 max-w-screen-2xl mx-auto w-full px-6 pb-8" tabIndex={-1}>
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'transparent' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading systems…</span>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-lg p-5 text-sm flex items-start gap-3" style={{ background: 'var(--status-decommission-bg)', border: '1px solid var(--status-decommission)', color: 'var(--status-decommission)' }}>
            <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="font-medium">Failed to load data</p>
              <p className="mt-0.5 opacity-80">{error}</p>
            </div>
          </div>
        )}
        {!loading && !error && (
          <>
            <Charts
              systems={filtered}
              onFilterStatus={(status) => setFilters((f) => ({ ...f, status: f.status === status ? '' : status }))}
              onFilterDepartment={(dept) => setFilters((f) => ({ ...f, department: f.department === dept ? '' : dept }))}
              activeStatusFilter={filters.status}
              activeDeptFilter={filters.department}
            />

            {/* Toolbar: filters + controls */}
            <div
              className="rounded-lg p-4 mb-3 space-y-3"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <FilterPanel filters={filters} onChange={setFilters} options={filterOptions} onClear={clearFilters} />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }} aria-live="polite" aria-atomic="true">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{filtered.length}</span>
                    {filtered.length !== systems.length && <span style={{ color: 'var(--text-muted)' }}> / {systems.length}</span>}
                    <span> systems</span>
                  </p>

                  <span className="h-4 w-px" style={{ background: 'var(--border-color)' }} aria-hidden="true" />

                  <button
                    onClick={exportCsv}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                    title="Download filtered data as CSV"
                  >
                    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export
                  </button>

                  <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: 'var(--bg-hover)' }} role="group" aria-label="Table grouping">
                    {([
                      { key: 'dept', label: 'Department', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' },
                      { key: 'vendor', label: 'Vendor', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
                      { key: 'flat', label: 'All', icon: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' },
                    ] as { key: GroupBy; label: string; icon: string }[]).map(({ key, label, icon }) => (
                      <button key={key} onClick={() => setGroupBy(key)} aria-pressed={groupBy === key}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                        style={groupBy === key
                          ? { background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }
                          : { color: 'var(--text-muted)' }
                        }
                      >
                        <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                        </svg>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <SystemsTable systems={filtered} sortField={sortField} sortDir={sortDir} onSort={handleSort} onSelect={setSelectedSystem} groupBy={groupBy} totalCount={systems.length} />
          </>
        )}
      </main>

      <AboutSection />

      {selectedSystem && <SystemDetail system={selectedSystem} onClose={() => setSelectedSystem(null)} />}
    </div>
  )
}
