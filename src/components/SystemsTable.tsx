'use client'

import { useState, useMemo, useRef, useEffect, Fragment } from 'react'
import { AISystem, SortDir, SortField } from '@/lib/types'
import { useLanguage } from '@/lib/i18n'

export type GroupBy = 'dept' | 'vendor' | 'flat'

const PAGE_SIZE = 25

interface Props {
  systems: AISystem[]
  sortField: SortField
  sortDir: SortDir
  onSort: (field: SortField) => void
  onSelect: (s: AISystem) => void
  groupBy: GroupBy
  totalCount: number
  canClearFilters?: boolean
  onClearFilters?: () => void
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active)
    return (
      <svg aria-hidden="true" className="inline ml-1 h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
      </svg>
    )
  return (
    <svg aria-hidden="true" className="inline ml-1 h-3.5 w-3.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d={dir === 'asc' ? 'M4.5 15.75l7.5-7.5 7.5 7.5' : 'M19.5 8.25l-7.5 7.5-7.5-7.5'} />
    </svg>
  )
}

function normalizeStatusClass(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function StatusBadge({ status }: { status: string }) {
  const s = normalizeStatusClass(status ?? '')
  const vars = s.includes('production')
    ? { color: 'var(--status-production-text)', bg: 'var(--status-production-bg)', dot: 'var(--status-production)' }
    : s.includes('development') || s.includes('developpement')
    ? { color: 'var(--status-development-text)', bg: 'var(--status-development-bg)', dot: 'var(--status-development)' }
    : s.includes('pilot') || s.includes('pilote') || s.includes('proof') || s.includes('preuve')
    ? { color: 'var(--status-pilot-text)', bg: 'var(--status-pilot-bg)', dot: 'var(--status-pilot)' }
    : s.includes('decommission') || s.includes('retired') || s.includes('retire')
    ? { color: 'var(--status-decommission-text)', bg: 'var(--status-decommission-bg)', dot: 'var(--status-decommission)' }
    : { color: 'var(--text-tertiary)', bg: 'var(--bg-hover)', dot: 'var(--text-muted)' }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap" style={{ background: vars.bg, color: vars.color }}>
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: vars.dot }} aria-hidden="true" />
      {status || '—'}
    </span>
  )
}

function PiiIcon() {
  const { t } = useLanguage()
  return (
    <span
      className="inline-flex items-center justify-center h-6 w-6 rounded-md"
      style={{ background: 'var(--status-development-bg)', color: 'var(--status-development)' }}
      title={t('handles_personal_info')}
      aria-label={t('handles_personal_info')}
      role="img"
    >
      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </span>
  )
}

function SystemRow({ s, onSelect, showDept, showVendor }: {
  s: AISystem; onSelect: (s: AISystem) => void; showDept: boolean; showVendor: boolean
}) {
  const { field, deptName, t } = useLanguage()
  const name = field(s, 'name_ai_system')
  const desc = field(s, 'description_ai_system')?.trim()
  const truncDesc = desc && desc.length > 90 ? desc.slice(0, 90) + '…' : desc
  const status = field(s, 'ai_system_status')
  return (
    <tr
      onClick={() => onSelect(s)}
      className="cursor-pointer transition-colors group"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <td className="px-4 sm:px-6 py-3.5 sm:py-4">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(s) }}
          className="block w-full text-left rounded-sm focus:outline-none"
          aria-label={`${t('view_details')} ${name || t('col_system')}`}
        >
          <span className="block font-medium text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
            {name || '—'}
          </span>
          {truncDesc && <span className="block text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{truncDesc}</span>}
        </button>
      </td>
      {showDept && <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>{deptName(s.government_organization) || '—'}</td>}
      <td className="px-4 sm:px-6 py-3.5 sm:py-4"><StatusBadge status={status} /></td>
      <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-sm tabular-nums" style={{ color: 'var(--text-muted)' }}>{s.status_date || '—'}</td>
      {showVendor && <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>{s.vendor_information || '—'}</td>}
      <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-center">
        {s.involves_personal_information === 'Y' ? <PiiIcon /> : <span className="text-sm" style={{ color: 'var(--text-muted)' }} aria-label={t('no_personal_info')} role="img">—</span>}
      </td>
    </tr>
  )
}

