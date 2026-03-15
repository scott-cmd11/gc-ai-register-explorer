import { NextResponse } from 'next/server'

const RESOURCE_ID = '369f6f34-148a-42ed-b581-8c164e941a89'
const CKAN_URL = `https://open.canada.ca/data/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=1000`
const META_URL = `https://open.canada.ca/data/api/3/action/resource_show?id=${RESOURCE_ID}`

export async function GET() {
  const [dataRes, metaRes] = await Promise.all([
    fetch(CKAN_URL, { next: { revalidate: 3600 } }),
    fetch(META_URL, { next: { revalidate: 3600 } }),
  ])
  // F-06: Return a generic error — do not expose upstream HTTP status codes.
  if (!dataRes.ok) {
    return NextResponse.json({ error: 'Unable to retrieve data. Please try again later.' }, { status: 502 })
  }

  const [data, meta] = await Promise.all([dataRes.json(), metaRes.json()])

  // F-07: Validate response shape before accessing nested properties.
  const records: unknown[] = Array.isArray(data?.result?.records) ? data.result.records : []
  const lastModified: string | null = meta?.result?.last_modified ?? meta?.result?.metadata_modified ?? null

  return NextResponse.json({ records, lastModified })
}
