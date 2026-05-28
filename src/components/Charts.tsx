'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { AISystem } from '@/lib/types'
import { useLanguage } from '@/lib/i18n'

interface Props {
  systems: AISystem[]
  onFilterStatus?: (status: string) => void
  onFilterDepartment?: (dept: string) => void
  activeStatusFilter?: string
  activeDeptFilter?: string
}

const str = (v: unknown): string =>
  typeof v === 'string' ? v
  : typeof v === 'number' && Number.isFinite(v) ? String(v)
  : ''

const STATUS_COLORS: Record<string, string> = {
  production: 'var(--status-production)',
  development: 'var(--status-development)',
  pilot: 'var(--status-pilot)',
  proof: 'var(--status-pilot)',
  decommission: 'var(--status-decommission)',
  retired: 'var(--status-decommission)',
}

function getStatusColor(status: string): string {
  const s = status?.toLowerCase() ?? ''
  for (const [key, color] of Object.entries(STATUS_COLORS)) {
    if (s.includes(key)) return color
  }
  return 'var(--text-muted)'
}

const PII_COLORS: Record<string, string> = {
  Y: 'var(--status-decommission)',
  N: 'var(--status-production)',
  unknown: 'var(--text-muted)',
}

const DEV_BY_COLORS: Record<string, string> = {
  'Government of Canada': 'var(--accent)',
  'Gouvernement du Canada': 'var(--accent)',
  Vendor: 'var(--status-pilot)',
  Fournisseur: 'var(--status-pilot)',
  'Open source': 'var(--status-production)',
  'Code source libre': 'var(--status-production)',
  Other: 'var(--text-muted)',
  Autre: 'var(--text-muted)',
  __unknown__: 'var(--bg-hover-strong)',
}

function countStatuses(systems: AISystem[], statusField: keyof AISystem) {
  const counts: Record<string, number> = {}
  for (const s of systems) {
    const raw = str(s[statusField]).trim()
    if (!raw) continue
    const key = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
    counts[key] = (counts[key] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

function countByYear(systems: AISystem[]) {
  const counts: Record<string, number> = {}
  for (const s of systems) {
    const year = str(s.status_date).trim().slice(0, 4)
    if (!year || !/^\d{4}$/.test(year)) continue
    counts[year] = (counts[year] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year))
}

function countDepts(systems: AISystem[], limit: number, deptNameFn: (org: string) => string) {
  const counts: Record<string, { count: number; label: string; fullOrg: string }> = {}
  for (const s of systems) {
    const full = str(s.government_organization).trim()
    if (!full) continue
    const name = deptNameFn(full)
    const label = name.length > 28 ? name.slice(0, 26) + '…' : name
    if (!counts[name]) counts[name] = { count: 0, label, fullOrg: full }
    counts[name].count++
  }
  return Object.entries(counts)
    .map(([fullName, { count, label, fullOrg }]) => ({ fullName, label, count, fullOrg }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function countDevBy(systems: AISystem[], devByField: keyof AISystem) {
  const counts: Record<string, number> = {}
  for (const s of systems) {
    const raw = str(s[devByField]).trim()
    const key = raw || '__unknown__'
    counts[key] = (counts[key] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
}

function countPii(systems: AISystem[]) {
  const counts = { Y: 0, N: 0, unknown: 0 }
  for (const s of systems) {
    const v = str(s.involves_personal_information).trim().toUpperCase()
    if (v === 'Y') counts.Y++
    else if (v === 'N') counts.N++
    else counts.unknown++
  }
  return [
    { key: 'Y', count: counts.Y },
    { key: 'N', count: counts.N },
    { key: 'unknown', count: counts.unknown },
  ].filter((d) => d.count > 0)
}

function countTopVendors(systems: AISystem[], limit: number) {
  const counts: Record<string, number> = {}
  for (const s of systems) {
    const v = str(s.vendor_information).trim()
    if (!v) continue
    for (const part of v.split(/,\s*/)) {
      const name = part.trim()
      if (!name) continue
      counts[name] = (counts[name] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      label: name.length > 28 ? name.slice(0, 26) + '…' : name,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function countStatusByYear(systems: AISystem[], statusField: keyof AISystem) {
  const byYear: Record<string, Record<string, number>> = {}
  const allStatuses = new Set<string>()
  for (const s of systems) {
    const year = str(s.status_date).trim().slice(0, 4)
    if (!year || !/^\d{4}$/.test(year)) continue
    const raw = str(s[statusField]).trim()
    if (!raw) continue
    const status = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
    allStatuses.add(status)
    if (!byYear[year]) byYear[year] = {}
    byYear[year][status] = (byYear[year][status] ?? 0) + 1
  }
  const totals: Record<string, number> = {}
  for (const ys of Object.values(byYear)) {
    for (const [k, v] of Object.entries(ys)) totals[k] = (totals[k] ?? 0) + v
  }
  const statuses = Array.from(allStatuses).sort((a, b) => (totals[b] ?? 0) - (totals[a] ?? 0))
  const rows = Object.entries(byYear)
    .map(([year, vals]) => {
      const row: Record<string, string | number> = { year }
      for (const s of statuses) row[s] = vals[s] ?? 0
      return row
    })
    .sort((a, b) => (a.year as string).localeCompare(b.year as string))
  return { rows, statuses }
}

function CustomTooltip({ active, payload, label, total, suffix }: {
  active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string; total: number; suffix?: string
}) {
  if (!active || !payload?.[0]) return null
  const value = payload[0].value
  const heading = label ?? payload[0].name ?? ''
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--text-primary)',
      }}
    >
      <p className="font-medium">{heading}</p>
      <p style={{ color: 'var(--text-tertiary)' }}>
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
        {' '}{suffix} · {pct}%
      </p>
    </div>
  )
}

function StackedTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, p) => sum + (p.value ?? 0), 0)
  const visible = payload.filter((p) => p.value > 0)
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs space-y-0.5"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--text-primary)',
        minWidth: 160,
      }}
    >
      <p className="font-medium">{label}</p>
      {visible.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
          <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: p.color }} aria-hidden="true" />
          <span className="flex-1">{p.name}</span>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.value}</span>
        </p>
      ))}
      <p className="pt-0.5 mt-1 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
        <span>Total</span>
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{total}</span>
      </p>
    </div>
  )
}

