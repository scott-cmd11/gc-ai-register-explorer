'use client'

import { useEffect, useState } from 'react'

export default function ScrollIndicator() {
  const [direction, setDirection] = useState<'down' | 'up' | null>('down')

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY
      const windowH = window.innerHeight
      const docH = document.documentElement.scrollHeight

      const atBottom = scrollY + windowH >= docH - 40
      const atTop = scrollY < 80

      if (atBottom) {
        setDirection('up')
      } else if (atTop) {
        setDirection('down')
      } else {
        setDirection('down')
      }
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const handleClick = () => {
    if (direction === 'down') {
      window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={direction === 'down' ? 'Scroll down for more content' : 'Scroll back to top'}
      className="fixed z-40 flex items-center justify-center transition-all duration-300"
      style={{
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--text-tertiary)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-hover)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-surface)'
        e.currentTarget.style.color = 'var(--text-tertiary)'
      }}
    >
      <svg
        className="h-5 w-5 transition-transform duration-300"
        style={{
          transform: direction === 'up' ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}
