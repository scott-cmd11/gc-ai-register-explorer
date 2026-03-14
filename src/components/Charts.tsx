'use client'

import { useMemo } from 'react'
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
}

const STATUS_COLORS: Record<string, string> = {
  production: '#16a34a',
  development: '#ca8a04',
  pilot: '#2563eb',
  proof: '#7c3aed',
  decommission: '#dc2626',
  retired: '#9f1239',
}

function getStatusColor(status: string) {
  const s = status?.toLowerCase() ?? ''
  for (const [key, color] of Object.entries(STATUS_COLORS)) {
    if (s.includes(key)) return color
  }
  return '#94a3b8'
}

// Normalize mixed-case status values and merge duplicates
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

// Systems by year (from status_date)
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

// Top departments — English name only, truncated for labels
function countDepts(systems: AISystem[], limit = 10) {
  const counts: Record<string, { count: number; label: string }> = {}
  for (const s of systems) {
    const full = s.government_organization?.trim()
    if (!full) continue
    const en = full.split(' / ')[0].trim()
    // Short label for the bar: first meaningful words
    const label = en.length > 28 ? en.slice(0, 26) + '…' : en
    if (!counts[en]) counts[en] = { count: 0, label }
    counts[en].count++
  }
  return Object.entries(counts)
    .map(([fullName, { count, label }]) => ({ fullName, label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function Charts({ systems }: Props) {
  const byStatus = useMemo(() => countStatuses(systems), [systems])
  const byDept = useMemo(() => countDepts(systems, 10), [systems])
  const byYear = useMemo(() => countByYear(systems), [systems])
  const maxDept = byDept[0]?.count ?? 1

  if (systems.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      {/* Status — vertical bar chart, labels below bars */}
      <ChartCard title="Systems by Status">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={byStatus}
            margin={{ left: 8, right: 8, top: 8, bottom: 40 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              angle={-20}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip
              formatter={(v) => [v, 'Systems']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {byStatus.map((entry, i) => (
                <Cell key={i} fill={getStatusColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Year timeline */}
      <ChartCard title="Systems by Year">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byYear} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={28} />
            <Tooltip
              formatter={(v) => [v, 'Systems']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48} fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Departments — CSS ranked list, works at any width */}
      <ChartCard title="Top Departments">
        <div className="space-y-2.5">
          {byDept.map(({ fullName, label, count }) => (
            <div key={fullName} className="flex items-center gap-2.5">
              <div
                className="text-xs text-slate-600 shrink-0 truncate"
                style={{ width: '38%' }}
                title={fullName}
              >
                {label}
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.round((count / maxDept) * 100)}%` }}
                />
              </div>
              <div className="text-xs font-medium text-slate-500 w-6 text-right shrink-0">
                {count}
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}
