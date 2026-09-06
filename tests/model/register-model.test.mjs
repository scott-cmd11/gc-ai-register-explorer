import test from 'node:test'
import assert from 'node:assert/strict'
import { aggregate, canonicalStatus, csv, filter, group, isSourceRecord, options, sourceField, summary, year } from '../../src/lib/register/model.ts'

const records = [
  { _id: 2, ai_register_id: 'AI-002', government_organization: 'Science Canada / Sciences Canada', name_ai_system_en: 'Flood finder', name_ai_system_fr: '', ai_system_status_en: 'In production', status_date: 2023, vendor_information: 'Map Co, Cloud Co, Map Co', involves_personal_information: '', notification_ai: 'N', developed_by_en: 'Vendor' },
  { _id: 1, ai_register_id: 'AI-001', government_organization: 'Science Canada / Sciences Canada', name_ai_system_en: '', name_ai_system_fr: 'Repère des crues', ai_system_status_en: '', status_date: '2022-10-01', vendor_information: 'Cloud Co', involves_personal_information: 'Y', notification_ai: 'Y', developed_by_en: '' },
]

test('numeric status years filter and aggregate without changing their source representation', () => {
  assert.equal(year(records[0]), '2023')
  assert.deepEqual(filter(records, { year: '2023' }, 'en').map((record) => record.ai_register_id), ['AI-002'])
  assert.deepEqual(aggregate(records, 'en').years.map((row) => row.key), ['2022', '2023'])
})
test('missing flags remain unknown and bilingual display falls back before not specified', () => {
  assert.equal(canonicalStatus(records[1]), 'unknown')
  assert.equal(aggregate(records, 'en').pii.find((row) => row.key === '__unknown__')?.value, 1)
  assert.deepEqual(sourceField(records[1], 'name_ai_system', 'en'), { text: 'Repère des crues', language: 'fr', missing: false, fallback: true })
  assert.equal(sourceField(records[1], 'description_ai_system', 'en').missing, true)
})
test('record IDs are searchable and comma-delimited vendors overlap only in vendor views', () => {
  assert.deepEqual(filter(records, { query: 'AI-002' }, 'en').map((record) => record.ai_register_id), ['AI-002'])
  assert.equal(options(records, 'en').vendors.find((row) => row.value === 'Cloud Co')?.count, 2)
  assert.equal(group(records, 'vendor', 'en').find((row) => row.key === 'Cloud Co')?.records.length, 2)
  assert.equal(summary(records).total, 2)
})
test('CSV preserves one system per row and neutralizes spreadsheet formulas', () => {
  const output = csv([{ ...records[0], data_sources_en: '=HYPERLINK("https://example.test","Map")' }], 'en')
  assert.equal(output.split('\n').length, 2)
  assert.match(output, /"'=HYPERLINK/)
})
test('a 412-record snapshot remains complete when returned count equals source total', () => {
  const snapshot = Array.from({ length: 412 }, (_, index) => ({ _id: index + 1, ai_register_id: `AI-${index + 1}`, government_organization: 'Canada / Canada', name_ai_system_en: `System ${index + 1}` }))
  assert.deepEqual(summary(snapshot), { total: 412, organisations: 1, production: 0, personalInfo: 0 })
})
test('blank AI Register IDs are rejected while numeric source years remain valid', () => {
  assert.equal(isSourceRecord({ ai_register_id: '   ', government_organization: 'Canada', name_ai_system_en: 'System' }), false)
  assert.equal(isSourceRecord({ ai_register_id: 'AI-003', government_organization: 'Canada', name_ai_system_en: 'System', status_date: 2026 }), true)
})
