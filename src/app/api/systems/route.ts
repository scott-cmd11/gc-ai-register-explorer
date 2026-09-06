import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { isSourceRecord, type SourceRecord } from '@/lib/register/model'
import { dedupeOfficialRecords, sourcePageOffsets } from '@/lib/register/source-snapshot'

const RESOURCE_ID = '369f6f34-148a-42ed-b581-8c164e941a89'
const PAGE_SIZE = 1000
const FETCH_TIMEOUT_MS = 8000
const MAX_FETCH_ATTEMPTS = 2
const CKAN_URL = 'https://open.canada.ca/data/api/3/action/datastore_search'
const META_URL = `https://open.canada.ca/data/api/3/action/resource_show?id=${RESOURCE_ID}`

type DataWarning = {
  code: 'partial_dataset' | 'invalid_records' | 'duplicate_records'
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
      const response = await fetch(url, { cache: 'no-store', signal: controller.signal })
      if (!response.ok) {
        throw new Error(
          `Upstream request failed for ${new URL(url).pathname} with status ${response.status}`
        )
      }
      return await response.json()
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

function extractRecords(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error('Upstream response did not include a records array.')
  }
  const records = value.filter(isSourceRecord) as SourceRecord[]
  return { records, rawLength: value.length, rejected: value.length - records.length }
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
    : first.rawLength

  const offsets = sourcePageOffsets({
    total,
    rawFirstPageLength: first.rawLength,
    pageSize: PAGE_SIZE,
  })

  const extraPages = await Promise.all(offsets.map((offset) => fetchJson(datastoreUrl(offset))))
  const extracted = extraPages.map((page) => {
    if (!page?.result || typeof page.result !== 'object') {
      throw new Error('Upstream response did not include the expected result object.')
    }
    return extractRecords(page.result.records)
  })
  const extraRecords = extracted.flatMap((page) => page.records)
  const rejected = first.rejected + extracted.reduce((sum, page) => sum + page.rejected, 0)
  const deduped = dedupeOfficialRecords([...firstRecords, ...extraRecords])

  return { records: deduped.records, total, rejected, duplicates: deduped.duplicates }
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

async function fetchFreshSourceSnapshot() {
  const [{ records, total, rejected, duplicates }, lastModified] = await Promise.all([
    fetchSystems(),
    fetchLastModified(),
  ])
  return {
    records,
    total,
    rejected,
    duplicates,
    lastModified,
    snapshotAt: new Date().toISOString(),
  }
}

const getCachedSourceSnapshot = unstable_cache(
  fetchFreshSourceSnapshot,
  ['ai-register-source-snapshot-v1'],
  { revalidate: 3600 }
)

export async function GET() {
  try {
    const { records, total, rejected, duplicates, lastModified, snapshotAt } =
      await getCachedSourceSnapshot()
    const warnings: DataWarning[] = []

    if (total > records.length) {
      console.warn(
        `[systems] CKAN reports ${total} records but only ${records.length} valid records were returned.`
      )
      warnings.push({
        code: 'partial_dataset',
        message: 'The source API reported more records than this page received.',
        total,
        returned: records.length,
      })
    }
    if (rejected > 0) {
      console.warn(
        `[systems] Skipped ${rejected} source records that did not match the expected AI registry shape.`
      )
      warnings.push({
        code: 'invalid_records',
        message:
          'Some source records were skipped because they did not include the minimum display fields.',
        rejected,
      })
    }
    if (duplicates > 0) {
      console.warn(
        `[systems] Omitted ${duplicates} duplicate source records with repeated AI Register IDs.`
      )
      warnings.push({
        code: 'duplicate_records',
        message: 'Some repeated source records were omitted using their official AI Register ID.',
      })
    }

    return NextResponse.json({ records, lastModified, snapshotAt, total, warnings })
  } catch (error) {
    console.error('[systems] Unable to retrieve AI registry data.', error)
    return NextResponse.json(
      { error: 'Unable to retrieve data. Please try again later.' },
      { status: 502 }
    )
  }
}
