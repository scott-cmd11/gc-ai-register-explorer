import { NextResponse } from 'next/server'

const RESOURCE_ID = '369f6f34-148a-42ed-b581-8c164e941a89'
const PAGE_SIZE = 1000
const CKAN_URL = 'https://open.canada.ca/data/api/3/action/datastore_search'
const META_URL = `https://open.canada.ca/data/api/3/action/resource_show?id=${RESOURCE_ID}`

type CkanRecord = Record<string, unknown>

function datastoreUrl(offset: number) {
  const params = new URLSearchParams({
    resource_id: RESOURCE_ID,
    limit: String(PAGE_SIZE),
    offset: String(offset),
  })
  return `${CKAN_URL}?${params.toString()}`
}

async function fetchJson(url: string) {
  const response = await fetch(url, { next: { revalidate: 3600 } })
  if (!response.ok) throw new Error(`Upstream request failed for ${new URL(url).pathname}`)
  return response.json()
}

function validRecords(value: unknown): CkanRecord[] {
  if (!Array.isArray(value)) return []
  return value.filter((record): record is CkanRecord =>
    record !== null && typeof record === 'object' && !Array.isArray(record)
  )
}

async function fetchSystems() {
  const firstPage = await fetchJson(datastoreUrl(0))
  const firstRecords = validRecords(firstPage?.result?.records)
  const total = Number.isFinite(Number(firstPage?.result?.total))
    ? Number(firstPage.result.total)
    : firstRecords.length

  if (total <= firstRecords.length) {
    return { records: firstRecords, total }
  }

  const offsets: number[] = []
  for (let offset = firstRecords.length; offset < total; offset += PAGE_SIZE) offsets.push(offset)

  const extraPages = await Promise.all(offsets.map((offset) => fetchJson(datastoreUrl(offset))))
  const extraRecords = extraPages.flatMap((page) => validRecords(page?.result?.records))

  return { records: [...firstRecords, ...extraRecords], total }
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
    const [{ records, total }, lastModified] = await Promise.all([
      fetchSystems(),
      fetchLastModified(),
    ])

    if (total > records.length) {
      console.warn(`[systems] CKAN reports ${total} records but only ${records.length} valid records were returned.`)
    }

    return NextResponse.json({ records, lastModified, total })
  } catch (error) {
    console.error('[systems] Unable to retrieve AI registry data.', error)
    return NextResponse.json({ error: 'Unable to retrieve data. Please try again later.' }, { status: 502 })
  }
}
