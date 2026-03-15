'use client'

import { useEffect, useState } from 'react'

export default function RetroOverlay() {
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
    <>
      {/* Construction banner */}
      <div
        aria-hidden="true"
        style={{
          background: 'repeating-linear-gradient(45deg, #000 0px, #000 10px, #FFD700 10px, #FFD700 20px)',
          padding: '8px 0',
          textAlign: 'center',
          borderBottom: '3px outset #C0C0C0',
        }}
      >
        <span
          style={{
            background: '#FFD700',
            color: '#000',
            fontWeight: 'bold',
            padding: '4px 16px',
            fontSize: '14px',
            fontFamily: "'Comic Sans MS', cursive",
          }}
        >
          🚧 <span className="retro-blink">THIS SITE IS UNDER CONSTRUCTION</span> 🚧
        </span>
      </div>

      {/* Marquee */}
      <div
        aria-hidden="true"
        style={{
          background: '#000080',
          overflow: 'hidden',
          height: '28px',
          borderBottom: '2px solid #FFFF00',
        }}
      >
        <div
          className="retro-marquee"
          style={{
            whiteSpace: 'nowrap',
            lineHeight: '28px',
            fontSize: '14px',
            fontFamily: "'Comic Sans MS', cursive",
          }}
        >
          <span className="retro-rainbow">
            ★★★ Welcome to the GC AI Register Explorer!!! ★★★ Best viewed at 800x600 resolution!!! ★★★ Sign my Guestbook!!! ★★★ You are visitor #{' '}
            {String(Math.floor(Math.random() * 900000 + 100000)).padStart(6, '0')} ★★★
          </span>
        </div>
      </div>

      {/* Rainbow HR */}
      <div className="retro-hr" aria-hidden="true" />

      {/* Visitor counter */}
      <div
        aria-hidden="true"
        style={{
          background: '#000',
          textAlign: 'center',
          padding: '6px 0',
          borderBottom: '2px solid #00FF00',
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            color: '#00FF00',
            fontSize: '13px',
            letterSpacing: '2px',
          }}
        >
          [ You are visitor #{' '}
          <span style={{ color: '#00FF00', fontWeight: 'bold', fontSize: '16px' }}>
            004,782
          </span>{' '}
          since 1997 ]
        </span>
      </div>

      {/* Netscape badge — fixed bottom-right */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 50,
          background: '#C0C0C0',
          border: '3px outset #C0C0C0',
          padding: '10px 14px',
          fontSize: '11px',
          color: '#000',
          fontFamily: "'Comic Sans MS', cursive",
          textAlign: 'center',
          maxWidth: '200px',
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          🌐 Best viewed in
        </div>
        <div
          style={{
            fontWeight: 'bold',
            color: '#000080',
            fontSize: '13px',
          }}
        >
          Netscape Navigator 4.0
        </div>
        <div>at 800×600</div>
        <div className="retro-hr" style={{ margin: '6px 0', height: '3px' }} />
        <div>📝 Made with Notepad</div>
        <div style={{ marginTop: '4px' }}>
          <span
            style={{
              display: 'inline-block',
              background: '#000080',
              color: '#FFFF00',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '2px outset #808080',
            }}
          >
            ⚡ GeoCities ⚡
          </span>
        </div>
      </div>

      {/* Guestbook link bar */}
      <div
        aria-hidden="true"
        style={{
          background: '#C0C0C0',
          textAlign: 'center',
          padding: '4px 0',
          borderBottom: '3px outset #C0C0C0',
          fontFamily: "'Comic Sans MS', cursive",
          fontSize: '12px',
        }}
      >
        <span style={{ color: '#0000FF', textDecoration: 'underline', cursor: 'pointer' }}>
          📖 Sign my Guestbook
        </span>
        {' | '}
        <span style={{ color: '#0000FF', textDecoration: 'underline', cursor: 'pointer' }}>
          💌 Email me
        </span>
        {' | '}
        <span style={{ color: '#0000FF', textDecoration: 'underline', cursor: 'pointer' }}>
          🔗 Cool Links
        </span>
        {' | '}
        <span style={{ color: '#0000FF', textDecoration: 'underline', cursor: 'pointer' }}>
          🏠 Home
        </span>
      </div>
    </>
  )
}
