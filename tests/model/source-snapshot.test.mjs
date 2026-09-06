import test from 'node:test'
import assert from 'node:assert/strict'
import { dedupeOfficialRecords, sourcePageOffsets } from '../../src/lib/register/source-snapshot.ts'

test('an invalid record in the first raw page does not shift the next CKAN offset', () => {
  const rawFirstPage = Array.from({ length: 1000 }, (_, index) => index === 24 ? { invalid: true } : { ai_register_id: `AI-${index}` })
  const admittedRecords = rawFirstPage.filter((record) => 'ai_register_id' in record)

  assert.equal(admittedRecords.length, 999)
  assert.deepEqual(sourcePageOffsets({ total: 2_001, rawFirstPageLength: rawFirstPage.length, pageSize: 1_000 }), [1_000, 2_000])
})

test('a short raw page before the reported source total fails closed', () => {
  assert.throws(
    () => sourcePageOffsets({ total: 1_001, rawFirstPageLength: 999, pageSize: 1_000 }),
    /pagination ended before the reported source total/,
  )
})

test('duplicate official record IDs are omitted while preserving source order', () => {
  const result = dedupeOfficialRecords([
    { ai_register_id: 'AI-002', government_organization: 'A', name_ai_system_en: 'First' },
    { ai_register_id: 'AI-002', government_organization: 'A', name_ai_system_en: 'Duplicate' },
    { ai_register_id: 'AI-003', government_organization: 'A', name_ai_system_en: 'Later' },
  ])

  assert.deepEqual(result.records.map((record) => record.name_ai_system_en), ['First', 'Later'])
  assert.equal(result.duplicates, 1)
})
