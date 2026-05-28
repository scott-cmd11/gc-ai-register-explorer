'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { fetchAllSystems } from '@/lib/api'
import { AISystem, Filters, SortDir, SortField } from '@/lib/types'
import { useLanguage } from '@/lib/i18n'
import Header from '@/components/Header'
import StatsBar from '@/components/StatsBar'
import FilterPanel from '@/components/FilterPanel'
import SystemsTable, { GroupBy } from '@/components/SystemsTable'
import SystemDetail from '@/components/SystemDetail'
import AboutSection from '@/components/AboutSection'
import ScrollIndicator from '@/components/ScrollIndicator'

function normalizeStatus(value: unknown) {
  const raw = typeof value === 'string' ? value.trim() : ''
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase() : ''
}

function ChartsLoading() {
  const { t } = useLanguage()
  return (
    <section
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
      aria-live="polite"
      aria-label={t('charts_loading')}
    >
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="glass-panel rounded-lg p-5 sm:p-6 min-h-[260px]"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
        >
          <div className="h-5 w-40 rounded" style={{ background: 'var(--bg-hover)' }} />
          <div className="mt-4 h-36 rounded" style={{ background: 'var(--bg-hover)' }} />
          <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>{t('charts_loading')}</p>
        </div>
      ))}
    </section>
  )
}

const Charts = dynamic(() => import('@/components/Charts'), {
  ssr: false,
  loading: () => <ChartsLoading />,
})