function MobileSystemCard({ s, onSelect }: { s: AISystem; onSelect: (s: AISystem) => void }) {
  const { field, deptName, t } = useLanguage()
  const name = field(s, 'name_ai_system')
  const desc = field(s, 'description_ai_system')?.trim()
  const status = field(s, 'ai_system_status')
  const department = deptName(s.government_organization)

  return (
    <article
      className="rounded-lg p-4"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{name || '—'}</h3>
          {department && <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{department}</p>}
        </div>
        <StatusBadge status={status} />
      </div>
      {desc && (
        <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          {desc.length > 150 ? `${desc.slice(0, 150)}…` : desc}
        </p>
      )}
      <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>{t('col_year')}</dt>
          <dd className="mt-1 tabular-nums" style={{ color: 'var(--text-primary)' }}>{s.status_date || '—'}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>{t('col_pii')}</dt>
          <dd className="mt-1" style={{ color: 'var(--text-primary)' }}>
            {s.involves_personal_information === 'Y' ? t('handles_personal_info') : t('no_personal_info')}
          </dd>
        </div>
        {s.vendor_information && (
          <div className="col-span-2">
            <dt className="font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>{t('col_vendor')}</dt>
            <dd className="mt-1" style={{ color: 'var(--text-primary)' }}>{s.vendor_information}</dd>
          </div>
        )}
      </dl>
      <button
        type="button"
        onClick={() => onSelect(s)}
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
        style={{ background: 'var(--text-primary)', color: 'var(--bg-base)' }}
        aria-label={`${t('view_details')} ${name || t('col_system')}`}
      >
        {t('view_details_action')}
      </button>
    </article>
  )
}

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  const { t } = useLanguage()
  if (total <= 1) return null

  const pages: (number | '...')[] = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  const btnBase = "h-9 min-w-[2.25rem] px-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
      <button
        type="button"
        aria-label={t('previous')}
        onClick={() => onChange(current - 1)} disabled={current === 1} className={btnBase}
        style={{ border: '1px solid var(--border-color)', color: current === 1 ? 'var(--text-muted)' : 'var(--text-secondary)', background: 'var(--bg-surface)', opacity: current === 1 ? 0.5 : 1, cursor: current === 1 ? 'not-allowed' : 'pointer' }}
      >
        <svg className="h-4 w-4 sm:mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        <span className="hidden sm:inline">{t('previous')}</span>
      </button>
      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm" style={{ color: 'var(--text-muted)' }}>…</span>
          ) : (
            <button key={p} onClick={() => onChange(p)} className={btnBase}
              type="button"
              aria-label={`${t('go_to_page')} ${p}`}
              aria-current={p === current ? 'page' : undefined}
              style={{ background: p === current ? 'var(--accent)' : 'transparent', color: p === current ? '#FFFFFF' : 'var(--text-secondary)' }}
            >{p}</button>
          )
        )}
      </div>
      <button
        type="button"
        aria-label={t('next')}
        onClick={() => onChange(current + 1)} disabled={current === total} className={btnBase}
        style={{ border: '1px solid var(--border-color)', color: current === total ? 'var(--text-muted)' : 'var(--text-secondary)', background: 'var(--bg-surface)', opacity: current === total ? 0.5 : 1, cursor: current === total ? 'not-allowed' : 'pointer' }}
      >
        <span className="hidden sm:inline">{t('next')}</span>
        <svg className="h-4 w-4 sm:ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
      </button>
    </div>
  )
}

