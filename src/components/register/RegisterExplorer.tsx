'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from '@/components/Header'
import { useLanguage } from '@/lib/i18n'
import { fetchAllSystems, type SystemsPayload } from '@/lib/api'
import * as C from '@/lib/register/model'
import { translator } from '@/lib/register/copy'
import Footer from './Footer'
import Hero from './Hero'
import Dossier from './Dossier'
import Patterns from './Patterns'
import {
  date,
  External,
  flagName,
  Icon,
  licenceUrl,
  localDay,
  number,
  sourceUrl,
  statusName,
  StatusTag,
} from './shared'

const filterKeys = [
  'query',
  'department',
  'status',
  'personalInfo',
  'developedBy',
  'vendor',
  'notificationAi',
  'year',
  'audience',
  'changed',
] as const
// One-tap starting points. Each replaces the current filters with its own.
// Keyword ones are plain searches, so they are labelled with the word searched.
const filterPresets: Array<{ label: string; filters: Partial<C.RegisterState> }> = [
  { label: 'presetPublic', filters: { audience: 'public' } },
  { label: 'presetPii', filters: { personalInfo: 'Y' } },
  { label: 'inProduction', filters: { status: 'production' } },
]
const keywordPresets = ['facial', 'chatbot', 'immigration']
const chartKeys: C.ChartKey[] = [
  'status',
  'departments',
  'years',
  'pii',
  'developers',
  'vendors',
  'statusYears',
]
const initialData: SystemsPayload = {
  systems: [],
  lastModified: null,
  snapshotAt: null,
  total: null,
  warnings: [],
  changes: null,
}
function RecordSummary({
  line,
  marked,
}: {
  line: C.SourceField
  marked: (text: string) => React.ReactNode
}) {
  if (line.missing) return null
  return (
    <span className="record-summary" lang={line.language}>
      {marked(line.text)}
    </span>
  )
}
export default function RegisterExplorer() {
  const { lang, setLang } = useLanguage(),
    t = useMemo(() => translator(lang), [lang])
  const [data, setData] = useState(initialData),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false)
  const [state, setState] = useState<C.RegisterState>({ ...C.defaults }),
    [ready, setReady] = useState(false)
  const [view, setView] = useState<'records' | 'patterns'>('records'),
    [chart, setChart] = useState<C.ChartKey>('status')
  const [limit, setLimit] = useState(24),
    [moreFilters, setMoreFilters] = useState(false),
    [selectedId, setSelectedId] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const search = useRef<HTMLInputElement>(null),
    pushedRecord = useRef(false)
  const records = data.systems
  const changeSets = useMemo<C.ChangeSets | null>(
    () =>
      data.changes
        ? {
            added: new Set(data.changes.added),
            updated: new Set(data.changes.updated.map((row) => row.id)),
          }
        : null,
    [data.changes]
  )
  const changedCount = changeSets ? changeSets.added.size + changeSets.updated.size : 0
  const filtered = useMemo(
    () => C.filter(records, state, lang, changeSets),
    [records, state, lang, changeSets]
  )
  const opts = useMemo(() => C.options(records, lang), [records, lang])
  const years = useMemo(
    () =>
      C.aggregate(records, lang)
        .years.slice()
        .reverse()
        .map((row) => ({ value: row.key, label: row.label })),
    [records, lang]
  )
  const selected = records.find((record) => record.ai_register_id === selectedId)
  const sequence = filtered.some((record) => record.ai_register_id === selectedId)
    ? filtered
    : C.filter(records, C.defaults, lang)
  const active = filterKeys.filter((key) => state[key])

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      setData(await fetchAllSystems())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void load()
  }, [load])
  useEffect(() => {
    const read = () => {
      const params = new URLSearchParams(location.search),
        next = C.stateFromParams(params)
      setState(next)
      setView(params.get('view') === 'patterns' ? 'patterns' : 'records')
      const key = params.get('chart') as C.ChartKey
      setChart(chartKeys.includes(key) ? key : 'status')
      setSelectedId(params.get('record'))
      setMoreFilters(
        (expanded) =>
          expanded ||
          Boolean(
            next.developedBy || next.vendor || next.notificationAi || next.year
          )
      )
      // Closing a dossier must retain expanded rows and their focus targets.
      const language = params.get('lang')
      if (language === 'en' || language === 'fr') setLang(language)
      const theme = params.get('theme')
      if (theme === 'dark' || theme === 'light') document.documentElement.dataset.theme = theme
      setReady(true)
    }
    read()
    window.addEventListener('popstate', read)
    return () => window.removeEventListener('popstate', read)
  }, [setLang])
  useEffect(() => {
    if (!ready) return
    const params = C.paramsFromState(state)
    params.set('lang', lang)
    params.set('theme', document.documentElement.dataset.theme ?? 'light')
    if (view !== 'records') params.set('view', view)
    if (chart !== 'status') params.set('chart', chart)
    if (selectedId) params.set('record', selectedId)
    history.replaceState(history.state, '', `${location.pathname}?${params}${location.hash}`)
  }, [ready, state, lang, view, chart, selectedId])
  useEffect(() => {
    document.title =
      lang === 'fr' ? 'Registre de l’IA — Au grand jour' : 'AI Register — In plain sight'
  }, [lang])
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const typing =
        event.target instanceof Element &&
        event.target.matches('input,textarea,select,[contenteditable=true]')
      if (
        !selectedId &&
        ((event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) ||
          ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'))
      ) {
        event.preventDefault()
        search.current?.focus()
        search.current?.scrollIntoView({ block: 'center' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId])
  function scrollToResults(selector = '.workbench-toolbar') {
    requestAnimationFrame(() =>
      document.querySelector(selector)?.scrollIntoView({
        block: 'start',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      })
    )
  }
  function change(key: keyof C.RegisterState, value: string) {
    setState((current) => ({ ...current, [key]: value }))
    setLimit(24)
  }
  function applyPreset(filters: Partial<C.RegisterState>, on: boolean) {
    setState((current) => ({
      ...C.defaults,
      sortField: current.sortField,
      sortDir: current.sortDir,
      groupBy: current.groupBy,
      ...(on ? {} : filters),
    }))
    setLimit(24)
  }
  // A hero search is a fresh question: it replaces other filters, keeping sort and grouping.
  function heroSearch(query: string) {
    applyPreset({ query }, false)
    setView('records')
    scrollToResults()
  }
  // "Show all systems from …" means exactly that: other filters are cleared.
  function showOrganisation(organisation: string) {
    applyPreset({ department: organisation }, false)
    scrollToResults('.org-profile')
  }
  function reset() {
    setState({ ...C.defaults })
    setLimit(24)
    setMoreFilters(false)
    search.current?.focus({ preventScroll: true })
  }
  function navigate(next: 'records' | 'patterns') {
    setView(next)
    requestAnimationFrame(() =>
      document.getElementById(next === 'records' ? 'register' : 'insights')?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      })
    )
  }
  function drillDown(key: keyof C.RegisterState, value: string, extraYear?: string) {
    setState((current) => ({ ...current, [key]: value, ...(extraYear ? { year: extraYear } : {}) }))
    setView('records')
    setLimit(24)
    if (['developedBy', 'vendor', 'notificationAi', 'year'].includes(key) || extraYear)
      setMoreFilters(true)
    requestAnimationFrame(() =>
      document.getElementById('records-tab')?.focus({ preventScroll: true })
    )
    scrollToResults()
  }
  function openRecord(id: string) {
    if (!records.some((record) => record.ai_register_id === id)) {
      setAnnouncement(t('noRecord'))
      return
    }
    if (!selectedId) {
      const url = new URL(location.href)
      url.searchParams.set('record', id)
      history.pushState({ ...history.state, registerRecord: true }, '', url)
      pushedRecord.current = true
    }
    setSelectedId(id)
  }
  function closeRecord() {
    if (pushedRecord.current) {
      pushedRecord.current = false
      history.back()
    } else setSelectedId(null)
  }
  function exportCsv() {
    const url = URL.createObjectURL(
      new Blob([C.csv(filtered, lang)], { type: 'text/csv;charset=utf-8;' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `ai-register-${lang}-${localDay(data.snapshotAt) ?? 'records'}.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setAnnouncement(t('csvReady', { count: number(filtered.length, lang) }))
  }
  function filterLabel(key: keyof C.RegisterState, value: string) {
    if (key === 'status') return statusName(value, t)
    if (key === 'department') return C.dept(value, lang)
    if (key === 'personalInfo' || key === 'notificationAi')
      return t(key === 'personalInfo' ? 'personalInfo' : 'notification') + ': ' + flagName(value, t)
    if (key === 'developedBy')
      return opts.developers.find((option) => option.value === value)?.label || value
    if (key === 'year') return t('statusYear') + ': ' + value
    if (key === 'audience')
      return audienceOptions.find((option) => option.value === value)?.label || value
    if (key === 'changed')
      return t(value === 'new' ? 'changedNew' : value === 'updated' ? 'changedUpdated' : 'changedAny')
    return value
  }
  const alphabetic = (rows: { value: string; label: string }[]) =>
    rows.slice().sort((a, b) => a.label.localeCompare(b.label, lang))
  const flagOptions = ['Y', 'N', '__unknown__'].map((value) => ({
    value,
    label: flagName(value, t),
  }))
  const audienceOptions = [
    ['public', 'audiencePublic'],
    ['employees', 'audienceEmployees'],
    ['neither', 'audienceNeither'],
    ['__unknown__', 'notSpecified'],
  ].map(([value, label]) => ({ value, label: t(label) }))
  const statusOptions = ['production', 'development', 'retired', 'unknown'].map((value) => ({
    value,
    label: statusName(value, t),
  }))
  const select = (
    key: keyof C.RegisterState,
    label: string,
    options: { value: string; label: string }[],
    first: string
  ) => (
    <label className="field-label" htmlFor={`filter-${key}`}>
      <span>{label}</span>
      <select
        id={`filter-${key}`}
        value={state[key]}
        onChange={(event) => change(key, event.target.value)}
      >
        <option value="">{first}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
  const marked = (text: string) =>
    C.highlight(text, state.query).map((part, index) =>
      part.match ? <mark key={index}>{part.text}</mark> : part.text
    )
  const presetButton = (key: string, label: string, aria: string | undefined, filters: Partial<C.RegisterState>) => {
    const on = filterKeys.every(
      (name) => state[name] === ((filters[name] as string | undefined) ?? '')
    )
    return (
      <button
        type="button"
        className="preset"
        key={key}
        aria-pressed={on}
        aria-label={aria}
        onClick={() => applyPreset(filters, on)}
      >
        {label}
      </button>
    )
  }
  const profile = state.department ? C.organisationProfile(records, state.department) : null
  const table = (rows: C.SourceRecord[]) => (
    <table className="record-table">
      <thead>
        <tr>
          <th scope="col">{t('systemName')}</th>
          <th scope="col">{t('organisation')}</th>
          <th scope="col">{t('status')}</th>
          <th scope="col">{t('statusDateShort')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((record) => (
          <tr
            key={record.ai_register_id}
            data-record-id={record.ai_register_id}
            className={selectedId === record.ai_register_id ? 'is-selected' : undefined}
          >
            <th scope="row">
              <button
                className="record-open"
                onClick={() => openRecord(record.ai_register_id)}
              >
                {/* No aria-label: screen readers should hear the summary too. */}
                <span className="sr-only">{t('rowOpenPrefix')} </span>
                <span
                  className="record-title"
                  lang={C.sourceField(record, 'name_ai_system', lang).language}
                >
                  {C.field(record, 'name_ai_system', lang)
                    ? marked(C.field(record, 'name_ai_system', lang))
                    : t('notSpecified')}
                </span>
                {changeSets?.added.has(record.ai_register_id) ? (
                  <span className="change-tag">{t('tagNew')}</span>
                ) : changeSets?.updated.has(record.ai_register_id) ? (
                  <span className="change-tag">{t('tagUpdated')}</span>
                ) : null}
                <RecordSummary line={C.excerpt(record, lang, state.query)} marked={marked} />
                <span className="source-id">{record.ai_register_id}</span>
              </button>
            </th>
            <td>
              {state.department === record.government_organization ? (
                C.dept(record.government_organization, lang)
              ) : (
                <button
                  type="button"
                  className="org-link"
                  aria-label={t('rowOrgFilter', {
                    name: C.dept(record.government_organization, lang),
                  })}
                  onClick={() => showOrganisation(record.government_organization)}
                >
                  {C.dept(record.government_organization, lang)}
                </button>
              )}
            </td>
            <td>
              <StatusTag record={record} t={t} />
            </td>
            <td>
              {C.year(record) ? (
                <>
                  <span className="mobile-label">{t('statusDateShort')}</span>
                  {C.year(record)}
                </>
              ) : (
                <span className="missing" aria-label={t('unknownYear')}>
                  —
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <>
      <Header onNavigate={navigate} />
      <main id="main-content" tabIndex={-1}>
        <noscript>
          <div className="shell partial-banner">
            <p>
              {lang === 'fr'
                ? 'JavaScript est nécessaire pour explorer les dossiers ici. Vous pouvez aussi consulter le registre officiel.'
                : 'JavaScript is needed to explore records here. You can also read the official register.'}
            </p>
            <External href={sourceUrl(lang)}>{t('officialSource')}</External>
          </div>
        </noscript>
        {loading || error ? (
          <section className="state-view">
            <p className="eyebrow">
              {t('brand')} / {t('country')}
            </p>
            <h1>{t(loading ? 'loadingTitle' : 'errorTitle')}</h1>
            <p role={loading ? 'status' : 'alert'}>{t(loading ? 'loadingBody' : 'errorBody')}</p>
            {loading ? (
              <div className="loading-lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            ) : (
              <div className="state-actions">
                <button className="button button-primary" onClick={() => void load()}>
                  {t('retry')}
                </button>
                <External href={sourceUrl(lang)} className="text-link">
                  {t('officialSource')}
                </External>
              </div>
            )}
          </section>
        ) : (
          <>
            {(data.warnings.length > 0 || (data.total !== null && data.total > records.length)) && (
              <div className="shell">
                <div className="partial-banner" role="status">
                  <div>
                    <h2>
                      {data.warnings.some((warning) => warning.code === 'stale_snapshot')
                        ? t('staleTitle')
                        : t('partialTitle')}
                    </h2>
                    <p>
                      {data.warnings.some((warning) => warning.code === 'stale_snapshot')
                        ? t('staleBody')
                        : data.total !== null && data.total > records.length
                        ? t('partialAvailable', {
                            count: number(records.length, lang),
                            total: number(data.total, lang),
                          })
                        : t('dataWarning')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {selectedId && !selected && (
              <div className="shell partial-banner" role="status">
                <p>{t('noRecord')}</p>
                <button className="button-quiet" onClick={closeRecord}>
                  {t('close')}
                </button>
              </div>
            )}
            <Hero
              records={records}
              lang={lang}
              t={t}
              onOpen={openRecord}
              onExplore={() => setView('records')}
              onSearch={heroSearch}
            />
            <div className="source-ribbon">
              <div className="ribbon-inner shell">
                <div className="source-credit">
                  <span className="arrow" aria-hidden="true">
                    ↳
                  </span>
                  <p>
                    <External href={sourceUrl(lang)}>{t('builtFrom')}</External>
                  </p>
                </div>
                <p className="source-dates">
                  <span>{t('sourceModified', { date: date(data.lastModified, lang) })}</span>
                  <span>{t('snapshot', { date: date(data.snapshotAt, lang) })}</span>
                </p>
              </div>
              {data.changes && (
                <div className="change-summary shell">
                  <p>
                    {changedCount + data.changes.removed.length > 0
                      ? t('changeSummary', {
                          since: date(data.changes.since, lang),
                          added: number(data.changes.added.length, lang),
                          updated: number(data.changes.updated.length, lang),
                          removed: number(data.changes.removed.length, lang),
                        })
                      : t('changeNone', { since: date(data.changes.since, lang) })}
                  </p>
                  {changedCount > 0 && (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => {
                        applyPreset({ changed: 'any' }, false)
                        setView('records')
                        scrollToResults()
                      }}
                    >
                      {t('changeShow')}
                    </button>
                  )}
                  {data.changes.removed.length > 0 && (
                    <details>
                      <summary>
                        {t('changeRemoved')} ({number(data.changes.removed.length, lang)})
                      </summary>
                      <ul>
                        {data.changes.removed.map((row) => (
                          <li key={row.id}>
                            {(lang === 'fr' ? row.name_fr : row.name_en) || row.name_en || row.name_fr}{' '}
                            <span className="source-id">
                              {C.dept(row.organisation, lang)} · {row.id}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </div>
            <section
              className="register-section shell"
              id="register"
              aria-labelledby="register-title"
            >
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    <span className="section-index">01</span>
                    {t('registerEyebrow')}
                  </p>
                  <h2 id="register-title">{t('registerTitle')}</h2>
                </div>
                <p>{t('registerIntro')}</p>
              </div>
              <div className="search-surface">
                <div className="search-line">
                  <Icon name="search" />
                  <label className="sr-only" htmlFor="register-search">
                    {t('searchLabel')}
                  </label>
                  <input
                    type="search"
                    id="register-search"
                    ref={search}
                    value={state.query}
                    onChange={(event) => change('query', event.target.value.slice(0, 500))}
                    placeholder={t('searchPlaceholder')}
                    autoComplete="off"
                    maxLength={500}
                  />
                  <button
                    className="search-clear"
                    hidden={!state.query}
                    onClick={() => {
                      change('query', '')
                      search.current?.focus()
                    }}
                    aria-label={t('clearSearch')}
                  >
                    <Icon name="close" />
                  </button>
                  <kbd aria-hidden="true">/</kbd>
                </div>
                <div className="filter-main">
                  {select(
                    'department',
                    t('organisation'),
                    alphabetic(opts.departments),
                    t('allOrganisations')
                  )}
                  {select('status', t('status'), statusOptions, t('allStatuses'))}
                  {select('personalInfo', t('personalInfo'), flagOptions, t('allPersonalInfo'))}
                  {select('audience', t('audience'), audienceOptions, t('allAudiences'))}
                  <button
                    className="more-filters"
                    id="more-filters"
                    aria-expanded={moreFilters}
                    aria-controls="extra-filters"
                    onClick={() => setMoreFilters(!moreFilters)}
                  >
                    <Icon name="filter" />
                    <span>{t('moreFilters')}</span>
                  </button>
                </div>
                <div className="filter-extra" id="extra-filters" hidden={!moreFilters}>
                  {select('developedBy', t('developedBy'), opts.developers, t('allDevelopers'))}
                  {select('vendor', t('vendors'), alphabetic(opts.vendors), t('allVendors'))}
                  {select('notificationAi', t('notification'), flagOptions, t('allNotification'))}
                  {select('year', t('statusYear'), years, t('allYears'))}
                </div>
              </div>
              <div className="preset-rows">
                <div className="preset-row" role="group" aria-labelledby="preset-label">
                  <span id="preset-label">{t('startWith')}</span>
                  {filterPresets.map((preset) =>
                    presetButton(preset.label, t(preset.label), undefined, preset.filters)
                  )}
                  {changedCount > 0 &&
                    presetButton('changedAny', t('changedAny'), undefined, { changed: 'any' })}
                </div>
                <div className="preset-row" role="group" aria-labelledby="keyword-label">
                  <span id="keyword-label">{t('searchFor')}</span>
                  {keywordPresets.map((word) =>
                    presetButton(word, t('quoted', { text: word }), t('searchForLabel', { text: word }), {
                      query: word,
                    })
                  )}
                </div>
              </div>
              <div className="active-filters" role="group" aria-label={t('activeFilters')}>
                {active.map((key) => (
                  <button
                    className="filter-chip"
                    key={key}
                    aria-label={t('removeFilter', { name: filterLabel(key, state[key]) })}
                    onClick={() => {
                      change(key, '')
                      ;(key === 'query'
                        ? search.current
                        : document.getElementById(`filter-${key}`)
                      )?.focus({ preventScroll: true })
                    }}
                  >
                    <span>{filterLabel(key, state[key])}</span>
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
                {active.length > 0 && (
                  <button className="filter-reset" onClick={reset}>
                    {t('resetFilters')}
                  </button>
                )}
              </div>
              {profile && (
                <section className="org-profile" aria-labelledby="org-profile-title">
                  <div className="org-profile-head">
                    <p className="eyebrow">{t('profileEyebrow')}</p>
                    <h3 id="org-profile-title">{C.dept(state.department, lang)}</h3>
                    <p className="org-profile-note">{t('profileNote')}</p>
                  </div>
                  <dl className="org-profile-stats">
                    {(
                      [
                        [profile.total, 'profileSystems'],
                        [profile.production, 'profileProduction'],
                        [profile.personalInfo, 'profilePii'],
                        [profile.public, 'profilePublic'],
                      ] as const
                    ).map(([value, label]) => (
                      <div key={label}>
                        <dt>{t(label)}</dt>
                        <dd>{number(value, lang)}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="org-profile-foot">
                    <p>
                      <span>{t('profileVendors')}: </span>
                      {profile.vendors.length
                        ? profile.vendors
                            .map((vendor) => `${vendor.name} (${number(vendor.count, lang)})`)
                            .join(', ')
                        : t('profileNoVendors')}
                    </p>
                    <div className="org-profile-actions">
                      <button className="button" type="button" onClick={() => navigate('patterns')}>
                        {t('profileCharts')}
                      </button>
                      <button
                        className="button-quiet"
                        type="button"
                        onClick={() => change('department', '')}
                      >
                        {t('profileClear')}
                      </button>
                    </div>
                  </div>
                </section>
              )}
              <div className="workbench-toolbar">
                <div
                  className="view-tabs"
                  role="tablist"
                  aria-label={t('viewState')}
                  onKeyDown={(event) => {
                    if (
                      !['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(
                        event.key
                      )
                    )
                      return
                    event.preventDefault()
                    const next =
                      event.key === 'Home'
                        ? 'records'
                        : event.key === 'End'
                          ? 'patterns'
                          : view === 'records'
                            ? 'patterns'
                            : 'records'
                    setView(next)
                    document.getElementById(`${next}-tab`)?.focus()
                  }}
                >
                  <button
                    role="tab"
                    id="records-tab"
                    aria-controls="records-panel"
                    aria-selected={view === 'records'}
                    tabIndex={view === 'records' ? 0 : -1}
                    onClick={() => setView('records')}
                  >
                    {t('records')}
                    <span className="tab-count">{number(filtered.length, lang)}</span>
                  </button>
                  <button
                    role="tab"
                    id="patterns-tab"
                    aria-controls="insights"
                    aria-selected={view === 'patterns'}
                    tabIndex={view === 'patterns' ? 0 : -1}
                    onClick={() => setView('patterns')}
                  >
                    {t('patterns')}
                  </button>
                </div>
                <div className="result-actions">
                  <p className="result-count" id="result-count" role="status" aria-live="polite">
                    {filtered.length === 1
                      ? t('oneResult')
                      : t('resultCount', { count: number(filtered.length, lang) })}
                  </p>
                  <button className="export-button" onClick={exportCsv} disabled={!filtered.length}>
                    <Icon name="download" />
                    {t('exportCsv')}
                  </button>
                </div>
              </div>
              <div
                id="records-panel"
                role="tabpanel"
                aria-labelledby="records-tab"
                hidden={view !== 'records'}
              >
                <div className="result-options">
                  <div className="sort-group">
                    <label className="inline-field" htmlFor="sort-field">
                      {t('sortLabel')}
                      <select
                        id="sort-field"
                        value={state.sortField}
                        onChange={(event) => change('sortField', event.target.value)}
                      >
                        {[
                          ['name', 'name'],
                          ['department', 'organisation'],
                          ['status', 'status'],
                          ['year', 'statusYear'],
                          ['vendor', 'vendor'],
                          ['personalInfo', 'personalInfo'],
                        ].map(([value, label]) => (
                          <option key={value} value={value}>
                            {t(label)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="inline-field sort-direction" htmlFor="sort-direction">
                      {t('direction')}
                      <select
                        id="sort-direction"
                        value={state.sortDir}
                        onChange={(event) => change('sortDir', event.target.value)}
                      >
                        <option value="asc">{t('ascending')}</option>
                        <option value="desc">{t('descending')}</option>
                      </select>
                    </label>
                    <label className="inline-field" htmlFor="group-by">
                      {t('groupLabel')}
                      <select
                        id="group-by"
                        value={state.groupBy}
                        onChange={(event) => change('groupBy', event.target.value)}
                      >
                        {[
                          ['none', 'groupNone'],
                          ['department', 'groupOrg'],
                          ['vendor', 'groupVendor'],
                          ['status', 'groupStatus'],
                        ].map(([value, label]) => (
                          <option key={value} value={value}>
                            {t(label)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className="records-note">
                    {state.groupBy === 'vendor'
                      ? t('groupVendorHelp')
                      : t('resultsOf', {
                          count: number(filtered.length, lang),
                          total: number(records.length, lang),
                        })}
                  </p>
                </div>
                <div id="records-content">
                  {!filtered.length ? (
                    <div className="empty-state">
                      <div className="empty-symbol" aria-hidden="true" />
                      <h3>{t('noResults')}</h3>
                      <p>{t('noResultsBody')}</p>
                      <button className="button" onClick={reset}>
                        {t('resetFilters')}
                      </button>
                    </div>
                  ) : state.groupBy === 'none' ? (
                    table(filtered.slice(0, limit))
                  ) : (
                    C.group(filtered, state.groupBy, lang).map((group, index) => (
                      <details
                        key={`${state.groupBy}-${group.key}`}
                        className="record-group"
                        open={index === 0}
                      >
                        <summary>
                          <span>{group.label}</span>
                          <span className="group-count">{number(group.records.length, lang)}</span>
                        </summary>
                        {table(group.records)}
                      </details>
                    ))
                  )}
                </div>
                <div className="list-end" hidden={!filtered.length || state.groupBy !== 'none'}>
                  <button
                    className="button"
                    hidden={limit >= filtered.length}
                    onClick={() => {
                      setLimit(limit + 24)
                      setAnnouncement(
                        t('showing', {
                          count: number(Math.min(limit + 24, filtered.length), lang),
                          total: number(filtered.length, lang),
                        })
                      )
                    }}
                  >
                    {t('showMore')}
                    <span className="arrow" aria-hidden="true">
                      ↓
                    </span>
                  </button>
                  <p>
                    {t('showing', {
                      count: number(Math.min(limit, filtered.length), lang),
                      total: number(filtered.length, lang),
                    })}
                  </p>
                </div>
              </div>
              <Patterns
                records={filtered}
                state={state}
                lang={lang}
                chart={chart}
                hidden={view !== 'patterns'}
                t={t}
                onChartChange={setChart}
                onFilter={drillDown}
              />
            </section>
            <section className="about-section" id="about" aria-labelledby="about-title">
              <div className="shell about-layout">
                <div className="about-intro">
                  <p className="eyebrow">
                    <span className="section-index">02</span>
                    {t('aboutEyebrow')}
                  </p>
                  <h2 id="about-title">{t('aboutTitle')}</h2>
                  <p>{t('aboutIntro')}</p>
                  <External href={sourceUrl(lang)} className="text-link">
                    {t('officialSource')} ↗
                  </External>
                  <div className="about-links">
                    <External href={licenceUrl(lang)}>{t('licence')}</External>
                  </div>
                </div>
                <div>
                  <div className="about-ledger">
                    {[
                      ['publicData', 'publicDataBody'],
                      ['missingTitle', 'missingBody'],
                      ['dataDates', 'dataDatesBody'],
                      ['independentTitle', 'independentBody'],
                    ].map(([title, body], index) => (
                      <div key={title}>
                        <span className="ledger-number">0{index + 1}</span>
                        <div>
                          <h3>{t(title)}</h3>
                          <p>{t(body)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="about-links">
                    <External href="https://scotthazlitt.ai">{t('operator')}</External>
                    <a href="mailto:scott@scotthazlitt.ai">{t('feedback')}</a>
                    <External href="https://github.com/scott-cmd11/gc-ai-register-explorer">
                      GitHub
                    </External>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
      <div className="sr-only" role="status" aria-live="polite" id="announcement">
        {announcement}
      </div>
      {selected && (
        <Dossier
          record={selected}
          sequence={sequence}
          lang={lang}
          t={t}
          snapshotAt={data.snapshotAt}
          lastModified={data.lastModified}
          onClose={closeRecord}
          onStep={setSelectedId}
        />
      )}
    </>
  )
}
