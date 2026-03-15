'use client'

import { useState, useMemo, useRef, Fragment } from 'react'
import { AISystem, SortDir, SortField } from '@/lib/types'

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
}

function deptEnglish(org: string) {
  return org?.split(' / ')[0]?.trim() ?? org
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

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? ''
  const vars = s.includes('production')
    ? { color: 'var(--status-production-text)', bg: 'var(--status-production-bg)' }
    : s.includes('development')
    ? { color: 'var(--status-development-text)', bg: 'var(--status-development-bg)' }
    : s.includes('pilot') || s.includes('proof')
    ? { color: 'var(--status-pilot-text)', bg: 'var(--status-pilot-bg)' }
    : s.includes('decommission') || s.includes('retired')
    ? { color: 'var(--status-decommission-text)', bg: 'var(--status-decommission-bg)' }
    : { color: 'var(--text-tertiary)', bg: 'var(--bg-hover)' }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" style={{ background: vars.bg, color: vars.color }}>
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'currentColor' }} aria-hidden="true" />
      {status || '—'}
    </span>
  )
}

function PiiIcon() {
  return (
    <span
      className="inline-flex items-center justify-center h-5 w-5 rounded-md"
      style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
      title="Handles personal information"
      aria-label="Handles personal information"
    >
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </span>
  )
}

function SystemRow({ s, onSelect, showDept, showVendor }: {
  s: AISystem; onSelect: (s: AISystem) => void; showDept: boolean; showVendor: boolean
}) {
  const desc = s.description_ai_system_en?.trim()
  const truncDesc = desc && desc.length > 90 ? desc.slice(0, 90) + '…' : desc
  return (
    <tr
      onClick={() => onSelect(s)}
      className="cursor-pointer transition-colors group"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(s) } }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      aria-label={`View details for ${s.name_ai_system_en || 'system'}`}
    >
      <td className="px-6 py-3.5">
        <div className="font-medium text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
          {s.name_ai_system_en || '—'}
        </div>
        {truncDesc && <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{truncDesc}</div>}
      </td>
      {showDept && <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-tertiary)' }}>{deptEnglish(s.government_organization) || '—'}</td>}
      <td className="px-6 py-3.5"><StatusBadge status={s.ai_system_status_en} /></td>
      <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>{s.status_date || '—'}</td>
      {showVendor && <td className="px-6 py-3.5 text-sm" style={{ color: 'var(--text-tertiary)' }}>{s.vendor_information || '—'}</td>}
      <td className="px-6 py-3.5 text-center">
        {s.involves_personal_information === 'Y' ? <PiiIcon /> : <span className="text-sm" style={{ color: 'var(--text-muted)' }} aria-label="No personal information">—</span>}
      </td>
    </tr>
  )
}

// ── Pagination ──────────────────────────────────────────────────────────────

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
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

  const btnBase = "h-8 min-w-[2rem] px-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"

  return (
    <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={btnBase}
        style={{
          border: '1px solid var(--border-color)',
          color: current === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
          background: 'var(--bg-surface)',
          opacity: current === 1 ? 0.5 : 1,
          cursor: current === 1 ? 'not-allowed' : 'pointer',
        }}
      >
        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm" style={{ color: 'var(--text-muted)' }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={btnBase}
              style={{
                background: p === current ? 'var(--accent)' : 'transparent',
                color: p === current ? '#FFFFFF' : 'var(--text-secondary)',
              }}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={btnBase}
        style={{
          border: '1px solid var(--border-color)',
          color: current === total ? 'var(--text-muted)' : 'var(--text-secondary)',
          background: 'var(--bg-surface)',
          opacity: current === total ? 0.5 : 1,
          cursor: current === total ? 'not-allowed' : 'pointer',
        }}
      >
        Next
        <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}

// ── Flat table ──────────────────────────────────────────────────────────────

