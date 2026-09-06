import type { Lang } from '../language'

export type SourceValue = string | number | null | undefined

export interface SourceRecord {
  _id?: number | string
  ai_register_id: string
  government_organization: string
  name_ai_system_en?: SourceValue
  name_ai_system_fr?: SourceValue
  description_ai_system_en?: SourceValue
  description_ai_system_fr?: SourceValue
  ai_system_primary_users_en?: SourceValue
  ai_system_primary_users_fr?: SourceValue
  developed_by_en?: SourceValue
  developed_by_fr?: SourceValue
  vendor_information?: SourceValue
  ai_system_status_en?: SourceValue
  ai_system_status_fr?: SourceValue
  status_date?: SourceValue
  ai_system_capabilities_en?: SourceValue
  ai_system_capabilities_fr?: SourceValue
  data_sources_en?: SourceValue
  data_sources_fr?: SourceValue
  involves_personal_information?: SourceValue
  personal_information_banks_en?: SourceValue
  personal_information_banks_fr?: SourceValue
  notification_ai?: SourceValue
  ai_system_results_en?: SourceValue
  ai_system_results_fr?: SourceValue
  [key: string]: SourceValue
}

export type StatusKey = 'production' | 'development' | 'retired' | 'unknown'
export type ChartKey =
  | 'status'
  | 'departments'
  | 'years'
  | 'pii'
  | 'developers'
  | 'vendors'
  | 'statusYears'
export type SortField = 'name' | 'department' | 'status' | 'year' | 'vendor' | 'personalInfo'
export type GroupBy = 'none' | 'department' | 'vendor' | 'status'
export type RegisterState = {
  query: string
  department: string
  status: StatusKey | ''
  personalInfo: 'Y' | 'N' | '__unknown__' | ''
  developedBy: string
  vendor: string
  notificationAi: 'Y' | 'N' | '__unknown__' | ''
  year: string
  sortField: SortField
  sortDir: 'asc' | 'desc'
  groupBy: GroupBy
}
export type SourceField = { text: string; language: Lang; missing: boolean; fallback: boolean }
export type OptionRow = { value: string; label: string; count: number }
export type CountRow = { key: string; label: string; value: number }
export type GroupRow = { key: string; label: string; records: SourceRecord[] }
export type Aggregate = {
  status: Array<CountRow & { key: StatusKey }>
  years: CountRow[]
  departments: CountRow[]
  pii: CountRow[]
  developers: CountRow[]
  vendors: CountRow[]
  statusYears: {
    statuses: Exclude<StatusKey, 'unknown'>[]
    rows: Array<{ year: string; counts: Record<Exclude<StatusKey, 'unknown'>, number> }>
    excluded: number
  }
}

export const defaults: Readonly<RegisterState> = Object.freeze({
  query: '',
  department: '',
  status: '',
  personalInfo: '',
  developedBy: '',
  vendor: '',
  notificationAi: '',
  year: '',
  sortField: 'name',
  sortDir: 'asc',
  groupBy: 'none',
})

const statusKeys: StatusKey[] = ['production', 'development', 'retired', 'unknown']
const sortFields = new Set<SortField>([
  'name',
  'department',
  'status',
  'year',
  'vendor',
  'personalInfo',
])
const groupFields = new Set<GroupBy>(['none', 'department', 'vendor', 'status'])
const flags = new Set(['Y', 'N', '__unknown__'])
const searchFields = [
  'ai_register_id',
  'name_ai_system_en',
  'name_ai_system_fr',
  'description_ai_system_en',
  'description_ai_system_fr',
  'ai_system_primary_users_en',
  'ai_system_primary_users_fr',
  'developed_by_en',
  'developed_by_fr',
  'vendor_information',
  'ai_system_status_en',
  'ai_system_status_fr',
  'status_date',
  'ai_system_capabilities_en',
  'ai_system_capabilities_fr',
  'data_sources_en',
  'data_sources_fr',
  'involves_personal_information',
  'personal_information_banks_en',
  'personal_information_banks_fr',
  'notification_ai',
  'ai_system_results_en',
  'ai_system_results_fr',
  'government_organization',
] as const
const csvColumns = [
  'ai_register_id',
  'name_ai_system',
  'government_organization',
  'ai_system_status',
  'status_date',
  'developed_by',
  'vendor_information',
  'involves_personal_information',
  'notification_ai',
  'description_ai_system',
  'ai_system_primary_users',
  'ai_system_capabilities',
  'data_sources',
  'personal_information_banks',
  'ai_system_results',
] as const

