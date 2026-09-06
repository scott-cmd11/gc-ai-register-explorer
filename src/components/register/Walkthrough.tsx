'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/lib/i18n'

type Beat = {
  id: string
  startSeconds: number
  endSeconds: number
  title: string
  text: string
}

const beats: Beat[] = [
  {
    id: 'opening',
    startSeconds: 0,
    endSeconds: 11,
    title: 'Start with a question',
    text: "Curious about how Canada's federal government reports using AI? The AI Register makes the public record easier to explore, one system at a time.",
  },
  {
    id: 'search',
    startSeconds: 11,
    endSeconds: 25,
    title: 'Find a topic',
    text: "Choose Explore the register. Search for a topic, system name, or organisation. Let's try flood. The results match words in the information departments have supplied.",
  },
  {
    id: 'filters',
    startSeconds: 25,
    endSeconds: 37,
    title: 'Narrow the results',
    text: 'Use Reported status to narrow the results. Select In production. More filters let you explore developers, vendors, notification and reported status year.',
  },
  {
    id: 'record',
    startSeconds: 37,
    endSeconds: 58,
    title: 'Read what was reported',
    text: "Open Flood Susceptibility Index. The dossier gathers the department's description, users, data sources and reported results. A field marked Not specified means the information wasn't supplied. It doesn't mean the answer is no.",
  },
  {
    id: 'source',
    startSeconds: 58,
    endSeconds: 75,
    title: 'Follow the source trail',
    text: "Check the source record ID and the two dates. One describes the source dataset; the other identifies this explorer's snapshot. Official source opens the government dataset. Reported results are not independently verified outcomes.",
  },
  {
    id: 'patterns',
    startSeconds: 75,
    endSeconds: 96,
    title: 'Explore the wider pattern',
    text: 'Close the record and reset the filters. Choose Patterns to compare reported statuses, organisations and other fields. Every chart has a data table. Select a category to see the records behind its count.',
  },
  {
    id: 'export',
    startSeconds: 96,
    endSeconds: 108,
    title: 'Take the results with you',
    text: 'Back in Records, you can sort or group the results. Export CSV downloads the complete filtered set, including records beyond the first page.',
  },
  {
    id: 'closing',
    startSeconds: 108,
    endSeconds: 120,
    title: 'Explore it your way',
    text: 'Switch between English and French, or choose a darker theme. Start with a question. Explore the records. Follow the information to its source.',
  },
]

const copy = {
  en: {
    eyebrow: 'A two-minute guided walkthrough',
    title: 'From a question to the source.',
    intro:
      'Follow a flood-search example, inspect what was reported, check the source, then explore patterns and export the results.',
    voice: 'English AI narration by OpenAI Cedar. English captions are available in the player.',
    back: 'Back to the explorer',
    chapters: 'Walkthrough chapters',
    transcript: 'Read the English transcript',
    transcriptNote: 'The narration and captions are available in English.',
    videoLabel: 'AI Register walkthrough with English narration',
  },
  fr: {
    eyebrow: 'Visite guidée de deux minutes',
    title: 'D’une question à la source.',
    intro:
      'Suivez un exemple de recherche sur les inondations, consultez les renseignements déclarés, vérifiez la source, puis explorez les tendances et exportez les résultats.',
    voice:
      'Narration anglaise générée par IA avec OpenAI Cedar. Des sous-titres anglais sont offerts dans le lecteur.',
    back: 'Retour à l’explorateur',
    chapters: 'Chapitres de la visite guidée',
    transcript: 'Lire la transcription anglaise',
    transcriptNote: 'La narration et les sous-titres sont offerts en anglais.',
    videoLabel: 'Visite guidée du Registre de l’IA avec narration anglaise',
  },
}

function timestamp(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export default function Walkthrough() {
  const { lang } = useLanguage()
  const ui = copy[lang]
  const film = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const video = film.current
    if (!video) return
    const sync = () => {
      const atEnd = video.currentTime >= beats[beats.length - 1].endSeconds
      const current = atEnd
        ? beats.length - 1
        : beats.findIndex(
            (beat) => video.currentTime >= beat.startSeconds && video.currentTime < beat.endSeconds
          )
      setActive(Math.max(0, current))
    }
    video.addEventListener('timeupdate', sync)
    video.addEventListener('ended', sync)
    return () => {
      video.removeEventListener('timeupdate', sync)
      video.removeEventListener('ended', sync)
    }
  }, [])

  const seek = (index: number) => {
    const video = film.current
    if (!video) return
    video.currentTime = beats[index].startSeconds
    setActive(index)
    void video.play().catch(() => {})
  }

  return (
    <main className="walkthrough-shell" id="main-content" tabIndex={-1}>
      <section className="walkthrough-intro" aria-labelledby="walkthrough-title">
        <p className="eyebrow">{ui.eyebrow} · 2:00</p>
        <h1 id="walkthrough-title">{ui.title}</h1>
        <p>{ui.intro}</p>
        <p className="walkthrough-voice">
          <span aria-hidden="true" />
          {ui.voice}
        </p>
        <Link className="walkthrough-back" href="/">
          ← {ui.back}
        </Link>
      </section>

      <section className="walkthrough-player" aria-label={ui.videoLabel}>
        <div className="walkthrough-video-wrap">
          <video
            ref={film}
            controls
            playsInline
            preload="metadata"
            poster="/walkthrough/film-01.jpg"
            aria-label={ui.videoLabel}
          >
            <source src="/walkthrough/narrated-cut.mp4" type="video/mp4" />
            <track
              kind="captions"
              src="/walkthrough/narrated-captions.vtt"
              srcLang="en"
              label="English captions"
              default
            />
          </video>
        </div>
        <aside className="walkthrough-now" aria-label={ui.chapters}>
          <p>
            {String(active + 1).padStart(2, '0')} / {String(beats.length).padStart(2, '0')}
          </p>
          <h2 lang="en">{beats[active].title}</h2>
          <p lang="en">{beats[active].text}</p>
        </aside>
      </section>

      <nav className="walkthrough-chapters" aria-label={ui.chapters}>
        {beats.map((beat, index) => (
          <button
            key={beat.id}
            type="button"
            aria-current={active === index ? 'step' : undefined}
            onClick={() => seek(index)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong lang="en">{beat.title}</strong>
            <small>{timestamp(beat.startSeconds)}</small>
          </button>
        ))}
      </nav>

      <details className="walkthrough-transcript">
        <summary>{ui.transcript}</summary>
        <p className="walkthrough-language-note">{ui.transcriptNote}</p>
        <div lang="en">
          {beats.map((beat, index) => (
            <section key={beat.id}>
              <h2>
                {String(index + 1).padStart(2, '0')} <span>{beat.title}</span>
              </h2>
              <p>{beat.text}</p>
            </section>
          ))}
        </div>
      </details>
    </main>
  )
}
