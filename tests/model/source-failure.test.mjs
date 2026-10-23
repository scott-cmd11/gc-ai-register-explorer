import test from 'node:test'
import assert from 'node:assert/strict'
import { sourceFailureResult } from '../../src/lib/register/source-failure.ts'

const snapshot = {
  lastModified: '2026-04-28T20:10:07.759825',
  capturedAt: '2026-10-13T01:43:26.205Z',
  total: 1,
  records: [{ ai_register_id: 'AI-001', government_organization: 'Example', name_ai_system_en: 'System' }],
}

test('endpoint failure returns stale snapshot metadata with HTTP 200', () => {
  const result = sourceFailureResult(snapshot)
  assert.equal(result.status, 200)
  assert.equal(result.body.records.length, 1)
  assert.equal(result.body.total, 1)
  assert.equal(result.body.lastModified, snapshot.lastModified)
  assert.equal(result.body.snapshotAt, snapshot.capturedAt)
  assert.equal(result.body.warnings[0].code, 'stale_snapshot')
})

test('endpoint failure remains HTTP 502 when no valid snapshot exists', () => {
  const result = sourceFailureResult(null)
  assert.equal(result.status, 502)
  assert.deepEqual(result.body, { error: 'Unable to retrieve data. Please try again later.' })
})