function string(value: SourceValue): string {
  return typeof value === 'string'
    ? value
    : typeof value === 'number' && Number.isFinite(value)
      ? String(value)
      : ''
}
function normalized(value: SourceValue): string {
  return string(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
}
function language(value: Lang): Lang {
  return value === 'fr' ? 'fr' : 'en'
}
function value(record: SourceRecord, key: string): SourceValue {
  return record[key]
}

export function isSourceRecord(record: unknown): record is SourceRecord {
  if (record === null || typeof record !== 'object' || Array.isArray(record)) return false
  const item = record as Record<string, unknown>
  return (
    typeof item.ai_register_id === 'string' &&
    item.ai_register_id.trim().length > 0 &&
    typeof item.government_organization === 'string' &&
    (typeof item.name_ai_system_en === 'string' || typeof item.name_ai_system_fr === 'string')
  )
}

export function sourceField(record: SourceRecord, base: string, lang: Lang): SourceField {
  const preferred = language(lang)
  const alternate: Lang = preferred === 'en' ? 'fr' : 'en'
  const preferredText = string(value(record, `${base}_${preferred}`))
  if (preferredText.trim())
    return { text: preferredText, language: preferred, missing: false, fallback: false }
  const fallbackText = string(value(record, `${base}_${alternate}`))
  if (fallbackText.trim())
    return { text: fallbackText, language: alternate, missing: false, fallback: true }
  return { text: '', language: preferred, missing: true, fallback: false }
}
export function field(record: SourceRecord, base: string, lang: Lang): string {
  return sourceField(record, base, lang).text
}
export function dept(rawOrg: SourceValue, lang: Lang): string {
  const raw = string(rawOrg)
  const parts = raw.split(' / ')
  return parts.length < 2 ? raw : (lang === 'fr' ? parts[1] : parts[0]).trim()
}
export function canonicalStatus(record: SourceRecord): StatusKey {
  const status = string(record.ai_system_status_en).trim().toLocaleLowerCase()
  if (status === 'in production') return 'production'
  if (status === 'in development') return 'development'
  if (status === 'retired') return 'retired'
  return 'unknown'
}
function statusLabel(key: StatusKey, lang: Lang): string {
  const labels =
    lang === 'fr'
      ? {
          production: 'En production',
          development: 'En développement',
          retired: 'Retiré',
          unknown: 'Non précisé',
        }
      : {
          production: 'In production',
          development: 'In development',
          retired: 'Retired',
          unknown: 'Not specified',
        }
  return labels[key]
}
export function year(record: SourceRecord): string {
  const match = string(record.status_date)
    .trim()
    .match(/^(\d{4})(?:\D|$)/)
  return match?.[1] ?? ''
}
function flag(raw: SourceValue): 'Y' | 'N' | '__unknown__' {
  const result = string(raw).trim().toUpperCase()
  return result === 'Y' || result === 'N' ? result : '__unknown__'
}
function developerValue(record: SourceRecord): string {
  return string(record.developed_by_en).trim() || '__unknown__'
}
function vendorValues(record: SourceRecord): string[] {
  return Array.from(
    new Set(
      string(record.vendor_information)
        .split(/,\s*/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}
function recordId(record: SourceRecord): string {
  return String(record._id ?? record.ai_register_id)
}

function normalizeState(input?: Partial<RegisterState>): RegisterState {
  const state = { ...defaults, ...input }
  return {
    query: string(state.query).slice(0, 500),
    department: string(state.department).slice(0, 500),
    status: statusKeys.includes(state.status as StatusKey) ? (state.status as StatusKey) : '',
    personalInfo: flags.has(state.personalInfo)
      ? (state.personalInfo as RegisterState['personalInfo'])
      : '',
    developedBy: string(state.developedBy).slice(0, 500),
    vendor: string(state.vendor).slice(0, 500),
    notificationAi: flags.has(state.notificationAi)
      ? (state.notificationAi as RegisterState['notificationAi'])
      : '',
    year: /^\d{4}$/.test(string(state.year)) ? string(state.year) : '',
    sortField: sortFields.has(state.sortField as SortField)
      ? (state.sortField as SortField)
      : defaults.sortField,
    sortDir: state.sortDir === 'desc' ? 'desc' : 'asc',
    groupBy: groupFields.has(state.groupBy as GroupBy) ? (state.groupBy as GroupBy) : 'none',
  }
}

function sortValue(record: SourceRecord, state: RegisterState, lang: Lang): string {
  if (state.sortField === 'department') return dept(record.government_organization, lang)
  if (state.sortField === 'status') return canonicalStatus(record)
  if (state.sortField === 'year') return year(record)
  if (state.sortField === 'vendor') return string(record.vendor_information).trim()
  if (state.sortField === 'personalInfo') return flag(record.involves_personal_information)
  return field(record, 'name_ai_system', lang)
}
function sortRecords(records: SourceRecord[], state: RegisterState, lang: Lang): SourceRecord[] {
  const unknown = (record: SourceRecord) =>
    state.sortField === 'status'
      ? canonicalStatus(record) === 'unknown'
      : state.sortField === 'year'
        ? !year(record)
        : state.sortField === 'personalInfo'
          ? flag(record.involves_personal_information) === '__unknown__'
          : !sortValue(record, state, lang).trim()
  return records.slice().sort((a, b) => {
    const aUnknown = unknown(a),
      bUnknown = unknown(b)
    if (aUnknown !== bUnknown) return aUnknown ? 1 : -1
    const compared =
      state.sortField === 'year'
        ? Number(sortValue(a, state, lang)) - Number(sortValue(b, state, lang))
        : sortValue(a, state, lang).localeCompare(
            sortValue(b, state, lang),
            lang === 'fr' ? 'fr-CA' : 'en-CA',
            { sensitivity: 'base' }
          )
    return compared
      ? state.sortDir === 'desc'
        ? -compared
        : compared
      : recordId(a).localeCompare(recordId(b), undefined, { numeric: true })
  })
}

export function filter(
  records: SourceRecord[],
  input: Partial<RegisterState>,
  lang: Lang
): SourceRecord[] {
  const state = normalizeState(input)
  const query = normalized(state.query)
  const matched = records.filter((record) => {
    if (query && !searchFields.some((key) => normalized(value(record, key)).includes(query)))
      return false
    return (
      (!state.department || record.government_organization === state.department) &&
      (!state.status || canonicalStatus(record) === state.status) &&
      (!state.personalInfo || flag(record.involves_personal_information) === state.personalInfo) &&
      (!state.developedBy || developerValue(record) === state.developedBy) &&
      (!state.vendor || vendorValues(record).includes(state.vendor)) &&
      (!state.notificationAi || flag(record.notification_ai) === state.notificationAi) &&
      (!state.year || year(record) === state.year)
    )
  })
  return sortRecords(matched, state, lang)
}
export function summary(records: SourceRecord[]) {
  return {
    total: records.length,
    organisations: new Set(
      records.map((record) => string(record.government_organization)).filter(Boolean)
    ).size,
    production: records.filter((record) => canonicalStatus(record) === 'production').length,
    personalInfo: records.filter((record) => flag(record.involves_personal_information) === 'Y')
      .length,
  }
}
function countOptions(pairs: Array<{ value: string; label: string }>): OptionRow[] {
  const values = new Map<string, OptionRow>()
  for (const { value, label } of pairs) {
    const current = values.get(value) ?? { value, label, count: 0 }
    current.count++
    values.set(value, current)
  }
  return Array.from(values.values()).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label)
  )
}
export function options(records: SourceRecord[], lang: Lang) {
  return {
    departments: countOptions(
      records
        .map((record) => ({
          value: string(record.government_organization),
          label: dept(record.government_organization, lang),
        }))
        .filter((item) => item.value)
    ),
    developers: countOptions(
      records.map((record) => ({
        value: developerValue(record),
        label:
          developerValue(record) === '__unknown__'
            ? statusLabel('unknown', lang)
            : field(record, 'developed_by', lang),
      }))
    ),
    vendors: countOptions(
      records.flatMap((record) =>
        vendorValues(record).map((vendor) => ({ value: vendor, label: vendor }))
      )
    ),
  }
}
function countRows(
  map: Map<string, number>,
  lang: Lang,
  labels?: (key: string, lang: Lang) => string
): CountRow[] {
  return Array.from(map.entries())
    .map(([key, value]) => ({ key, label: labels ? labels(key, lang) : key, value }))
    .sort(
      (a, b) =>
        b.value - a.value || a.label.localeCompare(b.label, lang === 'fr' ? 'fr-CA' : 'en-CA')
    )
}
export function aggregate(records: SourceRecord[], lang: Lang): Aggregate {
  const status = new Map<StatusKey, number>(statusKeys.map((key) => [key, 0]))
  const years = new Map<string, number>(),
    departments = new Map<string, number>(),
    pii = new Map<string, number>([
      ['Y', 0],
      ['N', 0],
      ['__unknown__', 0],
    ])
  const developers = new Map<string, number>(),
    developerLabels = new Map<string, string>(),
    vendors = new Map<string, number>(),
    yearly = new Map<string, Record<Exclude<StatusKey, 'unknown'>, number>>()
  let excluded = 0
  for (const record of records) {
    const statusKey = canonicalStatus(record)
    status.set(statusKey, (status.get(statusKey) ?? 0) + 1)
    const recordYear = year(record)
    if (recordYear) years.set(recordYear, (years.get(recordYear) ?? 0) + 1)
    const org = string(record.government_organization)
    if (org) departments.set(org, (departments.get(org) ?? 0) + 1)
    const piiKey = flag(record.involves_personal_information)
    pii.set(piiKey, (pii.get(piiKey) ?? 0) + 1)
    const developer = developerValue(record)
    developers.set(developer, (developers.get(developer) ?? 0) + 1)
    if (!developerLabels.has(developer))
      developerLabels.set(
        developer,
        developer === '__unknown__'
          ? statusLabel('unknown', lang)
          : field(record, 'developed_by', lang)
      )
    for (const vendor of vendorValues(record)) vendors.set(vendor, (vendors.get(vendor) ?? 0) + 1)
    if (!recordYear || statusKey === 'unknown') {
      excluded++
      continue
    }
    const row = yearly.get(recordYear) ?? { production: 0, development: 0, retired: 0 }
    row[statusKey]++
    yearly.set(recordYear, row)
  }
  const known = statusKeys.filter(
    (key): key is Exclude<StatusKey, 'unknown'> => key !== 'unknown' && (status.get(key) ?? 0) > 0
  )
  return {
    status: statusKeys.map((key) => ({
      key,
      label: statusLabel(key, lang),
      value: status.get(key) ?? 0,
    })),
    years: Array.from(years.entries())
      .map(([key, value]) => ({ key, label: key, value }))
      .sort((a, b) => Number(a.key) - Number(b.key)),
    departments: countRows(departments, lang, (key, current) => dept(key, current)),
    pii: ['Y', 'N', '__unknown__'].map((key) => ({
      key,
      label:
        key === 'Y'
          ? lang === 'fr'
            ? 'Traite des renseignements personnels'
            : 'Handles personal information'
          : key === 'N'
            ? lang === 'fr'
              ? 'Aucun renseignement personnel'
              : 'No personal information'
            : statusLabel('unknown', lang),
      value: pii.get(key) ?? 0,
    })),
    developers: countRows(
      developers,
      lang,
      (key, current) =>
        developerLabels.get(key) ?? (key === '__unknown__' ? statusLabel('unknown', current) : key)
    ),
    vendors: countRows(vendors, lang),
    statusYears: {
      statuses: known,
      rows: Array.from(yearly.entries())
        .map(([year, counts]) => ({ year, counts }))
        .sort((a, b) => Number(a.year) - Number(b.year)),
      excluded,
    },
  }
}
export function group(records: SourceRecord[], groupBy: GroupBy, lang: Lang): GroupRow[] {
  if (groupBy === 'none')
    return [
      {
        key: 'all',
        label: lang === 'fr' ? 'Tous les systèmes' : 'All systems',
        records: records.slice(),
      },
    ]
  const groups = new Map<string, GroupRow>()
  const add = (key: string, label: string, record: SourceRecord) => {
    const current = groups.get(key) ?? { key, label, records: [] }
    current.records.push(record)
    groups.set(key, current)
  }
  for (const record of records) {
    if (groupBy === 'department') {
      const raw = string(record.government_organization) || '__unknown__'
      add(raw, raw === '__unknown__' ? statusLabel('unknown', lang) : dept(raw, lang), record)
    } else if (groupBy === 'status') {
      const key = canonicalStatus(record)
      add(key, statusLabel(key, lang), record)
    } else {
      const vendors = vendorValues(record)
      if (!vendors.length)
        add(
          '__unknown__',
          lang === 'fr' ? 'Aucun fournisseur précisé' : 'No vendor specified',
          record
        )
      for (const vendor of vendors) add(vendor, vendor, record)
    }
  }
  return Array.from(groups.values()).sort(
    (a, b) =>
      b.records.length - a.records.length ||
      a.label.localeCompare(b.label, lang === 'fr' ? 'fr-CA' : 'en-CA')
  )
}
function csvCell(value: SourceValue): string {
  const text = String(value ?? '')
  const unsafe = /^[=+\-@]/.test(text.trimStart()) || /^[\t\r\n]/.test(text)
  return `"${(unsafe ? `'${text}` : text).replace(/"/g, '""')}"`
}
export function csv(records: SourceRecord[], lang: Lang): string {
  const headers = csvColumns.map((column) =>
    column.endsWith('_system') ||
    column.startsWith('description_') ||
    column.startsWith('ai_system_') ||
    column.startsWith('developed_') ||
    column.startsWith('data_') ||
    column.startsWith('personal_information_')
      ? `${column}_${lang}`
      : column
  )
  return [
    headers.join(','),
    ...records.map((record) => headers.map((header) => csvCell(value(record, header))).join(',')),
  ].join('\n')
}
export function stateFromParams(search: URLSearchParams | string): RegisterState {
  let params: URLSearchParams
  try {
    params =
      search instanceof URLSearchParams
        ? search
        : new URLSearchParams(string(search).replace(/^\?/, ''))
  } catch {
    params = new URLSearchParams()
  }
  const state: Partial<RegisterState> = {}
  for (const key of Object.keys(defaults) as Array<keyof RegisterState>)
    if (params.has(key)) state[key] = params.get(key) as never
  return normalizeState(state)
}
export function paramsFromState(input: Partial<RegisterState>): URLSearchParams {
  const state = normalizeState(input),
    params = new URLSearchParams()
  for (const key of Object.keys(defaults) as Array<keyof RegisterState>)
    if (state[key] !== defaults[key]) params.set(key, state[key])
  return params
}
