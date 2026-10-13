import test from 'node:test'
import assert from 'node:assert/strict'
import { diffRecords, hasChanges, pickBaseline, snapshotFileName, snapshotRecords } from '../../src/lib/register/changes.ts'
import { filter } from '../../src/lib/register/model.ts'

const base = { government_organization: 'Org / Org', name_ai_system_en: 'A' }

test('the baseline is the newest stored copy strictly before the live update', () => {
  const files = ['2026-01-10T09-00-00.json', '2026-04-28T20-10-07.json', 'README.md']
  assert.equal(snapshotFileName('2026-04-28T20:10:07.759825'), '2026-04-28T20-10-07.json')
  assert.equal(pickBaseline(files, '2026-04-28T20:10:07.759825'), '2026-01-10T09-00-00.json')
  assert.equal(pickBaseline(files, '2026-11-02T08:00:00'), '2026-04-28T20-10-07.json')
  assert.equal(pickBaseline(['2026-04-28T20-10-07.json'], '2026-04-28T20:10:07.759825'), null)
  assert.equal(pickBaseline(files, null), null)
})
test('differences ignore portal row numbers and spacing, and list edited fields', () => {
  const before = [
    { _id: 1, ai_register_id: 'K', ...base, ai_system_status_en: 'In development' },
    { _id: 2, ai_register_id: 'R', ...base },
    { _id: 3, ai_register_id: 'S', ...base, description_ai_system_en: 'Same  text' },
  ]
  const after = [
    { _id: 9, ai_register_id: 'K', ...base, ai_system_status_en: 'In production' },
    { _id: 7, ai_register_id: 'N', ...base },
    { _id: 8, ai_register_id: 'S', ...base, description_ai_system_en: 'Same text ' },
  ]
  const changes = diffRecords(before, after, '2026-01-10')
  assert.deepEqual(changes.added, ['N'])
  assert.deepEqual(changes.updated, [{ id: 'K', fields: ['ai_system_status_en'] }])
  assert.deepEqual(changes.removed.map((row) => row.id), ['R'])
  assert.equal(hasChanges(diffRecords(before, before, 'x')), false)
  assert.deepEqual(snapshotRecords(after).map((row) => [row.ai_register_id, '_id' in row]), [['K', false], ['N', false], ['S', false]])
})
test('the changed filter selects new, edited, or both', () => {
  const rows = ['A', 'B', 'C'].map((id) => ({ ai_register_id: id, ...base }))
  const sets = { added: new Set(['A']), updated: new Set(['B']) }
  const ids = (changed) => filter(rows, { changed }, 'en', sets).map((row) => row.ai_register_id)
  assert.deepEqual(ids('any'), ['A', 'B'])
  assert.deepEqual(ids('new'), ['A'])
  assert.deepEqual(ids('updated'), ['B'])
  assert.deepEqual(ids(''), ['A', 'B', 'C'])
  assert.deepEqual(filter(rows, { changed: 'any' }, 'en', null), [])
})
