import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { readLatestStoredSnapshot } from '../../src/lib/register/stored-snapshot.ts'

const record = {
  ai_register_id: 'AI-001',
  government_organization: 'Example department',
  name_ai_system_en: 'Example system',
}
const snapshot = (capturedAt, records = [record]) => ({
  lastModified: '2026-04-28T20:10:07.759825',
  capturedAt,
  total: records.length,
  records,
})

test('fallback chooses the newest valid snapshot and preserves its capture time', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'ai-register-snapshot-'))
  try {
    await writeFile(path.join(directory, '2026-04-28T20-10-07.json'), JSON.stringify(snapshot('older')))
    await writeFile(path.join(directory, '2026-10-22T20-10-07.json'), JSON.stringify(snapshot('newer')))
    const result = await readLatestStoredSnapshot(directory)
    assert.equal(result?.capturedAt, 'newer')
    assert.equal(result?.records.length, 1)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('fallback skips malformed or incomplete archives and returns null when none are valid', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'ai-register-snapshot-'))
  try {
    await writeFile(path.join(directory, '2026-10-22T20-10-07.json'), '{not json')
    await writeFile(path.join(directory, '2026-10-21T20-10-07.json'), JSON.stringify(snapshot('missing-records', [])))
    assert.equal(await readLatestStoredSnapshot(directory), null)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
