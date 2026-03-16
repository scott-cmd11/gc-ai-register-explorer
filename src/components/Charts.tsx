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

function countStatuses(systems: AISystem[], statusField: keyof AISystem) {
  const counts: Record<string, number> = {}
  for (const s of systems) {
    const raw = (s[statusField] as string)?.trim()
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
    const year = s.status_date?.trim().slice(0, 4)
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
    const full = s.government_organization?.trim()
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

function CustomTooltip({ active, payload, label, total, suffix }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string; total: number; suffix?: string
}) {
  if (!active || !payload?.[0]) return null
  const value = payload[0].value
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
      <p className="font-medium">{label}</p>
      <p style={{ color: 'var(--text-tertiary)' }}>
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
        {' '}{suffix} · {pct}%
      </p>
    </div>
  )
}

function ChartCard({ title, ariaLabel, children, srTable, hint }: {
  title: string; ariaLabel: string; children: React.ReactNode; srTable?: React.ReactNode; hint?: string
}) {
  return (
    <div className="rounded-lg p-5 transition-colors" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
        {hint && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>{hint}</span>}
      </div>
      <div role="img" aria-label={ariaLabel}>{children}</div>
      {srTable && <div className="sr-only">{srTable}</div>}
    </div>
  )
}

function AnimatedBar({ width, delay }: { width: number; delay: number }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  return (
    <div className="h-1.5 rounded-full" style={{ width: animated ? `${width}%` : '0%', background: 'var(--accent)', transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
  )
}

export default function Charts({ systems, onFilterStatus, onFilterDepartment, activeStatusFilter, activeDeptFilter }: Props) {
  const { lang, t, deptName } = useLanguage()
  const statusField = (lang === 'fr' ? 'ai_system_status_fr' : 'ai_system_status_en') as keyof AISystem

  const byStatus = useMemo(() => countStatuses(systems, statusField), [systems, statusField])
  const byDept = useMemo(() => countDepts(systems, 10, deptName), [systems, deptName])
  const byYear = useMemo(() => countByYear(systems), [systems])
  const maxDept = byDept[0]?.count ?? 1
  const totalSystems = systems.length

  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)
  const [hoveredYear, setHoveredYear] = useState<string | null>(null)
  const [hoveredDept, setHoveredDept] = useState<string | null>(null)

  if (systems.length === 0) return null

  const statusSrTable = (
    <table>
      <caption>{t('sr_status_caption')}</caption>
      <thead><tr><th scope="col">{t('status')}</th><th scope="col">{t('col_year')}</th></tr></thead>
      <tbody>{byStatus.map((d) => <tr key={d.name}><td>{d.name}</td><td>{d.count}</td></tr>)}</tbody>
    </table>
  )

  const yearSrTable = (
    <table>
      <caption>{t('sr_year_caption')}</caption>
      <thead><tr><th scope="col">{t('col_year')}</th><th scope="col">{t('col_status')}</th></tr></thead>
      <tbody>{byYear.map((d) => <tr key={d.year}><td>{d.year}</td><td>{d.count}</td></tr>)}</tbody>
    </table>
  )

  const deptSrTable = (
    <table>
      <caption>{t('sr_dept_caption')}</caption>
      <thead><tr><th scope="col">{t('department')}</th><th scope="col">{t('col_status')}</th></tr></thead>
      <tbody>{byDept.map((d) => <tr key={d.fullName}><td>{d.fullName}</td><td>{d.count}</td></tr>)}</tbody>
    </table>
  )

  const axisTickStyle = { fontSize: 11 }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
      <ChartCard
        title={t('chart_status')}
        ariaLabel={`${t('chart_status')}: ${byStatus.map((d) => `${d.name} ${d.count}`).join(', ')}`}
        srTable={statusSrTable}
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byStatus} margin={{ left: 4, right: 4, top: 8, bottom: 40 }}>
            <XAxis dataKey="name" tick={{ ...axisTickStyle, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" interval={0} />
            <YAxis tick={{ ...axisTickStyle, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={24} />
            <Tooltip content={<CustomTooltip total={totalSystems} suffix={t('systems')} />} cursor={{ fill: 'var(--bg-hover)', radius: 4 }} />
            <Bar
              dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}
              animationBegin={0} animationDuration={800} animationEasing="ease-out"
              style={{ cursor: onFilterStatus ? 'pointer' : 'default' }}
              onClick={(data) => {
                if (onFilterStatus && data?.name) {
                  const match = systems.find((s) => {
                    const raw = (s[statusField] as string)?.trim()
                    if (!raw) return false
                    const key = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
                    return key === data.name
                  })
                  if (match) onFilterStatus(match[statusField] as string)
                }
              }}
              onMouseEnter={(_, index) => setHoveredStatus(byStatus[index]?.name ?? null)}
              onMouseLeave={() => setHoveredStatus(null)}
            >
              {byStatus.map((entry, i) => {
                const isActive = activeStatusFilter ? entry.name.toLowerCase().includes(activeStatusFilter.toLowerCase()) : true
                const isHovered = hoveredStatus === entry.name
                return <Cell key={i} fill={getStatusColor(entry.name)} fillOpacity={!isActive ? 0.3 : isHovered ? 1 : 0.85} stroke={isHovered ? getStatusColor(entry.name) : 'none'} strokeWidth={isHovered ? 2 : 0} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title={t('chart_year')}
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
        ariaLabel={`${t('chart_departments')}: ${byDept.map((d) => `${d.fullName} ${d.count}`).join(', ')}`}
        srTable={deptSrTable}
      >
        <div className="space-y-1.5" aria-hidden="true">
          {byDept.map(({ fullName, fullOrg, label, count }, i) => {
            const isHovered = hoveredDept === fullName
            const isActive = activeDeptFilter ? fullOrg === activeDeptFilter || activeDeptFilter.includes(fullName) : true
            return (
              <div
                key={fullName}
                className="flex items-center gap-2.5 px-1.5 py-1 rounded-md transition-colors"
                style={{ cursor: onFilterDepartment ? 'pointer' : 'default', background: isHovered ? 'var(--bg-hover)' : 'transparent', opacity: !isActive ? 0.4 : 1 }}
                tabIndex={onFilterDepartment ? 0 : undefined}
                role={onFilterDepartment ? 'button' : undefined}
                aria-label={onFilterDepartment ? `${t('filter_by')} ${fullName}` : undefined}
                onMouseEnter={() => setHoveredDept(fullName)}
                onMouseLeave={() => setHoveredDept(null)}
                onClick={() => {
                  if (onFilterDepartment) {
                    const match = systems.find((s) => deptName(s.government_organization) === fullName)
                    if (match) onFilterDepartment(match.government_organization)
                  }
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && onFilterDepartment) {
                    e.preventDefault()
                    const match = systems.find((s) => deptName(s.government_organization) === fullName)
                    if (match) onFilterDepartment(match.government_organization)
                  }
                }}
              >
                <div className="text-xs shrink-0 truncate" style={{ width: '40%', color: isHovered ? 'var(--text-primary)' : 'var(--text-tertiary)' }} title={fullName}>{label}</div>
                <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--bg-hover-strong)' }}>
                  <AnimatedBar width={Math.round((count / maxDept) * 100)} delay={i * 60} />
                </div>
                <div className="text-xs font-medium w-6 text-right shrink-0" style={{ color: isHovered ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{count}</div>
              </div>
            )
          })}
        </div>
      </ChartCard>
    </div>
  )
}
