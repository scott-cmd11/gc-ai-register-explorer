import test from 'node:test'
import assert from 'node:assert/strict'
import { aggregate, audience, canonicalStatus, excerpt, highlight, organisationProfile, paramsFromState, stateFromParams, csv, filter, group, isSourceRecord, options, sourceField, summary, year } from '../../src/lib/register/model.ts'

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
  assert.deepEqual(summary(snapshot), { total: 412, organisations: 1, production: 0, personalInfo: 0, public: 0 })
})
test('blank AI Register IDs are rejected while numeric source years remain valid', () => {
  assert.equal(isSourceRecord({ ai_register_id: '   ', government_organization: 'Canada', name_ai_system_en: 'System' }), false)
  assert.equal(isSourceRecord({ ai_register_id: 'AI-003', government_organization: 'Canada', name_ai_system_en: 'System', status_date: 2026 }), true)
})
test('doubled spaces in source names neither reorder the list nor block search', () => {
  const rows = [
    { ai_register_id: 'AI-010', government_organization: 'Canada', name_ai_system_en: 'AI  for scientific discovery' },
    { ai_register_id: 'AI-011', government_organization: 'Canada', name_ai_system_en: 'AI Agents for Internal Use' },
  ]
  assert.deepEqual(filter(rows, {}, 'en').map((record) => record.ai_register_id), ['AI-011', 'AI-010'])
  assert.deepEqual(filter(rows, { query: 'ai for scientific' }, 'en').map((record) => record.ai_register_id), ['AI-010'])
  assert.equal(rows[0].name_ai_system_en, 'AI  for scientific discovery')
})
test('public audience covers members of the public and mixed users only', () => {
  const rows = ['Members of public', 'Both employees and public', 'GC employees', 'Neither employees nor public', ''].map((users, index) => ({
    ai_register_id: `AI-02${index}`, government_organization: 'Canada', name_ai_system_en: `System ${index}`, ai_system_primary_users_en: users,
  }))
  assert.deepEqual(rows.map(audience), ['public', 'public', 'employees', 'neither', '__unknown__'])
  assert.deepEqual(filter(rows, { audience: 'public' }, 'en').map((record) => record.ai_register_id), ['AI-020', 'AI-021'])
  assert.equal(summary(rows).public, 2)
  assert.equal(stateFromParams('audience=nonsense').audience, '')
  assert.equal(paramsFromState({ audience: 'public' }).get('audience'), 'public')
})
test('row summaries prefer the sentence that explains a search match and stay short', () => {
  const record = { ai_register_id: 'AI-030', government_organization: 'Canada', name_ai_system_en: 'Gate', description_ai_system_en: 'Opens  gates. It uses facial matching at kiosks. ' + 'Long words '.repeat(30) }
  assert.equal(excerpt(record, 'en').text, 'Opens gates.')
  assert.equal(excerpt(record, 'en', 'FACIAL').text, 'It uses facial matching at kiosks.')
  assert.ok(excerpt(record, 'en', 'long').text.endsWith('…'))
  assert.ok(excerpt(record, 'en', 'long').text.length <= 181)
  assert.equal(excerpt({ ...record, description_ai_system_en: '' }, 'en').missing, true)
})
test('highlighting ignores case, accents and doubled spaces without changing the text', () => {
  const parts = highlight('Système  de Reconnaissance faciale', 'systeme de')
  assert.equal(parts.map((part) => part.text).join(''), 'Système  de Reconnaissance faciale')
  assert.deepEqual(parts.filter((part) => part.match).map((part) => part.text), ['Système  de'])
  assert.deepEqual(highlight('Facial, facial', 'facial').filter((part) => part.match).length, 2)
  assert.deepEqual(highlight('text', ''), [{ text: 'text', match: false }])
})
test('organisation profile counts every record from that organisation and its top vendors', () => {
  const rows = [
    { ai_register_id: 'A1', government_organization: 'Org', name_ai_system_en: 'A', ai_system_status_en: 'In production', vendor_information: 'Acme, Beta', ai_system_primary_users_en: 'Members of public' },
    { ai_register_id: 'A2', government_organization: 'Org', name_ai_system_en: 'B', involves_personal_information: 'Y', vendor_information: 'Acme' },
    { ai_register_id: 'B1', government_organization: 'Other', name_ai_system_en: 'C', vendor_information: 'Acme' },
  ]
  const profile = organisationProfile(rows, 'Org')
  assert.equal(profile.total, 2)
  assert.equal(profile.production, 1)
  assert.equal(profile.personalInfo, 1)
  assert.equal(profile.public, 1)
  assert.deepEqual(profile.vendors, [{ name: 'Acme', count: 2 }, { name: 'Beta', count: 1 }])
})
test('long summaries keep a late search match visible and use the room available', () => {
  const sentence = 'Lorem '.repeat(40) + 'uses facial recognition at the border.'
  const record = { ai_register_id: 'AI-040', government_organization: 'Canada', name_ai_system_en: 'X', description_ai_system_en: sentence }
  const text = excerpt(record, 'en', 'facial').text
  assert.ok(text.startsWith('…'))
  assert.ok(text.endsWith('border.'))
  assert.ok(text.includes('facial'))
  assert.ok(text.length > 150)
  assert.equal(excerpt({ ...record, description_ai_system_en: 'See e.g. the OCR tool. Second.' }, 'en').text, 'See e.g. the OCR tool.')
})
