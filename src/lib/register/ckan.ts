// Fetches the official AI Register from the Government of Canada open data API (CKAN).
// Shared by the site's data route and the scheduled snapshot script, so both apply
// the same validation, paging and de-duplication rules.
import { isSourceRecord, type SourceRecord } from './model.ts'
import { dedupeOfficialRecords, sourcePageOffsets } from './source-snapshot.ts'

const RESOURCE_ID = '369f6f34-148a-42ed-b581-8c164e941a89'
const PAGE_SIZE = 1000
const FETCH_TIMEOUT_MS = 8000
const MAX_FETCH_ATTEMPTS = 2
const CKAN_URL = 'https://open.canada.ca/data/api/3/action/datastore_search'
const META_URL = `https://open.canada.ca/data/api/3/action/resource_show?id=${RESOURCE_ID}`

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

export async function fetchSystems() {
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

export async function fetchLastModified() {
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

export async function fetchFreshSourceSnapshot() {
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

