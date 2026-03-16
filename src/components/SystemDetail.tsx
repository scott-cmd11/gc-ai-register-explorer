'use client'

import { useEffect, useRef } from 'react'
import { AISystem } from '@/lib/types'
import { useLanguage } from '@/lib/i18n'

interface Props {
  system: AISystem
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null
  return (
    <div className="mb-3">
      {label && <dt className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</dt>}
      <dd className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{value}</dd>
    </div>
  )
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'accent' | 'success' | 'warning' | 'info' }) {
  const styles = {
    default: { background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' },
    accent: { background: 'var(--accent-light)', color: 'var(--accent-text)', border: '1px solid transparent' },
    success: { background: 'var(--status-production-bg)', color: 'var(--status-production-text)', border: '1px solid transparent' },
    warning: { background: 'var(--status-development-bg)', color: 'var(--status-development-text)', border: '1px solid transparent' },
    info: { background: 'var(--status-pilot-bg)', color: 'var(--status-pilot-text)', border: '1px solid transparent' },
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium" style={styles[variant]}>
      {children}
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? ''
  const variant = s.includes('production') ? 'success'
    : s.includes('development') ? 'warning'
    : s.includes('pilot') || s.includes('proof') ? 'info'
    : 'default' as const
  return (
    <Badge variant={variant}>
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'currentColor' }} aria-hidden="true" />
      {status || '—'}
    </Badge>
  )
}

export default function SystemDetail({ system: s, onClose }: Props) {
  const { t, field, deptName } = useLanguage()
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = 'system-detail-title'

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
    panelRef.current?.focus()
    return () => { previousFocusRef.current?.focus() }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'))
      if (focusable.length === 0) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus() } }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const name = field(s, 'name_ai_system')
  const status = field(s, 'ai_system_status')

  return (
    <>
      <div className="fixed inset-0 z-40 animate-fade-in" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} aria-hidden="true" />

      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        className="fixed top-0 right-0 h-full w-full max-w-xl z-50 flex flex-col animate-slide-in-right focus:outline-none transition-colors"
        style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between gap-4 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="min-w-0">
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent)' }}>{s.ai_register_id}</p>
            <h2 id={titleId} className="text-lg font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
              {name}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{deptName(s.government_organization)}</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md flex items-center justify-center shrink-0 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            aria-label={t('close_panel')}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status strip */}
        <div className="px-6 py-3 flex flex-wrap gap-2 shrink-0" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-base)' }}>
          <StatusPill status={status} />
          {s.status_date && <Badge>{s.status_date}</Badge>}
          <Badge variant={s.involves_personal_information === 'Y' ? 'accent' : 'default'}>
            {s.involves_personal_information === 'Y' ? t('handles_personal_data') : t('no_personal_data_badge')}
          </Badge>
          {s.notification_ai === 'Y' && <Badge variant="info">{t('users_notified')}</Badge>}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Section title={t('overview')}>
            <dl>
              <Field label={t('description')} value={field(s, 'description_ai_system')} />
              <Field label={t('primary_users')} value={field(s, 'ai_system_primary_users')} />
            </dl>
          </Section>
          <Section title={t('technical_details')}>
            <dl>
              {field(s, 'developed_by') && <div className="mb-3 flex gap-3"><dt className="text-xs font-medium w-28 shrink-0 pt-0.5" style={{ color: 'var(--text-muted)' }}>{t('developed_by')}</dt><dd className="text-sm" style={{ color: 'var(--text-secondary)' }}>{field(s, 'developed_by')}</dd></div>}
              {s.vendor_information && <div className="mb-3 flex gap-3"><dt className="text-xs font-medium w-28 shrink-0 pt-0.5" style={{ color: 'var(--text-muted)' }}>{t('vendor')}</dt><dd className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.vendor_information}</dd></div>}
              <Field label={t('capabilities')} value={field(s, 'ai_system_capabilities')} />
              <Field label={t('data_sources')} value={field(s, 'data_sources')} />
            </dl>
          </Section>
          {(s.involves_personal_information === 'Y' || field(s, 'personal_information_banks')) && (
            <Section title={t('privacy')}><dl><Field label={t('personal_info_banks')} value={field(s, 'personal_information_banks')} /></dl></Section>
          )}
          {field(s, 'ai_system_results') && (
            <Section title={t('results_benefits')}><dl><Field label="" value={field(s, 'ai_system_results')} /></dl></Section>
          )}
        </div>
      </div>
    </>
  )
}
