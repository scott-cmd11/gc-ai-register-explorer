import type { Page } from '@playwright/test'

export const floodRecordId = '2526-NRCan-RNCan-006'

export const fixtureSystems = [
  {
    _id: 101, ai_register_id: floodRecordId,
    name_ai_system_en: 'Flood Susceptibility Index', name_ai_system_fr: 'Indice de susceptibilité aux inondations',
    government_organization: 'Natural Resources Canada / Ressources naturelles Canada',
    description_ai_system_en: 'Supports flood-risk screening with mapped environmental information.', description_ai_system_fr: 'Appuie le dépistage des risques d’inondation au moyen de données environnementales cartographiées.',
    ai_system_primary_users_en: 'Program analysts', ai_system_primary_users_fr: 'Analystes de programme',
    developed_by_en: 'Government of Canada', developed_by_fr: 'Gouvernement du Canada',
    vendor_information: 'Esri', ai_system_status_en: 'In production', ai_system_status_fr: 'En production', status_date: '2025-03-01',
    ai_system_capabilities_en: 'Geospatial classification', ai_system_capabilities_fr: 'Classification géospatiale',
    data_sources_en: '=HYPERLINK("https://example.com","source")', data_sources_fr: 'Données environnementales publiques',
    involves_personal_information: 'N', personal_information_banks_en: '', personal_information_banks_fr: '', notification_ai: 'Y',
    ai_system_results_en: 'Supports consistent flood-risk screening.', ai_system_results_fr: 'Appuie un dépistage cohérent des risques d’inondation.',
  },
  {
    _id: 102, ai_register_id: '2025-StatCan-004',
    name_ai_system_en: 'Translation Quality Review', name_ai_system_fr: 'Examen de la qualité de la traduction',
    government_organization: 'Statistics Canada / Statistique Canada',
    description_ai_system_en: 'Helps analysts review translation workflow quality.', description_ai_system_fr: 'Aide les analystes à examiner la qualité des processus de traduction.',
    ai_system_primary_users_en: 'Analysts', ai_system_primary_users_fr: 'Analystes',
    developed_by_en: 'Vendor', developed_by_fr: 'Fournisseur', vendor_information: 'Microsoft',
    ai_system_status_en: 'In development', ai_system_status_fr: 'En développement', status_date: '2024-09-20',
    ai_system_capabilities_en: 'Language assistance', ai_system_capabilities_fr: 'Aide linguistique',
    data_sources_en: 'Internal programme material', data_sources_fr: 'Documents internes du programme',
    involves_personal_information: 'Y', personal_information_banks_en: 'Programme records', personal_information_banks_fr: 'Dossiers de programme', notification_ai: 'N',
    ai_system_results_en: 'Reported workflow consistency.', ai_system_results_fr: 'Cohérence des processus déclarée.',
  },
  {
    _id: 103, ai_register_id: '2024-TC-011',
    name_ai_system_en: 'Inspection Planning Model', name_ai_system_fr: 'Modèle de planification des inspections',
    government_organization: 'Transport Canada / Transports Canada',
    description_ai_system_en: 'Prioritizes inspection planning.', description_ai_system_fr: 'Priorise la planification des inspections.',
    ai_system_primary_users_en: 'Inspectors', ai_system_primary_users_fr: 'Inspecteurs',
    developed_by_en: 'Other', developed_by_fr: 'Autre', vendor_information: '',
    ai_system_status_en: 'Retired', ai_system_status_fr: 'Retiré', status_date: '2023-01-15',
    ai_system_capabilities_en: 'Risk scoring', ai_system_capabilities_fr: 'Notation du risque',
    data_sources_en: 'Historical inspection data', data_sources_fr: 'Données d’inspection historiques',
    involves_personal_information: '', personal_information_banks_en: '', personal_information_banks_fr: '', notification_ai: '',
    ai_system_results_en: 'Not specified', ai_system_results_fr: 'Non précisé',
  },
]

export const longFixtureSystems = Array.from({ length: 30 }, (_, index) => ({
  ...fixtureSystems[0],
  _id: 1_000 + index,
  ai_register_id: '2526-NRCan-RNCan-' + String(100 + index).padStart(3, '0'),
  name_ai_system_en: 'Flood screening record ' + String(index + 1).padStart(2, '0'),
  name_ai_system_fr: 'Dossier de dépistage des inondations ' + String(index + 1).padStart(2, '0'),
}))

export function systemsPayload(overrides: Record<string, unknown> = {}) {
  return {
    records: fixtureSystems, total: fixtureSystems.length,
    lastModified: '2026-04-28T20:10:07.759825', snapshotAt: '2026-09-05T12:00:00.000Z', warnings: [],
    ...overrides,
  }
}

export async function stubSystemsApi(page: Page, payload = systemsPayload()) {
  await page.route('**/api/systems', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(payload) })
  })
}
