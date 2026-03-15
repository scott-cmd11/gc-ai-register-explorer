'use client'

import { useEffect, useState } from 'react'

interface RetroOverlayProps {
  totalSystems?: number
  inProduction?: number
  handlePii?: number
  departments?: number
  lastModified?: string | null
}

export default function RetroOverlay({ totalSystems = 0, inProduction = 0, handlePii = 0, departments = 0, lastModified }: RetroOverlayProps) {
  const [isRetro, setIsRetro] = useState(false)

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
          ★ TECHNOLOGY — Government of Canada launches AI Register with {totalSystems} systems catalogued
          &nbsp;&nbsp;|&nbsp;&nbsp;
          ★ UPDATES — Registry last modified {lastModified ? new Date(lastModified).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'} — {departments} departments reporting
          &nbsp;&nbsp;|&nbsp;&nbsp;
          ★ DATA — {inProduction} systems in production, {handlePii} handle personal information
          &nbsp;&nbsp;|&nbsp;&nbsp;
          ★ TECH — Best viewed at 800×600 resolution with Netscape Navigator 4.0
        </div>
      </div>

      {/* Rainbow HR */}
      <div className="retro-hr" aria-hidden="true" />

      {/* Hit counter + info bar */}
      <div
        aria-hidden="true"
        style={{
          background: '#FFFFCC',
          textAlign: 'center',
          padding: '4px 0',
          borderBottom: '1px solid #808080',
          fontFamily: "'Times New Roman', serif",
          fontSize: '11px',
          color: '#666666',
        }}
      >
        You are visitor #{' '}
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            background: '#000',
            color: '#00FF00',
            padding: '1px 6px',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '2px inset #808080',
          }}
        >
          004,782
        </span>
        {' '} since Jan 1, 1997 &nbsp;|&nbsp; Last updated: {lastModified ? new Date(lastModified).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'} &nbsp;|&nbsp;
        <span style={{ fontStyle: 'italic' }}>This page is under construction</span> 🚧
      </div>


    </div>
  )
}
