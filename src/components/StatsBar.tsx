import { AISystem } from '@/lib/types'

interface Props {
  systems: AISystem[]
  lastModified?: string | null
}

interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  accent?: string
}

function StatCard({ label, value, sub, accent = 'text-slate-800' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex-1 min-w-0">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-xs font-medium text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function StatsBar({ systems, lastModified }: Props) {
  const formattedDate = lastModified
    ? new Date(lastModified).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : null
  const total = systems.length
  const inProduction = systems.filter((s) =>
    s.ai_system_status_en?.toLowerCase().includes('production')
  ).length
  const hasPersonalData = systems.filter((s) => s.involves_personal_information === 'Y').length
  const vendorBuilt = systems.filter((s) =>
    s.developed_by_en?.toLowerCase().includes('vendor') ||
    s.developed_by_en?.toLowerCase().includes('third')
  ).length
  const piiSystems = systems.filter((s) => s.involves_personal_information === 'Y').length
  const notifiedOfPii = systems.filter(
    (s) => s.involves_personal_information === 'Y' && s.notification_ai === 'Y'
  ).length

  return (
    <div className="bg-slate-100 border-b border-slate-200 px-4 py-3">
      <div className="max-w-screen-2xl mx-auto flex gap-3 items-stretch">
        <StatCard label="Total Systems" value={total} sub="across all departments" />
        <StatCard label="In Production" value={inProduction} accent="text-green-700"
          sub={`${Math.round((inProduction / total) * 100)}% of total`} />
        <StatCard label="Handle Personal Data" value={hasPersonalData} accent="text-orange-600"
          sub={`${Math.round((hasPersonalData / total) * 100)}% of total`} />
        <StatCard label="Vendor-Built" value={vendorBuilt} accent="text-blue-700"
          sub={`${Math.round((vendorBuilt / total) * 100)}% of total`} />
        <StatCard label="Notify Users (of PII)" value={`${notifiedOfPii}/${piiSystems}`} accent="text-purple-700"
          sub={`${piiSystems > 0 ? Math.round((notifiedOfPii / piiSystems) * 100) : 0}% compliance`} />
        {formattedDate && (
          <div className="ml-auto text-xs text-slate-400 shrink-0 self-end pb-1">
            Registry last updated: <span className="font-medium text-slate-500">{formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  )
}
