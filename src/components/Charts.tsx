'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
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

function countStatuses(systems: AISystem[]) {
  const counts: Record<string, number> = {}
  for (const s of systems) {
    const raw = s.ai_system_status_en?.trim()
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

function countDepts(systems: AISystem[], limit = 10) {
  const counts: Record<string, { count: number; label: string }> = {}
  for (const s of systems) {
    const full = s.government_organization?.trim()
    if (!full) continue
    const en = full.split(' / ')[0].trim()
    const label = en.length > 28 ? en.slice(0, 26) + '…' : en
    if (!counts[en]) counts[en] = { count: 0, label }
    counts[en].count++
  }
  return Object.entries(counts)
    .map(([fullName, { count, label }]) => ({ fullName, label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// ── Custom Tooltip ──────────────────────────────────────────────────────────

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
        {' '}{suffix || 'systems'} · {pct}%
      </p>
    </div>
  )
}

// ── Chart Card ──────────────────────────────────────────────────────────────

function ChartCard({
  title,
  ariaLabel,
  children,
  srTable,
  hint,
}: {
  title: string
  ariaLabel: string
  children: React.ReactNode
  srTable?: React.ReactNode
  hint?: string
}) {
  return (
    <div
      className="rounded-lg p-5 transition-colors"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </h3>
        {hint && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
            {hint}
          </span>
        )}
      </div>
      <div role="img" aria-label={ariaLabel}>
        {children}
      </div>
      {srTable && <div className="sr-only">{srTable}</div>}
    </div>
  )
}

// ── Animated Progress Bar ───────────────────────────────────────────────────

function AnimatedBar({ width, delay }: { width: number; delay: number }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  return (
    <div
      className="h-1.5 rounded-full"
      style={{
        width: animated ? `${width}%` : '0%',
        background: 'var(--accent)',
        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    />
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function Charts({ systems, onFilterStatus, onFilterDepartment, activeStatusFilter, activeDeptFilter }: Props) {
  const byStatus = useMemo(() => countStatuses(systems), [systems])
  const byDept = useMemo(() => countDepts(systems, 10), [systems])
  const byYear = useMemo(() => countByYear(systems), [systems])
  const maxDept = byDept[0]?.count ?? 1
  const totalSystems = systems.length

  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)
  const [hoveredYear, setHoveredYear] = useState<string | null>(null)
  const [hoveredDept, setHoveredDept] = useState<string | null>(null)

  if (systems.length === 0) return null

  const statusSrTable = (
    <table>
      <caption>Systems by status</caption>
      <thead><tr><th scope="col">Status</th><th scope="col">Count</th></tr></thead>
      <tbody>{byStatus.map((d) => <tr key={d.name}><td>{d.name}</td><td>{d.count}</td></tr>)}</tbody>
    </table>
  )

  const yearSrTable = (
    <table>
      <caption>Systems by year</caption>
      <thead><tr><th scope="col">Year</th><th scope="col">Count</th></tr></thead>
      <tbody>{byYear.map((d) => <tr key={d.year}><td>{d.year}</td><td>{d.count}</td></tr>)}</tbody>
    </table>
  )

  const deptSrTable = (
    <table>
      <caption>Top 10 departments by system count</caption>
      <thead><tr><th scope="col">Department</th><th scope="col">Count</th></tr></thead>
      <tbody>{byDept.map((d) => <tr key={d.fullName}><td>{d.fullName}</td><td>{d.count}</td></tr>)}</tbody>
    </table>
  )

  const axisTickStyle = { fontSize: 11 }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
      {/* Status bar chart */}
      <ChartCard
        title="Systems by Status"
        ariaLabel={`Bar chart: ${byStatus.map((d) => `${d.name} ${d.count}`).join(', ')}`}
        srTable={statusSrTable}
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={byStatus}
            margin={{ left: 4, right: 4, top: 8, bottom: 40 }}
          >
            <XAxis dataKey="name" tick={{ ...axisTickStyle, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" interval={0} />
            <YAxis tick={{ ...axisTickStyle, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={24} />
            <Tooltip
              content={<CustomTooltip total={totalSystems} />}
              cursor={{ fill: 'var(--bg-hover)', radius: 4 }}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
              style={{ cursor: onFilterStatus ? 'pointer' : 'default' }}
              onClick={(data) => {
                if (onFilterStatus && data?.name) {
                  const match = systems.find((s) => {
                    const raw = s.ai_system_status_en?.trim()
                    if (!raw) return false
                    const key = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
                    return key === data.name
                  })
                  if (match) onFilterStatus(match.ai_system_status_en)
                }
              }}
              onMouseEnter={(_, index) => setHoveredStatus(byStatus[index]?.name ?? null)}
              onMouseLeave={() => setHoveredStatus(null)}
            >
              {byStatus.map((entry, i) => {
                const isActive = activeStatusFilter
                  ? entry.name.toLowerCase().includes(activeStatusFilter.toLowerCase())
                  : true
                const isHovered = hoveredStatus === entry.name
                return (
                  <Cell
                    key={i}
                    fill={getStatusColor(entry.name)}
                    fillOpacity={!isActive ? 0.3 : isHovered ? 1 : 0.85}
                    stroke={isHovered ? getStatusColor(entry.name) : 'none'}
                    strokeWidth={isHovered ? 2 : 0}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Year timeline */}
      <ChartCard
        title="Systems by Year"
        ariaLabel={`Bar chart of systems by year: ${byYear.map((d) => `${d.year}: ${d.count}`).join(', ')}`}
        srTable={yearSrTable}
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byYear} margin={{ left: 4, right: 4, top: 8, bottom: 8 }}>
            <XAxis dataKey="year" tick={{ ...axisTickStyle, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ ...axisTickStyle, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={24} />
            <Tooltip
              content={<CustomTooltip total={totalSystems} suffix="systems added" />}
              cursor={{ fill: 'var(--bg-hover)', radius: 4 }}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              fill="var(--accent)"
              animationBegin={200}
              animationDuration={800}
              animationEasing="ease-out"
              onMouseEnter={(_, index) => setHoveredYear(byYear[index]?.year ?? null)}
              onMouseLeave={() => setHoveredYear(null)}
            >
              {byYear.map((entry, i) => {
                const isHovered = hoveredYear === entry.year
                return (
                  <Cell
                    key={i}
                    fill="var(--accent)"
                    fillOpacity={isHovered ? 1 : 0.75}
                    stroke={isHovered ? 'var(--accent)' : 'none'}
                    strokeWidth={isHovered ? 2 : 0}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Departments ranked list */}
      <ChartCard
        title="Top Departments"
        ariaLabel={`Top departments: ${byDept.map((d) => `${d.fullName} ${d.count}`).join(', ')}`}
        srTable={deptSrTable}
      >
        <div className="space-y-1.5" aria-hidden="true">
          {byDept.map(({ fullName, label, count }, i) => {
            const isHovered = hoveredDept === fullName
            const isActive = activeDeptFilter ? fullName === activeDeptFilter || activeDeptFilter.includes(fullName) : true
            return (
              <div
                key={fullName}
                className="flex items-center gap-2.5 px-1.5 py-1 rounded-md transition-colors"
                style={{
                  cursor: onFilterDepartment ? 'pointer' : 'default',
                  background: isHovered ? 'var(--bg-hover)' : 'transparent',
                  opacity: !isActive ? 0.4 : 1,
                }}
                onMouseEnter={() => setHoveredDept(fullName)}
                onMouseLeave={() => setHoveredDept(null)}
                onClick={() => {
                  if (onFilterDepartment) {
                    // Find the original department value
                    const match = systems.find((s) => {
                      const en = s.government_organization?.split(' / ')[0]?.trim()
                      return en === fullName
                    })
                    if (match) onFilterDepartment(match.government_organization)
                  }
                }}
              >
                <div className="text-xs shrink-0 truncate" style={{ width: '40%', color: isHovered ? 'var(--text-primary)' : 'var(--text-tertiary)' }} title={fullName}>
                  {label}
                </div>
                <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--bg-hover-strong)' }}>
                  <AnimatedBar width={Math.round((count / maxDept) * 100)} delay={i * 60} />
                </div>
                <div className="text-xs font-medium w-6 text-right shrink-0" style={{ color: isHovered ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                  {count}
                </div>
              </div>
            )
          })}
        </div>
      </ChartCard>
    </div>
  )
}