export default function HomePage() {
  const { lang, t } = useLanguage()
  const [systems, setSystems] = useState<AISystem[]>([])
  const [lastModified, setLastModified] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    department: '', status: '', personalInfo: '', developedBy: '', vendor: '', notificationAi: '',
  })
  const [sortField, setSortField] = useState<SortField>(lang === 'fr' ? 'name_ai_system_fr' : 'name_ai_system_en')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedSystem, setSelectedSystem] = useState<AISystem | null>(null)
  const [groupBy, setGroupBy] = useState<GroupBy>('flat')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setSortField(lang === 'fr' ? 'name_ai_system_fr' : 'name_ai_system_en')
  }, [lang])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
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

  const statusField = lang === 'fr' ? 'ai_system_status_fr' : 'ai_system_status_en'
  const developedByField = lang === 'fr' ? 'developed_by_fr' : 'developed_by_en'

  const filterOptions = useMemo(() => {
    const unique = (arr: unknown[]) => Array.from(new Set(arr.filter((s): s is string => typeof s === 'string' && s.trim() !== '').map((s) => s.trim()))).sort()
    const uniqueSplit = (arr: unknown[]) => Array.from(new Set(arr.filter((s): s is string => typeof s === 'string' && s.trim() !== '').flatMap((s) => s.split(/,\s*/).map((v) => v.trim())).filter(Boolean))).sort()
    return {
      departments: unique(systems.map((s) => s.government_organization)),
      statuses: unique(systems.map((s) => normalizeStatus(s[statusField]))),
      developedBy: unique(systems.map((s) => s[developedByField] as string)),
      vendors: uniqueSplit(systems.map((s) => s.vendor_information)),
    }
  }, [systems, statusField, developedByField])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    const nameField = lang === 'fr' ? 'name_ai_system_fr' : 'name_ai_system_en'
    const descField = lang === 'fr' ? 'description_ai_system_fr' : 'description_ai_system_en'
    const capField = lang === 'fr' ? 'ai_system_capabilities_fr' : 'ai_system_capabilities_en'
    const usersField = lang === 'fr' ? 'ai_system_primary_users_fr' : 'ai_system_primary_users_en'

    let result = systems.filter((s) => {
      if (q && !(s[nameField] as string)?.toLowerCase().includes(q) && !(s[descField] as string)?.toLowerCase().includes(q) && !s.government_organization?.toLowerCase().includes(q) && !s.vendor_information?.toLowerCase().includes(q) && !(s[capField] as string)?.toLowerCase().includes(q) && !(s[usersField] as string)?.toLowerCase().includes(q)) return false
      if (filters.department && s.government_organization !== filters.department) return false
      if (filters.status && normalizeStatus(s[statusField]) !== filters.status) return false
      if (filters.personalInfo && s.involves_personal_information !== filters.personalInfo) return false
      if (filters.developedBy && (s[developedByField] as string) !== filters.developedBy) return false
      if (filters.vendor && !s.vendor_information?.split(/,\s*/).some((v) => v.trim() === filters.vendor)) return false
      if (filters.notificationAi && s.notification_ai !== filters.notificationAi) return false
      return true
    })
    if (sortField) {
      result = [...result].sort((a, b) => {
        const av = String(a[sortField] ?? '')
        const bv = String(b[sortField] ?? '')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }
    return result
  }, [systems, query, filters, sortField, sortDir, lang, statusField, developedByField])

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const clearFilters = () => {
    setQuery('')
    setFilters({ department: '', status: '', personalInfo: '', developedBy: '', vendor: '', notificationAi: '' })
  }

  const exportCsv = () => {
    const suffix = lang === 'fr' ? 'fr' : 'en'
    const cols: (keyof AISystem)[] = [
      'ai_register_id', `name_ai_system_${suffix}` as keyof AISystem, 'government_organization',
      `ai_system_status_${suffix}` as keyof AISystem, 'status_date', `developed_by_${suffix}` as keyof AISystem, 'vendor_information',
      'involves_personal_information', 'notification_ai',
      `description_ai_system_${suffix}` as keyof AISystem, `ai_system_primary_users_${suffix}` as keyof AISystem,
      `ai_system_capabilities_${suffix}` as keyof AISystem, `data_sources_${suffix}` as keyof AISystem,
      `personal_information_banks_${suffix}` as keyof AISystem, `ai_system_results_${suffix}` as keyof AISystem,
    ]
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = [cols.join(','), ...filtered.map((s) => cols.map((c) => escape(s[c] as string)).join(','))]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gc-ai-register-${filtered.length}-systems.csv`
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const scrollToMain = () => {
    mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const sourceDataUrl = lang === 'fr'
    ? 'https://ouvert.canada.ca/data/fr/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b'
    : 'https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b'
  const formattedLastModified = lastModified
    ? new Date(lastModified).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
    : null

  const groupButtons: { key: GroupBy; labelKey: string; icon: string }[] = [
    { key: 'dept', labelKey: 'group_department', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' },
    { key: 'vendor', labelKey: 'group_vendor', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
    { key: 'flat', labelKey: 'group_all', icon: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ScrollIndicator />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="civic-hero-field relative w-full overflow-hidden pt-24 pb-14 md:pt-32 md:pb-24" aria-labelledby="hero-title">
        <div className="hero-photo" aria-hidden="true" />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="min-h-[540px] md:min-h-[620px] flex items-center">
          <div className="reveal-soft max-w-3xl">
          <div className="product-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} aria-hidden="true" />
            {t('hero_badge')}
          </div>
          {/* H1 */}
          <h1 id="hero-title" className="text-[2.65rem] sm:text-5xl md:text-6xl lg:text-[4.75rem] font-semibold tracking-normal leading-[0.95] mb-6 max-w-4xl" style={{ color: 'var(--text-primary)' }}>
            {t('hero_title_1')}{' '}
            <span style={{ color: 'var(--accent-text)' }}>{t('hero_title_2')}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-xl max-w-xl leading-relaxed mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.62 }}>
            {t('hero_subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button
              type="button"
              onClick={scrollToMain}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all"
              style={{ background: 'var(--text-primary)', color: 'var(--bg-base)', boxShadow: '0 20px 56px -30px var(--text-primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 22px 48px -25px var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 18px 40px -24px var(--accent)' }}
            >
              {t('hero_cta')}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
            </button>
            <a
              href={sourceDataUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="product-pill inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {t('hero_source')}
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="product-pill inline-flex flex-wrap items-center gap-x-5 gap-y-2 rounded-full px-4 py-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" /></svg>
              {t('hero_source_label')}
            </span>
            <span className="h-3 w-px" style={{ background: 'var(--border-color)' }} aria-hidden="true" />
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              {t('hero_independent')}
            </span>
          </div>
          </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <section className="w-full border-y" aria-label={t('registry_summary')} style={{ borderColor: 'var(--border-color)', background: 'var(--bg-base)' }}>
          <StatsBar systems={systems} lastModified={lastModified} />
        </section>
      )}

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main ref={mainRef} id="main-content" className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 pt-10 pb-8" tabIndex={-1} style={{ scrollMarginTop: '5rem' }}>
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'transparent' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('loading')}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-lg p-5 text-sm flex items-start gap-3" style={{ background: 'var(--status-decommission-bg)', border: '1px solid var(--status-decommission)', color: 'var(--status-decommission)' }}>
            <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="font-medium">{t('error_title')}</p>
              <p className="mt-0.5 opacity-80">{error}</p>
            </div>
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="mb-5 max-w-3xl">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-normal" style={{ color: 'var(--text-primary)' }}>
                {t('explorer_title')}
              </h2>
              <p className="mt-2 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {t('explorer_intro')}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <a href={sourceDataUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2" style={{ color: 'var(--accent-text)' }}>
                  {t('explorer_source')}
                </a>
                {formattedLastModified && (
                  <span>
                    <strong style={{ color: 'var(--text-secondary)' }}>{t('explorer_updated')}:</strong> {formattedLastModified}
                  </span>
                )}
                <span>{t('explorer_cache')}</span>
              </div>
            </div>

            {/* ── Toolbar: search + filters + controls ────────────────── */}
            <div
              className="glass-panel rounded-lg p-4 md:p-5 mb-5 space-y-4"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              {/* Search row */}
              <div className="relative flex items-center w-full rounded-lg transition-all duration-200" style={{ border: '2px solid var(--border-color)', background: 'var(--bg-elevated)' }}>
                <label htmlFor="systems-search" className="sr-only">{t('search_label')}</label>
                <svg className="absolute left-3.5 h-4 w-4 pointer-events-none shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  id="systems-search"
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="w-full h-11 pl-10 pr-20 text-sm bg-transparent outline-none ring-0"
                  style={{ color: 'var(--text-primary)' }}
                  onFocus={(e) => { e.currentTarget.parentElement!.style.borderColor = 'var(--accent)' }}
                  onBlur={(e) => { e.currentTarget.parentElement!.style.borderColor = 'var(--border-color)' }}
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="absolute right-10 transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }} aria-label={t('clear_search')}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
                <div className="absolute right-3 pointer-events-none hidden sm:flex items-center gap-1" aria-hidden="true">
                  <kbd className="font-sans px-1.5 py-0.5 text-xs rounded border bg-transparent" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>Ctrl K</kbd>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 lg:flex-1">
                  <FilterPanel filters={filters} onChange={setFilters} options={filterOptions} onClear={clearFilters} />
                </div>

                <div className="flex w-full items-center justify-between gap-2.5 lg:w-auto lg:shrink-0">
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }} aria-live="polite" aria-atomic="true">
                    <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{filtered.length}</span>
                    {filtered.length !== systems.length && <span style={{ color: 'var(--text-muted)' }}> / {systems.length}</span>}
                    <span> {t('systems')}</span>
                  </p>

                  <span className="h-4 w-px" style={{ background: 'var(--border-color)' }} aria-hidden="true" />

                  <button
                    type="button"
                    onClick={exportCsv}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                    title={t('export_csv_title')}
                    aria-label={t('export_csv_title')}
                  >
                    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span className="hidden sm:inline">{t('export')}</span>
                  </button>

                  <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: 'var(--bg-hover)' }} role="group" aria-label={t('table_grouping')}>
                    {groupButtons.map(({ key, labelKey, icon }) => (
                      <button key={key} onClick={() => setGroupBy(key)} aria-pressed={groupBy === key}
                        type="button"
                        aria-label={t(labelKey)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all"
                        style={groupBy === key
                          ? { background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }
                          : { color: 'var(--text-tertiary)' }
                        }
                      >
                        <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                        </svg>
                        <span className="hidden sm:inline">{t(labelKey)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Charts
              systems={filtered}
              onFilterStatus={(status) => setFilters((f) => ({ ...f, status: f.status === status ? '' : status }))}
              onFilterDepartment={(dept) => setFilters((f) => ({ ...f, department: f.department === dept ? '' : dept }))}
              activeStatusFilter={filters.status}
              activeDeptFilter={filters.department}
            />

            <div>
              <SystemsTable
                systems={filtered}
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
                onSelect={setSelectedSystem}
                groupBy={groupBy}
                totalCount={systems.length}
                canClearFilters={query !== '' || Object.values(filters).some(Boolean)}
                onClearFilters={clearFilters}
              />
            </div>
          </>
        )}
      </main>

      <AboutSection />

      {selectedSystem && <SystemDetail system={selectedSystem} onClose={() => setSelectedSystem(null)} />}
    </div>
  )
}