function FlatTable({ systems, sortField, sortDir, onSort, onSelect, totalCount }: Omit<Props, 'groupBy'>) {
  const { lang, t } = useLanguage()
  const [page, setPage] = useState(1)
  const resultsTopRef = useRef<HTMLDivElement>(null)
  const totalPages = Math.ceil(systems.length / PAGE_SIZE)
  const paged = useMemo(() => systems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [systems, page])

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(1)
  }, [page, totalPages])

  const handlePageChange = (p: number) => {
    setPage(p)
    resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const nameField = lang === 'fr' ? 'name_ai_system_fr' : 'name_ai_system_en'
  const statusFieldKey = lang === 'fr' ? 'ai_system_status_fr' : 'ai_system_status_en'

  const columns: { label: string; field: SortField; className?: string }[] = [
    { label: t('col_system'), field: nameField, className: 'min-w-[220px]' },
    { label: t('col_department'), field: 'government_organization', className: 'min-w-[150px]' },
    { label: t('col_status'), field: statusFieldKey, className: 'min-w-[130px]' },
    { label: t('col_year'), field: 'status_date', className: 'w-16' },
    { label: t('col_vendor'), field: 'vendor_information', className: 'min-w-[120px]' },
    { label: t('col_pii'), field: 'involves_personal_information', className: 'w-14 text-center' },
  ]

  const caption = systems.length === totalCount
    ? t('all_systems_caption').replace('{count}', String(totalCount))
    : t('showing_systems_caption').replace('{filtered}', String(systems.length)).replace('{total}', String(totalCount))

  return (
    <div ref={resultsTopRef} style={{ scrollMarginTop: '5rem' }}>
    <ul className="md:hidden space-y-3 p-3 list-none" aria-label={caption}>
      {paged.map((s, i) => (
        <li key={s.ai_register_id ?? i}>
          <MobileSystemCard s={s} onSelect={onSelect} />
        </li>
      ))}
    </ul>
    <div className="hidden md:block scroll-visible overflow-x-auto overflow-y-auto max-h-[70vh]">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(14px)', boxShadow: '0 1px 0 var(--border-color)' }}>
          <tr>
            {columns.map((col) => (
              <th key={col.field} scope="col"
                aria-sort={sortField === col.field ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                className={`px-4 sm:px-6 py-3 text-left whitespace-nowrap ${col.className ?? ''}`}
                style={{ borderBottom: '2px solid var(--border-color)' }}
              >
                <button
                  type="button"
                  onClick={() => onSort(col.field)}
                  className="inline-flex items-center text-xs font-bold uppercase tracking-[0.12em] select-none transition-colors rounded-sm"
                  style={{ color: sortField === col.field ? 'var(--accent-text)' : 'var(--text-muted)' }}
                  aria-label={`${t('sort_by')} ${col.label}`}
                >
                  {col.label}<SortIcon active={sortField === col.field} dir={sortDir} />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.map((s, i) => <SystemRow key={s.ai_register_id ?? i} s={s} onSelect={onSelect} showDept showVendor />)}
        </tbody>
      </table>
    </div>
    <Pagination current={page} total={totalPages} onChange={handlePageChange} />
    </div>
  )
}

interface GroupConfig {
  groupKey: (s: AISystem) => string
  groupLabel: (key: string) => string
  groupSummary: (key: string, sys: AISystem[], t: (k: string) => string) => React.ReactNode
  showDept: boolean
  showVendor: boolean
  colHeaderKeys: { labelKey: string; className?: string }[]
}

function summaryDot(cssVar: string) {
  return <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: cssVar }} aria-hidden="true" />
}

function GroupedTable({ systems, onSelect, config, totalCount }: {
  systems: AISystem[]; onSelect: (s: AISystem) => void; config: GroupConfig; totalCount: number
}) {
  const { t } = useLanguage()
  const groups = useMemo(() => {
    const map = new Map<string, AISystem[]>()
    for (const s of systems) { const key = config.groupKey(s); if (!map.has(key)) map.set(key, []); map.get(key)!.push(s) }
    return Array.from(map.entries()).map(([key, sys]) => ({ key, systems: sys })).sort((a, b) => a.key.localeCompare(b.key))
  }, [systems, config])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggleAll = () => { if (expanded.size === groups.length) setExpanded(new Set()); else setExpanded(new Set(groups.map((g) => g.key))) }
  const toggle = (key: string) => setExpanded((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  const colSpan = config.colHeaderKeys.length

  const caption = systems.length === totalCount
    ? `${t('all_systems_caption').replace('{count}', String(totalCount))} ${t('grouped_suffix')}`
    : `${t('showing_systems_caption').replace('{filtered}', String(systems.length)).replace('{total}', String(totalCount))} ${t('grouped_suffix')}`

  return (
    <div className="scroll-visible overflow-x-auto overflow-y-auto max-h-[70vh]">
    <table className="w-full text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(14px)', boxShadow: '0 1px 0 var(--border-color)' }}>
        <tr>
          {config.colHeaderKeys.map((h) => (
            <th key={h.labelKey} scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] whitespace-nowrap ${h.className ?? ''}`} style={{ color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)' }}>{t(h.labelKey)}</th>
          ))}
          <th scope="col" className="px-4 sm:px-6 py-3 text-right" style={{ borderBottom: '2px solid var(--border-color)' }}>
            <button type="button" onClick={toggleAll} className="text-xs font-medium transition-opacity hover:opacity-60" style={{ color: 'var(--accent-text)' }}>
              {expanded.size === groups.length ? t('collapse_all') : t('expand_all')}
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {groups.map(({ key, systems: groupSystems }) => {
          const isOpen = expanded.has(key)
          return (
            <Fragment key={key}>
              <tr
                onClick={() => toggle(key)}
                className="cursor-pointer transition-colors group/row"
                style={{ borderTop: '1px solid var(--border-color)', borderBottom: isOpen ? '1px solid var(--border-subtle)' : 'none', background: 'var(--bg-hover)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-strong)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              >
                <td colSpan={colSpan} className="px-4 sm:px-6 py-3.5 sm:py-4">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggle(key) }}
                    className="flex w-full items-center gap-3 flex-wrap text-left rounded-sm focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                      <svg aria-hidden="true" className={`h-3 w-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{config.groupLabel(key)}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md tabular-nums" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{groupSystems.length} {t('systems')}</span>
                    <div className="ml-2 pl-2 border-l" style={{ borderColor: 'var(--border-color)' }}>
                      {config.groupSummary(key, groupSystems, t)}
                    </div>
                  </button>
                </td>
                <td />
              </tr>
              {isOpen && groupSystems.map((s, i) => <SystemRow key={s.ai_register_id ?? i} s={s} onSelect={onSelect} showDept={config.showDept} showVendor={config.showVendor} />)}
            </Fragment>
          )
        })}
      </tbody>
    </table>
    </div>
  )
}

export default function SystemsTable({
  systems,
  sortField,
  sortDir,
  onSort,
  onSelect,
  groupBy,
  totalCount,
  canClearFilters,
  onClearFilters,
}: Props) {
  const { t, deptName } = useLanguage()

  const DEPT_CONFIG: GroupConfig = useMemo(() => ({
    groupKey: (s) => s.government_organization ?? 'Unknown',
    groupLabel: (key) => deptName(key),
    groupSummary: (_key, sys, t) => {
      const prod = sys.filter((s) => s.ai_system_status_en?.toLowerCase().includes('production')).length
      const pii = sys.filter((s) => s.involves_personal_information === 'Y').length
      return (
        <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          {prod > 0 && <span className="flex items-center gap-1">{summaryDot('var(--status-production)')}{prod} {t('production')}</span>}
          {pii > 0 && <span className="flex items-center gap-1">{summaryDot('var(--status-development)')}{pii} {t('pii_label')}</span>}
        </div>
      )
    },
    showDept: false, showVendor: true,
    colHeaderKeys: [
      { labelKey: 'col_system', className: 'min-w-[220px]' },
      { labelKey: 'col_status', className: 'min-w-[130px]' },
      { labelKey: 'col_year', className: 'w-16' },
      { labelKey: 'col_vendor', className: 'min-w-[120px]' },
      { labelKey: 'col_pii', className: 'w-14 text-center' },
    ],
  }), [deptName])

  const VENDOR_CONFIG: GroupConfig = useMemo(() => ({
    groupKey: (s) => s.vendor_information?.trim() || (t('col_vendor') === 'Fournisseur' ? 'Aucun fournisseur spécifique' : 'No specific vendor'),
    groupLabel: (key) => key,
    groupSummary: (_key, sys, t) => {
      const depts = new Set(sys.map((s) => deptName(s.government_organization)).filter(Boolean))
      const prod = sys.filter((s) => s.ai_system_status_en?.toLowerCase().includes('production')).length
      const pii = sys.filter((s) => s.involves_personal_information === 'Y').length
      return (
        <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          {depts.size > 0 && <span className="flex items-center gap-1">{summaryDot('var(--status-pilot)')}{depts.size} {depts.size === 1 ? t('dept_singular') : t('dept_plural')}</span>}
          {prod > 0 && <span className="flex items-center gap-1">{summaryDot('var(--status-production)')}{prod} {t('production')}</span>}
          {pii > 0 && <span className="flex items-center gap-1">{summaryDot('var(--status-development)')}{pii} {t('pii_label')}</span>}
        </div>
      )
    },
    showDept: true, showVendor: false,
    colHeaderKeys: [
      { labelKey: 'col_system', className: 'min-w-[220px]' },
      { labelKey: 'col_department', className: 'min-w-[150px]' },
      { labelKey: 'col_status', className: 'min-w-[130px]' },
      { labelKey: 'col_year', className: 'w-16' },
      { labelKey: 'col_pii', className: 'w-14 text-center' },
    ],
  }), [deptName, t])

  if (systems.length === 0) {
    return (
      <div className="rounded-xl p-8 sm:p-16 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
        <svg className="mx-auto h-10 w-10 mb-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }} fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{t('no_match')}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t('try_adjusting')}</p>
        {canClearFilters && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-5 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{ background: 'var(--text-primary)', color: 'var(--bg-base)' }}
          >
            {t('clear_results')}
          </button>
        )}
      </div>
    )
  }
  return (
    <div className="glass-panel rounded-lg transition-colors overflow-hidden">
      <div>
        {groupBy === 'dept' && <GroupedTable systems={systems} onSelect={onSelect} config={DEPT_CONFIG} totalCount={totalCount} />}
        {groupBy === 'vendor' && <GroupedTable systems={systems} onSelect={onSelect} config={VENDOR_CONFIG} totalCount={totalCount} />}
        {groupBy === 'flat' && <FlatTable systems={systems} sortField={sortField} sortDir={sortDir} onSort={onSort} onSelect={onSelect} totalCount={totalCount} />}
      </div>
    </div>
  )
}