function FlatTable({ systems, sortField, sortDir, onSort, onSelect, totalCount }: Omit<Props, 'groupBy'>) {
  const [page, setPage] = useState(1)
  const tableTopRef = useRef<HTMLTableElement>(null)
  const totalPages = Math.ceil(systems.length / PAGE_SIZE)
  const paged = useMemo(() => systems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [systems, page])

  // Reset to page 1 when data changes
  useMemo(() => { if (page > totalPages && totalPages > 0) setPage(1) }, [systems.length])

  const handlePageChange = (p: number) => {
    setPage(p)
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const columns: { label: string; field: SortField; className?: string }[] = [
    { label: 'System', field: 'name_ai_system_en', className: 'min-w-[220px]' },
    { label: 'Department', field: 'government_organization', className: 'min-w-[150px]' },
    { label: 'Status', field: 'ai_system_status_en', className: 'min-w-[130px]' },
    { label: 'Year', field: 'status_date', className: 'w-16' },
    { label: 'Vendor', field: 'vendor_information', className: 'min-w-[120px]' },
    { label: 'PII', field: 'involves_personal_information', className: 'w-14 text-center' },
  ]
  return (
    <>
      <table ref={tableTopRef} className="w-full text-sm">
        <caption className="sr-only">
          {systems.length === totalCount ? `All ${totalCount} AI systems` : `Showing ${systems.length} of ${totalCount} AI systems`}
        </caption>
        <thead className="sticky top-16 z-10" style={{ background: 'var(--bg-surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
            {columns.map((col) => (
              <th key={col.field} scope="col" onClick={() => onSort(col.field)}
                aria-sort={sortField === col.field ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                className={`px-6 py-3 text-left text-sm font-medium cursor-pointer select-none whitespace-nowrap transition-colors ${col.className ?? ''}`}
                style={{ color: sortField === col.field ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
              >
                {col.label}<SortIcon active={sortField === col.field} dir={sortDir} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.map((s, i) => <SystemRow key={s.ai_register_id ?? i} s={s} onSelect={onSelect} showDept showVendor />)}
        </tbody>
      </table>
      <Pagination current={page} total={totalPages} onChange={handlePageChange} />
    </>
  )
}

// ── Grouped view ────────────────────────────────────────────────────────────

interface GroupConfig {
  groupKey: (s: AISystem) => string
  groupLabel: (key: string) => string
  groupSummary: (key: string, sys: AISystem[]) => React.ReactNode
  showDept: boolean
  showVendor: boolean
  colHeaders: { label: string; className?: string }[]
}

function summaryDot(cssVar: string) {
  return <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: cssVar }} aria-hidden="true" />
}

const DEPT_CONFIG: GroupConfig = {
  groupKey: (s) => s.government_organization ?? 'Unknown',
  groupLabel: deptEnglish,
  groupSummary: (_key, sys) => {
    const prod = sys.filter((s) => s.ai_system_status_en?.toLowerCase().includes('production')).length
    const pii = sys.filter((s) => s.involves_personal_information === 'Y').length
    return (
      <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        {prod > 0 && <span className="flex items-center gap-1">{summaryDot('var(--status-production)')}{prod} production</span>}
        {pii > 0 && <span className="flex items-center gap-1">{summaryDot('var(--accent)')}{pii} PII</span>}
      </div>
    )
  },
  showDept: false, showVendor: true,
  colHeaders: [
    { label: 'System', className: 'min-w-[220px]' },
    { label: 'Status', className: 'min-w-[130px]' },
    { label: 'Year', className: 'w-16' },
    { label: 'Vendor', className: 'min-w-[120px]' },
    { label: 'PII', className: 'w-14 text-center' },
  ],
}

const VENDOR_CONFIG: GroupConfig = {
  groupKey: (s) => s.vendor_information?.trim() || 'No specific vendor',
  groupLabel: (key) => key,
  groupSummary: (_key, sys) => {
    const depts = new Set(sys.map((s) => deptEnglish(s.government_organization)).filter(Boolean))
    const prod = sys.filter((s) => s.ai_system_status_en?.toLowerCase().includes('production')).length
    const pii = sys.filter((s) => s.involves_personal_information === 'Y').length
    return (
      <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        {depts.size > 0 && <span className="flex items-center gap-1">{summaryDot('var(--status-pilot)')}{depts.size} {depts.size === 1 ? 'dept' : 'depts'}</span>}
        {prod > 0 && <span className="flex items-center gap-1">{summaryDot('var(--status-production)')}{prod} production</span>}
        {pii > 0 && <span className="flex items-center gap-1">{summaryDot('var(--accent)')}{pii} PII</span>}
      </div>
    )
  },
  showDept: true, showVendor: false,
  colHeaders: [
    { label: 'System', className: 'min-w-[220px]' },
    { label: 'Department', className: 'min-w-[150px]' },
    { label: 'Status', className: 'min-w-[130px]' },
    { label: 'Year', className: 'w-16' },
    { label: 'PII', className: 'w-14 text-center' },
  ],
}

function GroupedTable({ systems, onSelect, config, totalCount }: {
  systems: AISystem[]; onSelect: (s: AISystem) => void; config: GroupConfig; totalCount: number
}) {
  const groups = useMemo(() => {
    const map = new Map<string, AISystem[]>()
    for (const s of systems) { const key = config.groupKey(s); if (!map.has(key)) map.set(key, []); map.get(key)!.push(s) }
    return Array.from(map.entries()).map(([key, sys]) => ({ key, systems: sys })).sort((a, b) => a.key.localeCompare(b.key))
  }, [systems, config])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggleAll = () => { if (expanded.size === groups.length) setExpanded(new Set()); else setExpanded(new Set(groups.map((g) => g.key))) }
  const toggle = (key: string) => setExpanded((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  const colSpan = config.colHeaders.length

  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{systems.length === totalCount ? `All ${totalCount} AI systems grouped` : `Showing ${systems.length} of ${totalCount} AI systems grouped`}</caption>
      <thead className="sticky top-16 z-10" style={{ background: 'var(--bg-surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
          {config.colHeaders.map((h) => (
            <th key={h.label} scope="col" className={`px-6 py-3 text-left text-sm font-medium whitespace-nowrap ${h.className ?? ''}`} style={{ color: 'var(--text-tertiary)' }}>{h.label}</th>
          ))}
          <th scope="col" className="px-6 py-3 text-right">
            <button onClick={toggleAll} className="text-xs font-medium transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
              {expanded.size === groups.length ? 'Collapse all' : 'Expand all'}
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
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(key) } }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-strong)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                aria-expanded={isOpen}
              >
                <td colSpan={colSpan} className="px-6 py-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center justify-center w-5 h-5 rounded overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                      <svg aria-hidden="true" className={`h-3 w-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{config.groupLabel(key)}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{groupSystems.length} systems</span>
                    <div className="ml-2 pl-2 border-l" style={{ borderColor: 'var(--border-color)' }}>
                      {config.groupSummary(key, groupSystems)}
                    </div>
                  </div>
                </td>
                <td />
              </tr>
              {isOpen && groupSystems.map((s, i) => <SystemRow key={s.ai_register_id ?? i} s={s} onSelect={onSelect} showDept={config.showDept} showVendor={config.showVendor} />)}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}

export default function SystemsTable({ systems, sortField, sortDir, onSort, onSelect, groupBy, totalCount }: Props) {
  if (systems.length === 0) {
    return (
      <div className="rounded-lg p-16 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
        <svg className="mx-auto h-10 w-10 mb-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }} fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>No systems match your filters</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filter criteria</p>
      </div>
    )
  }
  return (
    <div className="rounded-lg transition-colors" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <div>
        {groupBy === 'dept' && <GroupedTable systems={systems} onSelect={onSelect} config={DEPT_CONFIG} totalCount={totalCount} />}
        {groupBy === 'vendor' && <GroupedTable systems={systems} onSelect={onSelect} config={VENDOR_CONFIG} totalCount={totalCount} />}
        {groupBy === 'flat' && <FlatTable systems={systems} sortField={sortField} sortDir={sortDir} onSort={onSort} onSelect={onSelect} totalCount={totalCount} />}
      </div>
    </div>
  )
}
