import { NextResponse } from 'next/server'

const RESOURCE_ID = '369f6f34-148a-42ed-b581-8c164e941a89'
const CKAN_URL = `https://open.canada.ca/data/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=500`
const META_URL = `https://open.canada.ca/data/api/3/action/resource_show?id=${RESOURCE_ID}`

export async function GET() {
  const [dataRes, metaRes] = await Promise.all([
    fetch(CKAN_URL, { next: { revalidate: 3600 } }),
    fetch(META_URL, { next: { revalidate: 3600 } }),
  ])
  if (!dataRes.ok) {
    return NextResponse.json({ error: `Upstream error: ${dataRes.status}` }, { status: 502 })
  }
  const [data, meta] = await Promise.all([dataRes.json(), metaRes.json()])
  const lastModified: string | null = meta?.result?.last_modified ?? meta?.result?.metadata_modified ?? null
  return NextResponse.json({ records: data.result.records, lastModified })
}
