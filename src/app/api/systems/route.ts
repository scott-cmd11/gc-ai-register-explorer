import { NextResponse } from 'next/server'

const RESOURCE_ID = '369f6f34-148a-42ed-b581-8c164e941a89'
const PAGE_SIZE = 1000
const FETCH_TIMEOUT_MS = 8000
const MAX_FETCH_ATTEMPTS = 2
const CKAN_URL = 'https://open.canada.ca/data/api/3/action/datastore_search'
const META_URL = `https://open.canada.ca/data/api/3/action/resource_show?id=${RESOURCE_ID}`

type CkanRecord = Record<string, unknown>
type DataWarning = {
  code: 'partial_dataset' | 'invalid_records'
  message: string
  total?: number
  returned?: number
  rejected?: number
}

function datastoreUrl(offset: number) {
  const params = new URLSearchParams({
    resource_id: RESOURCE_ID,
    limit: String(PAGE_SIZE),
    offset: String(offset),
  })
  return `${CKAN_URL}?${params.toString()}`
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJson(url: string) {
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const response = await fetch(url, { next: { revalidate: 3600 }, signal: controller.signal })
      if (!response.ok) {
        throw new Error(`Upstream request failed for ${new URL(url).pathname} with status ${response.status}`)
      }
      return response.json()
    } catch (error) {
      lastError = error
      if (attempt < MAX_FETCH_ATTEMPTS) {
        await wait(250 * attempt)
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Upstream request failed for ${new URL(url).pathname}`)
}

function isValidSystemRecord(record: unknown): record is CkanRecord {
  if (record === null || typeof record !== 'object' || Array.isArray(record)) return false
  const value = record as CkanRecord
  return (
    typeof value.ai_register_id === 'string' &&
    typeof value.government_organization === 'string' &&
    (typeof value.name_ai_system_en === 'string' || typeof value.name_ai_system_fr === 'string')
  )
}

function extractRecords(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error('Upstream response did not include a records array.')
  }
  const records = value.filter(isValidSystemRecord)
  return { records, rejected: value.length - records.length }
}

async function fetchSystems() {
  const firstPage = await fetchJson(datastoreUrl(0))
  if (!firstPage?.result || typeof firstPage.result !== 'object') {
    throw new Error('Upstream response did not include the expected result object.')
  }

  const first = extractRecords(firstPage.result.records)
  const firstRecords = first.records
  const total = Number.isFinite(Number(firstPage?.result?.total))
    ? Number(firstPage.result.total)
    : firstRecords.length

  if (total <= firstRecords.length) {
    return { records: firstRecords, total, rejected: first.rejected }
  }

  const offsets: number[] = []
  for (let offset = firstRecords.length; offset < total; offset += PAGE_SIZE) offsets.push(offset)

  const extraPages = await Promise.all(offsets.map((offset) => fetchJson(datastoreUrl(offset))))
  const extracted = extraPages.map((page) => {
    if (!page?.result || typeof page.result !== 'object') {
      throw new Error('Upstream response did not include the expected result object.')
    }
    return extractRecords(page.result.records)
  })
  const extraRecords = extracted.flatMap((page) => page.records)
  const rejected = first.rejected + extracted.reduce((sum, page) => sum + page.rejected, 0)

  return { records: [...firstRecords, ...extraRecords], total, rejected }
}

async function fetchLastModified() {
  try {
    const meta = await fetchJson(META_URL)
    return typeof meta?.result?.last_modified === 'string'
      ? meta.result.last_modified
      : typeof meta?.result?.metadata_modified === 'string'
      ? meta.result.metadata_modified
      : null
  } catch (error) {
    console.warn('[systems] Unable to retrieve source metadata.', error)
    return null
  }
}

export async function GET() {
  try {
    const [{ records, total, rejected }, lastModified] = await Promise.all([
      fetchSystems(),
      fetchLastModified(),
    ])
    const warnings: DataWarning[] = []

    if (total > records.length) {
      console.warn(`[systems] CKAN reports ${total} records but only ${records.length} valid records were returned.`)
      warnings.push({
        code: 'partial_dataset',
        message: 'The source API reported more records than this page received.',
        total,
        returned: records.length,
      })
    }
    if (rejected > 0) {
      console.warn(`[systems] Skipped ${rejected} source records that did not match the expected AI registry shape.`)
      warnings.push({
        code: 'invalid_records',
        message: 'Some source records were skipped because they did not include the minimum display fields.',
        rejected,
      })
    }

    return NextResponse.json({ records, lastModified, total, warnings })
  } catch (error) {
    console.error('[systems] Unable to retrieve AI registry data.', error)
    return NextResponse.json({ error: 'Unable to retrieve data. Please try again later.' }, { status: 502 })
  }
}