function ChartCard({ title, subtitle, ariaLabel, children, srTable, hint, interactive = false }: {
  title: string; subtitle?: string; ariaLabel: string; children: React.ReactNode; srTable?: React.ReactNode; hint?: string; interactive?: boolean
}) {
  const { t } = useLanguage()
  const [showData, setShowData] = useState(false)
  return (
    <div className="glass-panel rounded-lg p-5 sm:p-6 transition-all"
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-xl font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
          </div>
          {hint && <span className="shrink-0 whitespace-nowrap text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
        </div>
      </div>
      <div className="relative z-10" role={interactive ? 'group' : 'img'} aria-label={ariaLabel}>{children}</div>
      {srTable && (
        <>
          <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              aria-expanded={showData}
              onClick={() => setShowData((value) => !value)}
              className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors"
              style={{
                color: showData ? 'var(--accent-text)' : 'var(--text-secondary)',
                background: showData ? 'var(--accent-light)' : 'var(--bg-hover)',
                border: showData ? '1px solid var(--accent)' : '1px solid var(--border-color)',
              }}
            >
              {showData ? t('hide_chart_data') : t('view_chart_data')}
              <svg aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${showData ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div
              className={showData ? 'chart-data-table scroll-visible mt-3 max-h-72 overflow-auto rounded-lg p-2 text-xs' : 'sr-only'}
              style={showData ? { border: '1px solid var(--border-color)', background: 'var(--bg-base)' } : undefined}
            >
              {srTable}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function AnimatedBar({ width, delay, color = 'var(--accent)' }: { width: number; delay: number; color?: string }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  return (
    <div className="h-2 rounded-full" style={{ width: animated ? `${width}%` : '0%', background: color, transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
  )
}

function DonutCard({ title, subtitle, ariaLabel, srTable, slices, totalSystems, suffix }: {
  title: string
  subtitle?: string
  ariaLabel: string
  srTable?: React.ReactNode
  slices: Array<{ name: string; value: number; color: string }>
  totalSystems: number
  suffix: string
}) {
  return (
    <ChartCard title={title} subtitle={subtitle} ariaLabel={ariaLabel} srTable={srTable}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Tooltip content={<CustomTooltip total={totalSystems} suffix={suffix} />} />
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={slices.length > 1 ? 2 : 0}
            stroke="var(--bg-surface)"
            strokeWidth={2}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          >
            {slices.map((s, i) => <Cell key={i} fill={s.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        {slices.map((s) => (
          <li key={s.name} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm inline-block shrink-0" style={{ background: s.color }} aria-hidden="true" />
            <span>{s.name}</span>
            <span className="font-semibold tabular-nums" style={{ color: 'var(--text-secondary)' }}>{s.value}</span>
          </li>
        ))}
      </ul>
    </ChartCard>
  )
}

export default function Charts({ systems, onFilterStatus, onFilterDepartment, activeStatusFilter, activeDeptFilter }: Props) {
  const { lang, t, deptName } = useLanguage()
  const statusField = (lang === 'fr' ? 'ai_system_status_fr' : 'ai_system_status_en') as keyof AISystem
  const devByField = (lang === 'fr' ? 'developed_by_fr' : 'developed_by_en') as keyof AISystem

  const byStatus = useMemo(() => countStatuses(systems, statusField), [systems, statusField])
  const byDept = useMemo(() => countDepts(systems, 10, deptName), [systems, deptName])
  const byYear = useMemo(() => countByYear(systems), [systems])
  const pii = useMemo(() => countPii(systems), [systems])
  const devBy = useMemo(() => countDevBy(systems, devByField), [systems, devByField])
  const topVendors = useMemo(() => countTopVendors(systems, 10), [systems])
  const statusByYear = useMemo(() => countStatusByYear(systems, statusField), [systems, statusField])

  const maxDept = byDept[0]?.count ?? 1
  const maxVendor = topVendors[0]?.count ?? 1
  const totalSystems = systems.length

  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)
  const [hoveredYear, setHoveredYear] = useState<string | null>(null)
  const [hoveredDept, setHoveredDept] = useState<string | null>(null)
  const [hoveredVendor, setHoveredVendor] = useState<string | null>(null)

  if (systems.length === 0) return null

  const statusSrTable = (
    <table>
      <caption>{t('sr_status_caption')}</caption>
      <thead><tr><th scope="col">{t('status')}</th><th scope="col">{t('systems')}</th></tr></thead>
      <tbody>{byStatus.map((d) => <tr key={d.name}><td>{d.name}</td><td>{d.count}</td></tr>)}</tbody>
    </table>
  )

  const yearSrTable = (
    <table>
      <caption>{t('sr_year_caption')}</caption>
      <thead><tr><th scope="col">{t('col_year')}</th><th scope="col">{t('systems')}</th></tr></thead>
      <tbody>{byYear.map((d) => <tr key={d.year}><td>{d.year}</td><td>{d.count}</td></tr>)}</tbody>
    </table>
  )

  const deptSrTable = (
    <table>
      <caption>{t('sr_dept_caption')}</caption>
      <thead><tr><th scope="col">{t('department')}</th><th scope="col">{t('systems')}</th></tr></thead>
      <tbody>{byDept.map((d) => <tr key={d.fullName}><td>{d.fullName}</td><td>{d.count}</td></tr>)}</tbody>
    </table>
  )

  const piiSlices = pii.map((d) => ({
    name: d.key === 'Y' ? t('handles_personal_info')
        : d.key === 'N' ? t('no_personal_info')
        : t('pii_unknown'),
    value: d.count,
    color: PII_COLORS[d.key],
  }))

  const piiSrTable = (
    <table>
      <caption>{t('sr_pii_caption')}</caption>
      <thead><tr><th scope="col">{t('personal_data')}</th><th scope="col">{t('systems')}</th></tr></thead>
      <tbody>{piiSlices.map((d) => <tr key={d.name}><td>{d.name}</td><td>{d.value}</td></tr>)}</tbody>
    </table>
  )

  const devBySlices = devBy.map((d) => ({
    name: d.key === '__unknown__' ? t('dev_by_unknown') : d.key,
    value: d.count,
    color: DEV_BY_COLORS[d.key] ?? 'var(--text-muted)',
  }))

  const devBySrTable = (
    <table>
      <caption>{t('sr_dev_caption')}</caption>
      <thead><tr><th scope="col">{t('developed_by')}</th><th scope="col">{t('systems')}</th></tr></thead>
      <tbody>{devBySlices.map((d) => <tr key={d.name}><td>{d.name}</td><td>{d.value}</td></tr>)}</tbody>
    </table>
  )

  const vendorsSrTable = (
    <table>
      <caption>{t('sr_vendors_caption')}</caption>
      <thead><tr><th scope="col">{t('vendor')}</th><th scope="col">{t('systems')}</th></tr></thead>
      <tbody>{topVendors.map((d) => <tr key={d.name}><td>{d.name}</td><td>{d.count}</td></tr>)}</tbody>
    </table>
  )

  const statusYearSrTable = (
    <table>
      <caption>{t('sr_status_year_caption')}</caption>
      <thead>
        <tr>
          <th scope="col">{t('col_year')}</th>
          {statusByYear.statuses.map((s) => <th key={s} scope="col">{s}</th>)}
        </tr>
      </thead>
      <tbody>
        {statusByYear.rows.map((row) => (
          <tr key={String(row.year)}>
            <td>{String(row.year)}</td>
            {statusByYear.statuses.map((s) => <td key={s}>{row[s] as number}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )

  const axisTickStyle = { fontSize: 11 }
  const compactAxisLabel = (value: unknown) => {
    const label = String(value ?? '')
    return label.length > 16 ? `${label.slice(0, 15)}…` : label
  }

  return (
    <>
      <div className="mb-5 max-w-3xl reveal-soft">
        <p className="section-kicker mb-2">{lang === 'en' ? 'Registry signals' : 'Signaux du registre'}</p>
        <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
          {lang === 'en' ? 'A clearer read on how federal AI is showing up.' : 'Une lecture plus claire de la présence de l’IA fédérale.'}
        </h2>
      </div>
      {/* Row 1: Status, Year, Top Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ChartCard
          title={t('chart_status')}
          subtitle={lang === 'en' ? 'Current lifecycle stage of each system' : 'Étape actuelle du cycle de vie de chaque système'}
          ariaLabel={`${t('chart_status')}: ${byStatus.map((d) => `${d.name} ${d.count}`).join(', ')}`}
          srTable={statusSrTable}
          hint={onFilterStatus ? (lang === 'en' ? 'Click bars to filter' : 'Cliquez les barres pour filtrer') : undefined}
          interactive={Boolean(onFilterStatus)}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byStatus} margin={{ left: 14, right: 14, top: 8, bottom: 12 }}>
              <XAxis dataKey="name" tick={{ ...axisTickStyle, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval={0} height={36} tickFormatter={compactAxisLabel} />
              <YAxis tick={{ ...axisTickStyle, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={24} />
              <Tooltip content={<CustomTooltip total={totalSystems} suffix={t('systems')} />} cursor={{ fill: 'var(--bg-hover)', radius: 4 }} />
              <Bar
                dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}
                animationBegin={0} animationDuration={800} animationEasing="ease-out"
                style={{ cursor: onFilterStatus ? 'pointer' : 'default' }}
                onClick={(data) => {
                  if (onFilterStatus && data?.name) {
                    onFilterStatus(String(data.name))
                  }
                }}
                onMouseEnter={(_, index) => setHoveredStatus(byStatus[index]?.name ?? null)}
                onMouseLeave={() => setHoveredStatus(null)}
              >
                {byStatus.map((entry, i) => {
                  const isActive = activeStatusFilter ? entry.name === activeStatusFilter : true
                  const isHovered = hoveredStatus === entry.name
                  return <Cell key={i} fill={getStatusColor(entry.name)} fillOpacity={!isActive ? 0.3 : isHovered ? 1 : 0.85} stroke={isHovered ? getStatusColor(entry.name) : 'none'} strokeWidth={isHovered ? 2 : 0} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {onFilterStatus && (
            <div className="mt-2 flex flex-wrap gap-2" aria-label={t('filter_by_status')}>
              {byStatus.map((entry) => {
                const pressed = activeStatusFilter === entry.name
                return (
                  <button
                    key={entry.name}
                    type="button"
                    onClick={() => onFilterStatus(entry.name)}
                    aria-pressed={pressed}
                    className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                    style={{
                      background: pressed ? 'var(--accent-light)' : 'var(--bg-hover)',
                      color: pressed ? 'var(--accent-text)' : 'var(--text-secondary)',
                      border: pressed ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                    }}
                  >
                    {entry.name} <span className="tabular-nums">{entry.count}</span>
                  </button>
                )
              })}
            </div>
          )}
        </ChartCard>

        <ChartCard
          title={t('chart_year')}
          subtitle={lang === 'en' ? 'When systems were added to the registry' : 'Quand les systèmes ont été ajoutés au registre'}
          ariaLabel={`${t('chart_year')}: ${byYear.map((d) => `${d.year}: ${d.count}`).join(', ')}`}
          srTable={yearSrTable}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byYear} margin={{ left: 4, right: 4, top: 8, bottom: 8 }}>
              <XAxis dataKey="year" tick={{ ...axisTickStyle, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ ...axisTickStyle, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={24} />
              <Tooltip content={<CustomTooltip total={totalSystems} suffix={t('systems_added')} />} cursor={{ fill: 'var(--bg-hover)', radius: 4 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40} fill="var(--accent)" animationBegin={200} animationDuration={800} animationEasing="ease-out"
                onMouseEnter={(_, index) => setHoveredYear(byYear[index]?.year ?? null)}
                onMouseLeave={() => setHoveredYear(null)}
              >
                {byYear.map((entry, i) => {
                  const isHovered = hoveredYear === entry.year
                  return <Cell key={i} fill="var(--accent)" fillOpacity={isHovered ? 1 : 0.75} stroke={isHovered ? 'var(--accent)' : 'none'} strokeWidth={isHovered ? 2 : 0} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={t('chart_departments')}
          subtitle={lang === 'en' ? 'Federal departments with the most AI systems' : 'Ministères fédéraux avec le plus de systèmes d\'IA'}
          ariaLabel={`${t('chart_departments')}: ${byDept.map((d) => `${d.fullName} ${d.count}`).join(', ')}`}
          srTable={deptSrTable}
          hint={onFilterDepartment ? (lang === 'en' ? 'Click rows to filter' : 'Cliquez les lignes pour filtrer') : undefined}
          interactive={Boolean(onFilterDepartment)}
        >
          <div className="space-y-2">
            {byDept.map(({ fullName, fullOrg, label, count }, i) => {
              const isHovered = hoveredDept === fullName
              const isActive = activeDeptFilter ? fullOrg === activeDeptFilter || activeDeptFilter.includes(fullName) : true
              return (
                <button
                  key={fullName}
                  type="button"
                  className="flex w-full items-center gap-3 px-2 py-1.5 rounded-lg text-left transition-colors"
                  style={{ cursor: onFilterDepartment ? 'pointer' : 'default', background: isHovered ? 'var(--bg-hover)' : 'transparent', opacity: !isActive ? 0.4 : 1 }}
                  disabled={!onFilterDepartment}
                  aria-label={onFilterDepartment ? `${t('filter_by')} ${fullName}` : undefined}
                  aria-pressed={activeDeptFilter === fullOrg}
                  onMouseEnter={() => setHoveredDept(fullName)}
                  onMouseLeave={() => setHoveredDept(null)}
                  onClick={() => {
                    if (onFilterDepartment) {
                      const match = systems.find((s) => deptName(s.government_organization) === fullName)
                      if (match) onFilterDepartment(match.government_organization)
                    }
                  }}
                >
                  <div className="text-xs shrink-0 truncate" style={{ width: '40%', color: isHovered ? 'var(--text-primary)' : 'var(--text-tertiary)' }} title={fullName}>{label}</div>
                  <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: 'var(--bg-hover-strong)' }}>
                    <AnimatedBar width={Math.round((count / maxDept) * 100)} delay={i * 60} />
                  </div>
                  <div className="text-xs font-semibold w-7 text-right shrink-0 tabular-nums" style={{ color: isHovered ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{count}</div>
                </button>
              )
            })}
          </div>
        </ChartCard>
      </div>

      {/* Row 2: PII donut, Dev-by donut, Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <DonutCard
          title={t('chart_pii')}
          subtitle={lang === 'en' ? 'Systems processing personally identifiable information' : 'Systèmes traitant des renseignements personnels'}
          ariaLabel={`${t('chart_pii')}: ${piiSlices.map((d) => `${d.name} ${d.value}`).join(', ')}`}
          srTable={piiSrTable}
          slices={piiSlices}
          totalSystems={totalSystems}
          suffix={t('systems')}
        />

        <DonutCard
          title={t('chart_dev_by')}
          subtitle={lang === 'en' ? 'Who developed each system' : 'Qui a développé chaque système'}
          ariaLabel={`${t('chart_dev_by')}: ${devBySlices.map((d) => `${d.name} ${d.value}`).join(', ')}`}
          srTable={devBySrTable}
          slices={devBySlices}
          totalSystems={totalSystems}
          suffix={t('systems')}
        />

        <ChartCard
          title={t('chart_vendors')}
          subtitle={lang === 'en' ? 'Most frequently listed technology providers' : 'Fournisseurs de technologie les plus fréquemment cités'}
          ariaLabel={`${t('chart_vendors')}: ${topVendors.map((d) => `${d.name} ${d.count}`).join(', ')}`}
          srTable={vendorsSrTable}
        >
          <div className="space-y-2" aria-hidden="true">
            {topVendors.map(({ name, label, count }, i) => {
              const isHovered = hoveredVendor === name
              return (
                <div
                  key={name}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors"
                  style={{ background: isHovered ? 'var(--bg-hover)' : 'transparent' }}
                  onMouseEnter={() => setHoveredVendor(name)}
                  onMouseLeave={() => setHoveredVendor(null)}
                >
                  <div className="text-xs shrink-0 truncate" style={{ width: '40%', color: isHovered ? 'var(--text-primary)' : 'var(--text-tertiary)' }} title={name}>{label}</div>
                  <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: 'var(--bg-hover-strong)' }}>
                    <AnimatedBar width={Math.round((count / maxVendor) * 100)} delay={i * 60} />
                  </div>
                  <div className="text-xs font-semibold w-7 text-right shrink-0 tabular-nums" style={{ color: isHovered ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{count}</div>
                </div>
              )
            })}
          </div>
        </ChartCard>
      </div>

      {/* Row 3: Status × Year stacked bar (full width) */}
      <div className="mb-5">
        <ChartCard
          title={t('chart_status_year')}
          subtitle={lang === 'en' ? 'How system statuses have changed over time' : 'Comment les états des systèmes ont évolué dans le temps'}
          ariaLabel={`${t('chart_status_year')}: ${statusByYear.statuses.join(', ')}`}
          srTable={statusYearSrTable}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusByYear.rows} margin={{ left: 4, right: 4, top: 8, bottom: 8 }}>
              <XAxis dataKey="year" tick={{ ...axisTickStyle, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ ...axisTickStyle, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={28} />
              <Tooltip content={<StackedTooltip />} cursor={{ fill: 'var(--bg-hover)', radius: 4 }} />
              {statusByYear.statuses.map((status, i) => (
                <Bar
                  key={status}
                  dataKey={status}
                  stackId="s"
                  fill={getStatusColor(status)}
                  fillOpacity={0.9}
                  radius={i === statusByYear.statuses.length - 1 ? [4, 4, 0, 0] : 0}
                  maxBarSize={40}
                  animationBegin={i * 80}
                  animationDuration={700}
                  animationEasing="ease-out"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {statusByYear.statuses.map((s) => (
              <li key={s} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm inline-block shrink-0" style={{ background: getStatusColor(s) }} aria-hidden="true" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>
    </>
  )
}
