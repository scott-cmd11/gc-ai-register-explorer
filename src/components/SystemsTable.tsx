'use client'

import { useState, useMemo, Fragment } from 'react'
import { AISystem, SortDir, SortField } from '@/lib/types'

export type GroupBy = 'dept' | 'vendor' | 'flat'

interface Props {
  systems: AISystem[]
  sortField: SortField
  sortDir: SortDir
  onSort: (field: SortField) => void
  onSelect: (s: AISystem) => void
  groupBy: GroupBy
}

// ── shared helpers ────────────────────────────────────────────────────────────

function deptEnglish(org: string) {
  return org?.split(' / ')[0]?.trim() ?? org
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active)
    return (
      <svg className="inline ml-1 h-3 w-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    )
  return (
    <svg className="inline ml-1 h-3 w-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
        d={dir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
    </svg>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? ''
  const { dot, bg, text } = s.includes('production')
    ? { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-800' }
    : s.includes('development')
    ? { dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-800' }
    : s.includes('pilot') || s.includes('proof')
    ? { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-800' }
    : s.includes('decommission') || s.includes('retired')
    ? { dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-700' }
    : { dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status || '—'}
    </span>
  )
}

function PiiIcon() {
  return (
    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-orange-100 text-orange-600" title="Handles personal information">
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </span>
  )
}

// ── system row ────────────────────────────────────────────────────────────────

function SystemRow({ s, onSelect, showDept, showVendor }: {
  s: AISystem
  onSelect: (s: AISystem) => void
  showDept: boolean
  showVendor: boolean
}) {
  const desc = s.description_ai_system_en?.trim()
  const truncDesc = desc && desc.length > 90 ? desc.slice(0, 90) + '…' : desc
  return (
    <tr onClick={() => onSelect(s)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-800 group-hover:text-red-600 transition-colors leading-snug">
          {s.name_ai_system_en || '—'}
        </div>
        {truncDesc && <div className="text-xs text-slate-400 mt-0.5 leading-snug">{truncDesc}</div>}
      </td>
      {showDept && (
        <td className="px-4 py-3 text-slate-500 text-xs leading-snug">
          {deptEnglish(s.government_organization) || '—'}
        </td>
      )}
      <td className="px-4 py-3"><StatusBadge status={s.ai_system_status_en} /></td>
      <td className="px-4 py-3 text-slate-400 text-xs">{s.status_date || '—'}</td>
      {showVendor && (
        <td className="px-4 py-3 text-slate-500 text-xs">{s.vendor_information || '—'}</td>
      )}
      <td className="px-4 py-3 text-center">
        {s.involves_personal_information === 'Y' ? <PiiIcon /> : <span className="text-slate-200 text-xs">—</span>}
      </td>
    </tr>
  )
}

// ── flat view ────────────────────────────────────────────────────────────────

function FlatTable({ systems, sortField, sortDir, onSort, onSelect }: Omit<Props, 'groupBy'>) {
  const columns: { label: string; field: SortField; className?: string }[] = [
    { label: 'System', field: 'name_ai_system_en', className: 'min-w-[200px]' },
    { label: 'Department', field: 'government_organization', className: 'min-w-[140px]' },
    { label: 'Status', field: 'ai_system_status_en', className: 'min-w-[130px]' },
    { label: 'Year', field: 'status_date', className: 'w-14' },
    { label: 'Vendor', field: 'vendor_information', className: 'min-w-[100px]' },
    { label: 'PII', field: 'involves_personal_information', className: 'w-12 text-center' },
  ]
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          {columns.map((col) => (
            <th key={col.field} onClick={() => onSort(col.field)}
              className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none whitespace-nowrap ${col.className ?? ''}`}
            >
              {col.label}<SortIcon active={sortField === col.field} dir={sortDir} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {systems.map((s, i) => (
          <SystemRow key={s.ai_register_id ?? i} s={s} onSelect={onSelect} showDept showVendor />
        ))}
      </tbody>
    </table>
  )
}

// ── generic grouped view ──────────────────────────────────────────────────────

interface GroupConfig {
  groupKey: (s: AISystem) => string
  groupLabel: (key: string) => string
  /** Extra context shown in the group header */
  groupSummary: (key: string, sys: AISystem[]) => React.ReactNode
  /** Which columns to show in system rows */
  showDept: boolean
  showVendor: boolean
  /** Column header label for the group (shown before Status/Year/etc.) */
  colHeaders: { label: string; className?: string }[]
}

const DEPT_CONFIG: GroupConfig = {
  groupKey: (s) => s.government_organization ?? 'Unknown',
  groupLabel: deptEnglish,
  groupSummary: (_key, sys) => {
    const prod = sys.filter((s) => s.ai_system_status_en?.toLowerCase().includes('production')).length
    const pii = sys.filter((s) => s.involves_personal_information === 'Y').length
    return (
      <div className="flex gap-3 text-xs text-slate-400">
        {prod > 0 && <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />{prod} in production</span>}
        {pii > 0 && <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" />{pii} with PII</span>}
      </div>
    )
  },
  showDept: false,
  showVendor: true,
  colHeaders: [
    { label: 'System', className: 'min-w-[200px]' },
    { label: 'Status', className: 'min-w-[130px]' },
    { label: 'Year', className: 'w-14' },
    { label: 'Vendor', className: 'min-w-[100px]' },
    { label: 'PII', className: 'w-12 text-center' },
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
      <div className="flex gap-3 text-xs text-slate-400">
        {depts.size > 0 && <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" />{depts.size} {depts.size === 1 ? 'dept' : 'depts'}</span>}
        {prod > 0 && <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />{prod} in production</span>}
        {pii > 0 && <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" />{pii} with PII</span>}
      </div>
    )
  },
  showDept: true,
  showVendor: false,
  colHeaders: [
    { label: 'System', className: 'min-w-[200px]' },
    { label: 'Department', className: 'min-w-[140px]' },
    { label: 'Status', className: 'min-w-[130px]' },
    { label: 'Year', className: 'w-14' },
    { label: 'PII', className: 'w-12 text-center' },
  ],
}

function GroupedTable({ systems, onSelect, config }: {
  systems: AISystem[]
  onSelect: (s: AISystem) => void
  config: GroupConfig
}) {
  const groups = useMemo(() => {
    const map = new Map<string, AISystem[]>()
    for (const s of systems) {
      const key = config.groupKey(s)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    return Array.from(map.entries())
      .map(([key, sys]) => ({ key, systems: sys }))
      .sort((a, b) => b.systems.length - a.systems.length)
  }, [systems, config])

  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleAll = () => {
    if (expanded.size === groups.length) setExpanded(new Set())
    else setExpanded(new Set(groups.map((g) => g.key)))
  }

  const toggle = (key: string) =>
    setExpanded((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })

  const colSpan = config.colHeaders.length

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          {config.colHeaders.map((h) => (
            <th key={h.label} className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${h.className ?? ''}`}>
              {h.label}
            </th>
          ))}
          <th className="px-4 py-3 text-right">
            <button onClick={toggleAll} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
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
                className="cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors border-t border-slate-200"
              >
                <td colSpan={colSpan} className="px-4 py-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <svg
                      className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-semibold text-slate-700 text-sm leading-snug">{config.groupLabel(key)}</span>
                    <span className="bg-slate-200 text-slate-600 text-xs font-medium px-1.5 py-0.5 rounded-full">
                      {groupSystems.length}
                    </span>
                    {config.groupSummary(key, groupSystems)}
                  </div>
                </td>
                <td />
              </tr>
              {isOpen && groupSystems.map((s, i) => (
                <SystemRow
                  key={s.ai_register_id ?? i}
                  s={s}
                  onSelect={onSelect}
                  showDept={config.showDept}
                  showVendor={config.showVendor}
                />
              ))}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}

// ── main export ───────────────────────────────────────────────────────────────

export default function SystemsTable({ systems, sortField, sortDir, onSort, onSelect, groupBy }: Props) {
  if (systems.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
        <div className="text-slate-300 text-4xl mb-3">🔍</div>
        <p className="text-slate-500 text-sm">No systems match your search or filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        {groupBy === 'dept' && <GroupedTable systems={systems} onSelect={onSelect} config={DEPT_CONFIG} />}
        {groupBy === 'vendor' && <GroupedTable systems={systems} onSelect={onSelect} config={VENDOR_CONFIG} />}
        {groupBy === 'flat' && <FlatTable systems={systems} sortField={sortField} sortDir={sortDir} onSort={onSort} onSelect={onSelect} />}
      </div>
    </div>
  )
}
