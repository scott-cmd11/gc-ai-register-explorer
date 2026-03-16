'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n'

interface RetroOverlayProps {
  totalSystems?: number
  inProduction?: number
  handlePii?: number
  departments?: number
  lastModified?: string | null
}

export default function RetroOverlay({ totalSystems = 0, inProduction = 0, handlePii = 0, departments = 0, lastModified }: RetroOverlayProps) {
  const [isRetro, setIsRetro] = useState(false)
  const { lang, t } = useLanguage()

  useEffect(() => {
    const check = () =>
      setIsRetro(document.documentElement.getAttribute('data-theme') === 'retro')
    check()

    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  if (!isRetro) return null

  const dateStr = lastModified
    ? new Date(lastModified).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-US', { month: 'long', year: 'numeric' })
    : 'N/A'

  return (
    <div style={{ marginTop: '64px' }}>
      {/* Scrolling news ticker */}
      <div
        aria-hidden="true"
        style={{
          background: '#000080',
          overflow: 'hidden',
          height: '26px',
          borderBottom: '2px solid #C0C0C0',
        }}
      >
        <div
          className="retro-marquee"
          style={{
            whiteSpace: 'nowrap',
            lineHeight: '26px',
            fontSize: '13px',
            fontFamily: "'Times New Roman', serif",
            color: '#FFFF00',
            fontWeight: 'bold',
          }}
        >
          ★ {t('retro_tech').replace('{total}', String(totalSystems))}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          ★ {t('retro_updates').replace('{date}', dateStr).replace('{depts}', String(departments))}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          ★ {t('retro_data').replace('{prod}', String(inProduction)).replace('{pii}', String(handlePii))}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          ★ {t('retro_best_viewed')}
        </div>
      </div>

      {/* Rainbow HR */}
      <div className="retro-hr" aria-hidden="true" />
    </div>
  )
}
