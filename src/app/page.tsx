'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchAllSystems } from '@/lib/api'
import { AISystem, Filters, SortDir, SortField } from '@/lib/types'
import Header from '@/components/Header'
import StatsBar from '@/components/StatsBar'
import FilterPanel from '@/components/FilterPanel'
import Charts from '@/components/Charts'
import SystemsTable, { GroupBy } from '@/components/SystemsTable'
import SystemDetail from '@/components/SystemDetail'

export default function HomePage() {
  const [systems, setSystems] = useState<AISystem[]>([])
  const [lastModified, setLastModified] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    department: '',
    status: '',
    personalInfo: '',
    developedBy: '',
    notificationAi: '',
  })
  const [sortField, setSortField] = useState<SortField>('name_ai_system_en')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedSystem, setSelectedSystem] = useState<AISystem | null>(null)
  const [groupBy, setGroupBy] = useState<GroupBy>('dept')

  useEffect(() => {
    fetchAllSystems()
      .then(({ systems, lastModified }) => { setSystems(systems); setLastModified(lastModified) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filterOptions = useMemo(() => {
    const unique = (arr: string[]) =>
      Array.from(new Set(arr.filter(Boolean).map((s) => s.trim()))).sort()
    return {
      departments: unique(systems.map((s) => s.government_organization)),
      statuses: unique(systems.map((s) => s.ai_system_status_en)),
      developedBy: unique(systems.map((s) => s.developed_by_en)),
    }
  }, [systems])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let result = systems.filter((s) => {
      if (
        q &&
        !s.name_ai_system_en?.toLowerCase().includes(q) &&
        !s.description_ai_system_en?.toLowerCase().includes(q) &&
        !s.government_organization?.toLowerCase().includes(q) &&
        !s.vendor_information?.toLowerCase().includes(q) &&
        !s.ai_system_capabilities_en?.toLowerCase().includes(q) &&
        !s.ai_system_primary_users_en?.toLowerCase().includes(q)
      )
        return false
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
        const cmp = av.localeCompare(bv)
        return sortDir === 'asc' ? cmp : -cmp
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
      {/* Sticky header with search */}
      <Header query={query} onChange={setQuery} />

      {/* Stats bar — always computed from full unfiltered dataset */}
      {!loading && !error && <StatsBar systems={systems} lastModified={lastModified} />}

      {/* Main content */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-5 flex gap-5 items-start">
        {/* Sidebar — filters only */}
        {!loading && !error && (
          <aside className="w-64 shrink-0 sticky top-[3.5rem] self-start">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                options={filterOptions}
                onClear={clearFilters}
              />
            </div>
          </aside>
        )}

        {/* Main content area */}
        <main className="flex-1 min-w-0">
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="text-slate-400 text-sm animate-pulse">Loading systems…</div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">
              Failed to load data: {error}
            </div>
          )}
          {!loading && !error && (
            <>
              {/* Charts */}
              <Charts systems={filtered} />

              {/* Toolbar */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">{filtered.length}</span>
                  {filtered.length !== systems.length && (
                    <span className="text-slate-400"> of {systems.length}</span>
                  )}
                  <span> systems</span>
                </p>
                <div className="flex items-center gap-2">
                {/* CSV export */}
                <button
                  onClick={exportCsv}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200 bg-white"
                  title="Download filtered data as CSV"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
                {/* View toggle */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  {([
                    { key: 'dept', label: 'By department', icon: 'M4 6h16M4 10h16M4 14h8M4 18h8' },
                    { key: 'vendor', label: 'By vendor', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                    { key: 'flat', label: 'All systems', icon: 'M4 6h16M4 12h16M4 18h16' },
                  ] as { key: GroupBy; label: string; icon: string }[]).map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => setGroupBy(key)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        groupBy === key ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                      {label}
                    </button>
                  ))}
                </div>
                </div>
              </div>

              <SystemsTable
                systems={filtered}
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
                onSelect={setSelectedSystem}
                groupBy={groupBy}
              />
            </>
          )}
        </main>
      </div>

      {/* Detail slide-over */}
      {selectedSystem && (
        <SystemDetail system={selectedSystem} onClose={() => setSelectedSystem(null)} />
      )}
    </div>
  )
}
