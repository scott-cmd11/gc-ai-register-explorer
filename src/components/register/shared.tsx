import type { Lang } from '@/lib/language'
import {
  canonicalStatus,
  sourceField,
  type SourceRecord,
  type SourceValue,
} from '@/lib/register/model'
import { translator, type Translate } from '@/lib/register/copy'

export const sourceUrl = (lang: Lang) =>
  lang === 'fr'
    ? 'https://ouvert.canada.ca/data/fr/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b'
    : 'https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b'
export const licenceUrl = (lang: Lang) =>
  lang === 'fr'
    ? 'https://ouvert.canada.ca/fr/licence-du-gouvernement-ouvert-canada'
    : 'https://open.canada.ca/en/open-government-licence-canada'
export const number = (value: number, lang: Lang) =>
  new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA').format(value)
export const date = (value: string | null, lang: Lang) => {
  const parsed =
    value && /^\d{4}-\d{2}-\d{2}/.test(value) ? new Date(value.slice(0, 10) + 'T12:00:00') : null
  return parsed && !Number.isNaN(parsed.getTime())
    ? new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(parsed)
    : translator(lang)('notSpecified')
}
export const statusName = (key: string, t: Translate) =>
  t(
    (
      {
        production: 'inProduction',
        development: 'inDevelopment',
        retired: 'retired',
        unknown: 'unknown',
      } as Record<string, string>
    )[key] ?? 'unknown'
  )
export const flagName = (value: SourceValue, t: Translate) => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()
  return t(normalized === 'Y' ? 'yes' : normalized === 'N' ? 'no' : 'notSpecified')
}
export function External({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}
export function StatusTag({ record, t }: { record: SourceRecord; t: Translate }) {
  const status = canonicalStatus(record)
  return <span className={`status-tag ${status}`}>{statusName(status, t)}</span>
}
export function SourceText({
  record,
  base,
  lang,
}: {
  record: SourceRecord
  base: string
  lang: Lang
}) {
  const value = sourceField(record, base, lang),
    t = translator(lang)
  return (
    <>
      <span data-source-field={base} lang={value.language}>
        {value.text || t('notSpecified')}
      </span>
      {value.fallback && (
        <span className="source-language">
          {t(value.language === 'en' ? 'englishFallback' : 'frenchFallback')}
        </span>
      )}
    </>
  )
}
export function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    moon: <path d="M20.4 13.2A8.5 8.5 0 0 1 10.8 3.6a8.5 8.5 0 1 0 9.6 9.6Z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
      </>
    ),
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
    filter: <path d="M3 6h18M3 12h18M3 18h18M8 3v6m8 0v6M9 15v6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    left: <path d="m14 5-7 7 7 7" />,
    right: <path d="m10 5 7 7-7 7" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    up: <path d="M12 20V4m-6 6 6-6 6 6" />,
  }
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.right}
    </svg>
  )
}
