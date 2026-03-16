'use client'

import { useEffect, useState, useRef } from 'react'
import { AISystem } from '@/lib/types'
import { useLanguage } from '@/lib/i18n'

interface Props {
  systems: AISystem[]
  lastModified?: string | null
}

function useAnimatedCount(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  const prevTarget = useRef(0)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = prevTarget.current
    prevTarget.current = target
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(start + (target - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return count
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const animatedValue = useAnimatedCount(value)

  return (
    <div
      className="flex-1 min-w-[140px] rounded-lg p-4 transition-all group"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.boxShadow = '0 0 0 1px var(--ring)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="transition-colors" style={{ color: 'var(--text-muted)' }}>{icon}</span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </span>
      </div>
      <div className="text-2xl font-semibold tracking-tight tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {animatedValue}
      </div>
    </div>
  )
}

export default function StatsBar({ systems, lastModified }: Props) {
  const { lang, t } = useLanguage()

  const formattedDate = lastModified
    ? new Date(lastModified).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
    : null

  const total = systems.length
  const depts = new Set(systems.map((s) => s.government_organization).filter(Boolean)).size
  const inProduction = systems.filter((s) =>
    s.ai_system_status_en?.toLowerCase().includes('production')
  ).length
  const hasPersonalData = systems.filter((s) => s.involves_personal_information === 'Y').length

  return (
    <div className="max-w-screen-2xl mx-auto w-full px-6 py-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label={t('stat_total')}
          value={total}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          }
        />
        <MetricCard
          label={t('stat_production')}
          value={inProduction}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          label={t('stat_pii')}
          value={hasPersonalData}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          }
        />
        <MetricCard
          label={t('stat_departments')}
          value={depts}
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          }
        />
      </div>
      {formattedDate && (
        <p className="mt-4 text-xs max-w-3xl leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>{t('last_updated')}: {formattedDate}.</strong> {t('last_updated_text')}
        </p>
      )}
    </div>
  )
}
