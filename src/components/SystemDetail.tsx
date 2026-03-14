import { useEffect } from 'react'
import { AISystem } from '@/lib/types'

interface Props {
  system: AISystem
  onClose: () => void
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null
  return (
    <div className="mb-3">
      <dt className="text-xs text-slate-400 mb-0.5">{label}</dt>
      <dd className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{value}</dd>
    </div>
  )
}

function PillBadge({ value, trueLabel, falseLabel }: { value?: string; trueLabel: string; falseLabel: string }) {
  const isYes = value === 'Y'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
      isYes ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isYes ? 'bg-orange-500' : 'bg-slate-400'}`} />
      {isYes ? trueLabel : falseLabel}
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? ''
  const { dot, cls } = s.includes('production')
    ? { dot: 'bg-green-500', cls: 'bg-green-50 text-green-800 border-green-200' }
    : s.includes('development')
    ? { dot: 'bg-yellow-500', cls: 'bg-yellow-50 text-yellow-800 border-yellow-200' }
    : s.includes('pilot') || s.includes('proof')
    ? { dot: 'bg-blue-500', cls: 'bg-blue-50 text-blue-800 border-blue-200' }
    : { dot: 'bg-slate-400', cls: 'bg-slate-50 text-slate-700 border-slate-200' }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status || '—'}
    </span>
  )
}

export default function SystemDetail({ system: s, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-mono mb-1">{s.ai_register_id}</p>
            <h2 className="text-base font-semibold leading-snug">{s.name_ai_system_en || s.name_ai_system_fr}</h2>
            <p className="text-sm text-slate-300 mt-1">{s.government_organization}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg leading-none mt-0.5 shrink-0 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Status strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap gap-2">
          <StatusPill status={s.ai_system_status_en} />
          {s.status_date && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              {s.status_date}
            </span>
          )}
          <PillBadge value={s.involves_personal_information} trueLabel="Handles personal data" falseLabel="No personal data" />
          {s.notification_ai === 'Y' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Users notified
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Overview */}
          <Section icon="📋" title="Overview">
            <Field label="Description" value={s.description_ai_system_en} />
            <Field label="Primary Users" value={s.ai_system_primary_users_en} />
          </Section>

          {/* Technical */}
          <Section icon="⚙️" title="Technical">
            <dl>
              {s.developed_by_en && (
                <div className="mb-3 flex gap-3">
                  <dt className="text-xs text-slate-400 w-28 shrink-0 pt-0.5">Developed by</dt>
                  <dd className="text-sm text-slate-700">{s.developed_by_en}</dd>
                </div>
              )}
              {s.vendor_information && (
                <div className="mb-3 flex gap-3">
                  <dt className="text-xs text-slate-400 w-28 shrink-0 pt-0.5">Vendor</dt>
                  <dd className="text-sm text-slate-700">{s.vendor_information}</dd>
                </div>
              )}
            </dl>
            <Field label="Capabilities" value={s.ai_system_capabilities_en} />
            <Field label="Data Sources" value={s.data_sources_en} />
          </Section>

          {/* Privacy */}
          {(s.involves_personal_information === 'Y' || s.personal_information_banks_en) && (
            <Section icon="🔒" title="Privacy">
              <Field label="Personal Information Banks" value={s.personal_information_banks_en} />
            </Section>
          )}

          {/* Outcomes */}
          {s.ai_system_results_en && (
            <Section icon="📈" title="Results & Benefits">
              <Field label="" value={s.ai_system_results_en} />
            </Section>
          )}
        </div>
      </div>
    </>
  )
}
