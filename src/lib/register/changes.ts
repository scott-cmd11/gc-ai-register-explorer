// Compares the live register with a stored copy of an earlier government update.
// Stored copies live in data/snapshots/, one file per source "last modified" date,
// written by scripts/snapshot-register.mjs on a schedule.
import type { SourceRecord, SourceValue } from './model.ts'

export type Snapshot = {
  lastModified: string
  capturedAt: string
  total: number
  records: SourceRecord[]
}
export type RemovedRecord = {
  id: string
  name_en: string
  name_fr: string
  organisation: string
}
export type RecordChanges = {
  since: string
  added: string[]
  updated: Array<{ id: string; fields: string[] }>
  removed: RemovedRecord[]
}

// "2026-04-28T20:10:07.759825" -> "2026-04-28T20-10-07.json"; sorts in date order.
export function snapshotFileName(lastModified: string): string {
  return `${lastModified.slice(0, 19).replace(/:/g, '-')}.json`
}

// The newest stored copy from strictly before the live update, so the comparison
// always describes the latest government update, whether or not it is stored yet.
export function pickBaseline(fileNames: string[], liveLastModified: string | null): string | null {
  if (!liveLastModified) return null
  const live = snapshotFileName(liveLastModified)
  const earlier = fileNames.filter((name) => /^\d{4}-\d{2}-\d{2}T[\d-]+\.json$/.test(name) && name < live)
  return earlier.sort().at(-1) ?? null
}

function comparable(value: SourceValue): string {
  return value === null || value === undefined ? '' : String(value).replace(/\s+/g, ' ').trim()
}
// _id is the portal's row number, which can change without the record changing.
function fieldsOf(record: SourceRecord): string[] {
  return Object.keys(record).filter((key) => key !== '_id')
}

// Strips portal row numbers and orders by register ID so stored copies diff cleanly.
export function snapshotRecords(records: SourceRecord[]): SourceRecord[] {
  return records
    .map(({ _id, ...rest }) => rest as SourceRecord)
    .sort((a, b) => a.ai_register_id.localeCompare(b.ai_register_id))
}

export function diffRecords(
  previous: SourceRecord[],
  current: SourceRecord[],
  since: string
): RecordChanges {
  const before = new Map(previous.map((record) => [record.ai_register_id, record]))
  const now = new Set(current.map((record) => record.ai_register_id))
  const added: string[] = []
  const updated: RecordChanges['updated'] = []
  for (const record of current) {
    const old = before.get(record.ai_register_id)
    if (!old) {
      added.push(record.ai_register_id)
      continue
    }
    const keys = new Set([...fieldsOf(old), ...fieldsOf(record)])
    const fields = Array.from(keys)
      .filter((key) => comparable(old[key]) !== comparable(record[key]))
      .sort()
    if (fields.length) updated.push({ id: record.ai_register_id, fields })
  }
  const removed = previous
    .filter((record) => !now.has(record.ai_register_id))
    .map((record) => ({
      id: record.ai_register_id,
      name_en: comparable(record.name_ai_system_en),
      name_fr: comparable(record.name_ai_system_fr),
      organisation: comparable(record.government_organization),
    }))
  return { since, added, updated, removed }
}

export function hasChanges(changes: RecordChanges): boolean {
  return changes.added.length + changes.updated.length + changes.removed.length > 0
}
