import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchAllSystems } from '../../src/lib/api.ts'

const stalePayload = {
  records: [{ ai_register_id: 'AI-001' }],
  lastModified: '2026-04-28T20:10:07.759825',
  snapshotAt: '2026-10-13T01:43:26.205Z',
  total: 1,
  warnings: [{ code: 'stale_snapshot', message: 'Stored snapshot' }],
  changes: null,
}

test('client accepts a successful stale-snapshot response before the deadline', async () => {
  const payload = await fetchAllSystems(
    async (_url, options) => {
      assert.ok(options?.signal)
      return new Response(JSON.stringify(stalePayload), { status: 200 })
    },
    50
  )
  assert.equal(payload.systems.length, 1)
  assert.equal(payload.warnings[0].code, 'stale_snapshot')
  assert.equal(payload.snapshotAt, stalePayload.snapshotAt)
})

test('client rejects a request that never resolves', async () => {
  await assert.rejects(
    fetchAllSystems(() => new Promise(() => {}), 10),
    /timed out/
  )
})

test('client rejects a response body that never resolves', async () => {
  const response = {
    ok: true,
    json: () => new Promise(() => {}),
  }
  await assert.rejects(fetchAllSystems(async () => response, 10), /timed out/)
})
