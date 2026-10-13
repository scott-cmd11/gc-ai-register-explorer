// Saves a copy of the official AI Register when the government publishes an update.
// Run daily by .github/workflows/register-snapshot.yml; safe to run by hand:
//   node scripts/snapshot-register.mjs
// Writes nothing (and exits 0) when the source is unchanged. Exits 1 without writing
// when the source looks incomplete, so a partial download is never stored.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { fetchFreshSourceSnapshot } from '../src/lib/register/ckan.ts'
import { snapshotFileName, snapshotRecords, diffRecords, hasChanges } from '../src/lib/register/changes.ts'

const directory = new URL('../data/snapshots/', import.meta.url)

const live = await fetchFreshSourceSnapshot()
if (!live.lastModified) {
  console.error('Source did not report a last-modified date; not saving.')
  process.exit(1)
}
if (live.total > live.records.length || live.rejected > 0 || live.records.length === 0) {
  console.error(
    `Source looks incomplete (${live.records.length} valid of ${live.total}, ${live.rejected} rejected); not saving.`
  )
  process.exit(1)
}

await mkdir(directory, { recursive: true })
const names = (await readdir(directory)).filter((name) => name.endsWith('.json')).sort()
const name = snapshotFileName(live.lastModified)
const records = snapshotRecords(live.records)

if (names.includes(name)) {
  console.log(`Already stored: ${name}`)
  process.exit(0)
}
const latest = names.at(-1)
if (latest) {
  const previous = JSON.parse(await readFile(new URL(latest, directory), 'utf8'))
  if (!hasChanges(diffRecords(previous.records, records, previous.lastModified))) {
    console.log(`Source date changed but no record changed since ${latest}; not saving.`)
    process.exit(0)
  }
}

const snapshot = {
  lastModified: live.lastModified,
  capturedAt: live.snapshotAt,
  total: records.length,
  records,
}
await writeFile(new URL(name, directory), JSON.stringify(snapshot, null, 1) + '\n')
console.log(`Saved ${name} (${records.length} records).`)
