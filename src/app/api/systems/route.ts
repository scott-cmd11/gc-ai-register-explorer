import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fetchFreshSourceSnapshot } from '@/lib/register/ckan'
import { diffRecords, pickBaseline, type RecordChanges, type Snapshot } from '@/lib/register/changes'
import { readLatestStoredSnapshot } from '@/lib/register/stored-snapshot'
import { sourceFailureResult } from '@/lib/register/source-failure'
import type { SourceRecord } from '@/lib/register/model'

type DataWarning = {
  code: 'partial_dataset' | 'invalid_records' | 'duplicate_records' | 'stale_snapshot'
  message: string
  total?: number
  returned?: number
  rejected?: number
}

const getCachedSourceSnapshot = unstable_cache(
  fetchFreshSourceSnapshot,
  ['ai-register-source-snapshot-v1'],
  { revalidate: 3600 }
)

const snapshotDirectory = path.join(process.cwd(), 'data', 'snapshots')
const changeCache = new Map<string, RecordChanges | null>()

// Compares the live register with the stored copy of the previous government update.
// Any problem here only hides the "what changed" summary; it never blocks the data.
async function latestChanges(records: SourceRecord[], lastModified: string | null) {
  if (!lastModified) return null
  const key = `${lastModified}:${records.length}`
  if (changeCache.has(key)) return changeCache.get(key) ?? null
  let changes: RecordChanges | null = null
  try {
    const baseline = pickBaseline(await readdir(snapshotDirectory), lastModified)
    if (baseline) {
      const stored = JSON.parse(
        await readFile(path.join(snapshotDirectory, baseline), 'utf8')
      ) as Snapshot
      changes = diffRecords(stored.records, records, stored.lastModified)
    }
  } catch (error) {
    console.warn('[systems] Unable to compare with stored register copies.', error)
  }
  changeCache.set(key, changes)
  return changes
}

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

    const changes = await latestChanges(records, lastModified)
    return NextResponse.json({ records, lastModified, snapshotAt, total, warnings, changes })
  } catch (error) {
    console.error('[systems] Unable to retrieve AI registry data.', error)
    const snapshot = await readLatestStoredSnapshot(snapshotDirectory)
    const fallback = sourceFailureResult(snapshot)
    return NextResponse.json(fallback.body, { status: fallback.status })
  }
}
