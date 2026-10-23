import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Snapshot } from './changes.ts'
import { isSourceRecord } from './model.ts'

const snapshotName = /^\d{4}-\d{2}-\d{2}T[\d-]+\.json$/

export async function readLatestStoredSnapshot(directory: string): Promise<Snapshot | null> {
  let names: string[]
  try {
    names = (await readdir(directory)).filter((name) => snapshotName.test(name)).sort().reverse()
  } catch {
    return null
  }

  for (const name of names) {
    try {
      const snapshot = JSON.parse(await readFile(path.join(directory, name), 'utf8')) as Partial<Snapshot>
      if (
        typeof snapshot.lastModified === 'string' &&
        typeof snapshot.capturedAt === 'string' &&
        Number.isFinite(snapshot.total) &&
        Array.isArray(snapshot.records) &&
        snapshot.records.length > 0 &&
        snapshot.records.every(isSourceRecord)
      ) {
        return snapshot as Snapshot
      }
    } catch {
      // Ignore an invalid archive copy and try the next one.
    }
  }
  return null
}
