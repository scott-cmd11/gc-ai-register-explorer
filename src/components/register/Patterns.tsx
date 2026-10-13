'use client'

import { useRef } from 'react'
import {
  aggregate,
  summary,
  type ChartKey,
  type RegisterState,
  type SourceRecord,
} from '@/lib/register/model'

type PatternsProps = {
  records: SourceRecord[]
  state: RegisterState
  lang: 'en' | 'fr'
  chart: ChartKey
  hidden: boolean
  t: (key: string, values?: Record<string, string | number>) => string
  onChartChange: (key: ChartKey) => void
  onFilter: (key: keyof RegisterState, value: string, year?: string) => void
}

const chartKeys: ChartKey[] = [
  'status',
  'departments',
  'years',
  'pii',
  'developers',
  'vendors',
  'statusYears',
]

const chartTitleKey: Record<ChartKey, string> = {
  status: 'chartStatus',
  departments: 'chartOrg',
  years: 'chartYear',
  pii: 'chartPii',
  developers: 'chartDeveloper',
  vendors: 'chartVendor',
  statusYears: 'chartStatusYear',
}

const chartFilterKey: Partial<Record<ChartKey, keyof RegisterState>> = {
  status: 'status',
  departments: 'department',
  years: 'year',
  pii: 'personalInfo',
  developers: 'developedBy',
  vendors: 'vendor',
}

function colour(key: string, index = 0) {
  const semantic: Record<string, string> = {
    production: 'var(--positive)',
    development: 'var(--development)',
    retired: 'var(--retired)',
    unknown: 'var(--quiet)',
    Y: 'var(--accent)',
    N: 'var(--positive)',
    __unknown__: 'var(--quiet)',
  }
  return (
    semantic[key] ??
    ['var(--accent)', 'var(--positive)', 'var(--development)', 'var(--retired)'][index % 4]
  )
}

export default function Patterns({
  records,
  state,
  lang,
  chart,
  hidden,
  t,
  onChartChange,
  onFilter,
}: PatternsProps) {
  const chartTabs = useRef<Array<HTMLButtonElement | null>>([])
  const totals = summary(records)
  const charts = aggregate(records, lang)
  const number = (value: number) =>
    new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA').format(value)
  const percentage = (value: number) =>
    new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(records.length ? value / records.length : 0)
  const chartTitle = (key: ChartKey) => t(chartTitleKey[key])
  const statusName = (key: string) =>
    t(
      {
        production: 'inProduction',
        development: 'inDevelopment',
        retired: 'retired',
        unknown: 'unknown',
      }[key] ?? 'unknown'
    )

  const selectChart = (key: ChartKey) => onChartChange(key)
  const moveChartFocus = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      nextIndex = (index - 1 + chartKeys.length) % chartKeys.length
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
      nextIndex = (index + 1) % chartKeys.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = chartKeys.length - 1
    else return

    event.preventDefault()
    const key = chartKeys[nextIndex]
    selectChart(key)
    chartTabs.current[nextIndex]?.focus()
  }

  const filterRow = (key: ChartKey, value: string) => {
    const filter = chartFilterKey[key]
    if (filter) onFilter(filter, value)
  }

  const summaryRows: Array<[number, string]> = [
    [totals.total, 'currentCount'],
    [totals.organisations, 'organisationCount'],
    [totals.production, 'inProduction'],
    [totals.personalInfo, 'piiCount'],
  ]

  // Plain-language readings of the current result set, shown before the charts.
  const departments = charts.departments
  const topFive = departments.slice(0, 5).reduce((total, row) => total + row.value, 0)
  // Needs at least two records so counts read naturally ("2 systems", not "1 systems").
  const findings = records.length > 1
    ? [
        t('findProduction', {
          count: number(totals.production),
          total: number(totals.total),
          share: percentage(totals.production),
        }),
        t('findPii', { count: number(totals.personalInfo), share: percentage(totals.personalInfo) }),
        t('findPublic', { count: number(totals.public), share: percentage(totals.public) }),
        // Only name a leader when it is not tied with the runner-up.
        ...(departments.length > 1 && departments[0].value > departments[1].value
          ? [
              t('findTopDept', {
                org: departments[0].label,
                count: number(departments[0].value),
                share: percentage(departments[0].value),
              }),
            ]
          : []),
        ...(departments.length > 5 ? [t('findTopFive', { share: percentage(topFive) })] : []),
      ]
    : []

  const renderStatusYears = () => {
    const { rows, statuses, excluded } = charts.statusYears
    const maximum = Math.max(
      1,
      ...rows.map((row) => Object.values(row.counts).reduce((total, value) => total + value, 0))
    )
    return (
      <>
        <div className="chart-heading">
          <h3>{chartTitle(chart)}</h3>
          <p className="chart-denominator">
            {t('recordSubset', { count: number(records.length) })}
          </p>
        </div>
        {rows.length ? (
          <>
            <div className="status-years">
              {rows.map((row) => {
                const rowTotal = Object.values(row.counts).reduce(
                  (total, value) => total + value,
                  0
                )
                return (
                  <div className="year-stack" key={row.year}>
                    <span>{row.year}</span>
                    <div className="stack-track">
                      {statuses
                        .filter((status) => row.counts[status])
                        .map((status) => (
                          <button
                            className="stack-piece"
                            key={status}
                            type="button"
                            style={
                              {
                                '--extent': `${(row.counts[status] / maximum) * 100}%`,
                                '--key-color': colour(status),
                              } as React.CSSProperties
                            }
                            aria-label={`${row.year}: ${statusName(status)}, ${number(row.counts[status])}`}
                            title={`${statusName(status)}: ${number(row.counts[status])}`}
                            onClick={() => onFilter('status', status, row.year)}
                          />
                        ))}
                    </div>
                    <span>{number(rowTotal)}</span>
                  </div>
                )
              })}
            </div>
            <div className="stack-legend">
              {statuses.map((status) => (
                <span key={status}>
                  <i
                    className="legend-key"
                    style={{ '--key-color': colour(status) } as React.CSSProperties}
                    aria-hidden="true"
                  />
                  {statusName(status)}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p>{t('noChartData')}</p>
        )}
        <p className="chart-help">{t('statusYearHelp', { count: number(excluded) })}</p>
        <p className="chart-filter-hint">{t('filterChart')}</p>
        <details className="chart-table-wrap">
          <summary>{t('chartTable')}</summary>
          <div className="chart-table-scroll" tabIndex={0} aria-label={t('chartTable')}>
            <table className="chart-data-table">
              <caption className="sr-only">
                {t('tableCaption', { name: chartTitle(chart) })}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{t('statusYear')}</th>
                  {statuses.map((status) => (
                    <th key={status} scope="col">
                      {statusName(status)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.year}>
                    <th scope="row">{row.year}</th>
                    {statuses.map((status) => (
                      <td key={status}>{number(row.counts[status])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </>
    )
  }

  const renderStandardChart = () => {
    const rows = charts[chart as Exclude<ChartKey, 'statusYears'>]
    const shown = chart === 'departments' || chart === 'vendors' ? rows.slice(0, 10) : rows
    const filter = chartFilterKey[chart]
    const maximum = Math.max(1, ...shown.map((row) => row.value))
    const missingYears = records.length - charts.years.reduce((total, row) => total + row.value, 0)
    const help =
      chart === 'years'
        ? `${t('yearHelp')} ${t('notDated', { count: number(missingYears) })}`
        : chart === 'departments'
          ? t('departmentsHelp')
          : chart === 'vendors'
            ? t('vendorsHelp')
            : chart === 'pii'
              ? t('missingBody')
              : t('chartCountNote')

    let visual: React.ReactNode
    if (chart === 'status' || chart === 'pii') {
      let offset = 0
      const circles = rows.map((row, index) => {
        const extent = records.length ? (row.value / records.length) * 100 : 0
        const circle = (
          <circle
            key={row.key}
            cx="60"
            cy="60"
            r="46"
            pathLength="100"
            stroke={colour(row.key, index)}
            strokeDasharray={`${extent} ${100 - extent}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 60 60)"
          />
        )
        offset += extent
        return circle
      })
      visual = (
        <div className="donut-layout">
          <svg className="donut" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="46" stroke="var(--tint)" />
            {circles}
            <text className="donut-total" x="60" y="61" textAnchor="middle">
              {number(records.length)}
            </text>
            <text className="donut-caption" x="60" y="73" textAnchor="middle">
              {t('systems')}
            </text>
          </svg>
          <div className="donut-legend">
            {rows.map((row, index) => (
              <button
                key={row.key}
                type="button"
                disabled={!row.value}
                onClick={() => filter && filterRow(chart, row.key)}
              >
                <span className="legend-label">
                  <i
                    className="legend-key"
                    style={{ '--key-color': colour(row.key, index) } as React.CSSProperties}
                    aria-hidden="true"
                  />
                  {row.label}
                </span>
                <span className="legend-number">
                  {number(row.value)}
                  <span>{percentage(row.value)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )
    } else {
      visual = shown.length ? (
        <div className="bar-list">
          {shown.map((row) => (
            <button
              className="bar-row"
              key={row.key}
              type="button"
              aria-pressed={filter ? state[filter] === row.key : false}
              onClick={() => filter && filterRow(chart, row.key)}
            >
              <span className="bar-name">{row.label}</span>
              <span className="bar-track" aria-hidden="true">
                <span
                  className="bar-fill"
                  style={{ '--extent': `${(row.value / maximum) * 100}%` } as React.CSSProperties}
                />
              </span>
              <span className="bar-count">{number(row.value)}</span>
            </button>
          ))}
        </div>
      ) : (
        <p>{t('noChartData')}</p>
      )
    }

    return (
      <>
        <div className="chart-heading">
          <h3>{chartTitle(chart)}</h3>
          <p className="chart-denominator">
            {t('recordSubset', { count: number(records.length) })}
          </p>
        </div>
        {visual}
        <p className="chart-help">{help}</p>
        <p className="chart-filter-hint">{t('filterChart')}</p>
        <details className="chart-table-wrap">
          <summary>{t('chartTable')}</summary>
          <div className="chart-table-scroll" tabIndex={0} aria-label={t('chartTable')}>
            <table className="chart-data-table">
              <caption className="sr-only">
                {t('tableCaption', { name: chartTitle(chart) })}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{chartTitle(chart)}</th>
                  <th scope="col">{t('count')}</th>
                  <th scope="col">{t('percentage')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.label}</th>
                    <td>{number(row.value)}</td>
                    <td>{percentage(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </>
    )
  }

  return (
    <section id="insights" role="tabpanel" aria-labelledby="patterns-tab" hidden={hidden}>
      <div className="pattern-intro">
        <h3>{t('insightsTitle')}</h3>
        <p>{t('insightsIntro')}</p>
      </div>
      <div className="pattern-summary">
        {summaryRows.map(([value, label]) => (
          <div key={label}>
            <strong>{number(value)}</strong>
            <span>{t(label)}</span>
          </div>
        ))}
      </div>
      {findings.length > 0 && (
        <div className="pattern-findings">
          <h4>{t('findingsTitle')}</h4>
          <ul>
            {findings.map((finding) => (
              <li key={finding}>{finding}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="pattern-layout">
        <div className="chart-nav" role="tablist" aria-label={t('chartSelect')}>
          {chartKeys.map((key, index) => (
            <button
              id={`chart-tab-${key}`}
              key={key}
              ref={(node) => {
                chartTabs.current[index] = node
              }}
              type="button"
              role="tab"
              aria-controls="chart-stage"
              aria-selected={chart === key}
              tabIndex={chart === key ? 0 : -1}
              onClick={() => selectChart(key)}
              onKeyDown={(event) => moveChartFocus(event, index)}
            >
              <span className="chart-number">{String(index + 1).padStart(2, '0')}</span>
              <span>{chartTitle(key)}</span>
            </button>
          ))}
        </div>
        <section
          className="chart-stage"
          id="chart-stage"
          role="tabpanel"
          aria-labelledby={`chart-tab-${chart}`}
        >
          {chart === 'statusYears' ? renderStatusYears() : renderStandardChart()}
        </section>
      </div>
    </section>
  )
}
