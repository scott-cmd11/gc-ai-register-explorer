import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { fixtureSystems, floodRecordId, longFixtureSystems, stubSystemsApi, systemsPayload } from './fixtures'

test.beforeEach(async ({ page }) => { await stubSystemsApi(page) })

test('the register supports search, filters, sorting, grouping, export, and a dossier', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#main-content')).toBeVisible()
  await expect(page.locator('#register-search')).toBeVisible()
  await expect(page.locator('#records-tab')).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('#records-panel')).toBeVisible()

  await page.locator('#register-search').fill('flood')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await page.locator('#register-search').fill('')

  await page.locator('#filter-department').selectOption('Natural Resources Canada / Ressources naturelles Canada')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await page.locator('#filter-department').selectOption('')
  await page.locator('#filter-status').selectOption('production')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await page.locator('#filter-status').selectOption('')
  await page.locator('#filter-personalInfo').selectOption('Y')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await page.locator('#filter-personalInfo').selectOption('')

  await page.locator('#more-filters').click()
  await expect(page.locator('#filter-developedBy')).toBeVisible()
  await page.locator('#filter-developedBy').selectOption('Vendor')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await page.locator('#filter-developedBy').selectOption('')
  await page.locator('#filter-vendor').selectOption('Microsoft')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await page.locator('#filter-vendor').selectOption('')
  await page.locator('#filter-notificationAi').selectOption('Y')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await page.locator('#filter-notificationAi').selectOption('')
  await page.locator('#filter-year').selectOption('2024')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await page.locator('#filter-year').selectOption('')

  await page.locator('#sort-field').selectOption('year')
  await page.locator('#sort-direction').selectOption('desc')
  await page.locator('#group-by').selectOption('department')
  await expect(page.locator('.record-group')).toHaveCount(3)

  const downloadPromise = page.waitForEvent('download')
  await page.locator('.export-button').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/ai-register.*\.csv$/i)
  const csv = await readFile(await download.path() as string, 'utf8')
  expect(csv).toContain(floodRecordId)
  expect(csv).toContain('"\'=HYPERLINK(""https://example.com"",""source"")"')

  const opener = page.locator('.record-open').filter({ hasText: 'Flood Susceptibility Index' })
  await opener.click()
  await expect(page.locator('#record-dialog')).toBeVisible()
  await expect(page.locator('#dossier-title')).toContainText('Flood Susceptibility Index')
  await page.keyboard.press('Escape')
  await expect(page.locator('#record-dialog')).toBeHidden()
  await expect(opener).toBeFocused()
})

test('deep links resolve official register ids and report unavailable ids', async ({ page }) => {
  await page.goto('/?record=' + encodeURIComponent(floodRecordId))
  await expect(page.locator('#record-dialog')).toBeVisible()
  await expect(page.locator('#dossier-title')).toContainText('Flood Susceptibility Index')
  await page.goto('/?record=missing-register-id')
  await expect(page.getByText(/unavailable in the current snapshot/i)).toBeVisible()
})

test('patterns exposes seven chart views and chart filters return to records', async ({ page }) => {
  await page.goto('/')
  await page.locator('#patterns-tab').click()
  await expect(page.locator('#insights')).toBeVisible()
  for (const key of ['status', 'departments', 'years', 'pii', 'developers', 'vendors', 'statusYears']) {
    await page.locator('#chart-tab-' + key).click()
    await expect(page.locator('#chart-stage')).toBeVisible()
  }
  await page.locator('#chart-tab-statusYears').click()
  await page.locator('.stack-piece').first().click()
  await expect(page.locator('#records-tab')).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('#filter-status')).not.toHaveValue('')
  await expect(page.locator('#filter-year')).not.toHaveValue('')
})

test('patterns use the active search subset for its summary and chart table', async ({ page }) => {
  await page.goto('/')
  await page.locator('#register-search').fill('flood')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await page.locator('#patterns-tab').click()
  await expect(page.locator('#insights')).toBeVisible()
  await expect(page.locator('.pattern-summary strong').first()).toHaveText('1')
  await expect(page.locator('#chart-stage .chart-denominator')).toContainText('1')
  await page.locator('#chart-stage .chart-table-wrap summary').click()
  const total = await page.locator('#chart-stage .chart-data-table tbody tr').evaluateAll((rows) =>
    rows.reduce((sum, row) => sum + Number(((row as HTMLTableRowElement).cells[1]?.textContent ?? '0').replace(/[^\d.-]/g, '')), 0)
  )
  expect(total).toBe(1)
})

test('missing flags remain distinct and French search matches bilingual source fields', async ({ page }) => {
  await page.goto('/')
  await page.locator('#filter-personalInfo').selectOption('__unknown__')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await expect(page.locator('.record-open')).toContainText('Inspection Planning Model')
  await page.locator('#filter-personalInfo').selectOption('')
  await page.locator('#lang-toggle').click()
  await page.locator('#register-search').fill('coherence')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await expect(page.locator('.record-open')).toContainText('Examen de la qualité de la traduction')
})

test('browser Back closes a record and restores the filtered result state', async ({ page }) => {
  await page.goto('/')
  await page.locator('#filter-status').selectOption('production')
  const opener = page.locator('.record-open')
  await expect(opener).toHaveCount(1)
  await opener.click()
  await expect(page.locator('#record-dialog')).toBeVisible()
  await expect(page).toHaveURL(/record=2526-NRCan-RNCan-006/)
  await page.goBack()
  await expect(page.locator('#record-dialog')).toBeHidden()
  await expect(page.locator('#filter-status')).toHaveValue('production')
  await expect(page.locator('.record-open')).toHaveCount(1)
})

test('an expanded result list survives Escape and Back from a record beyond the first page', async ({ page }) => {
  await stubSystemsApi(page, systemsPayload({ records: longFixtureSystems, total: longFixtureSystems.length }))
  await page.goto('/')
  await expect(page.locator('.record-open')).toHaveCount(24)
  await page.getByRole('button', { name: /show more systems/i }).click()
  await expect(page.locator('.record-open')).toHaveCount(30)

  const opener = page.locator('.record-open').nth(28)
  await opener.click()
  await expect(page.locator('#record-dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#record-dialog')).toBeHidden()
  await expect(page.locator('.record-open')).toHaveCount(30)
  await expect(opener).toBeFocused()

  await opener.click()
  await expect(page.locator('#record-dialog')).toBeVisible()
  await page.goBack()
  await expect(page.locator('#record-dialog')).toBeHidden()
  await expect(page.locator('.record-open')).toHaveCount(30)
  await expect(opener).toBeFocused()
})

test('partial data and retryable source errors remain legible', async ({ page }) => {
  await stubSystemsApi(page, systemsPayload({ records: [fixtureSystems[0]], total: 3, warnings: [{ code: 'partial_dataset', message: 'Limited preview', total: 3, returned: 1 }] }))
  await page.goto('/')
  await expect(page.getByText(/displays 1 of 3 source records/i)).toBeVisible()

  let calls = 0
  await page.unroute('**/api/systems')
  await page.route('**/api/systems', async (route) => {
    calls += 1
    if (calls === 1) await route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ error: 'unavailable' }) })
    else await route.fulfill({ contentType: 'application/json', body: JSON.stringify(systemsPayload()) })
  })
  await page.reload()
  await expect(page.getByText(/could not load/i)).toBeVisible()
  await page.getByRole('button', { name: /try again/i }).click()
  await expect(page.locator('#register-search')).toBeVisible()
  expect(calls).toBe(2)
})

test('starting points toggle their filters and the phone hero search reaches the records', async ({ page }) => {
  await page.goto('/?lang=en')
  const pii = page.getByRole('button', { name: 'Handles personal information' })
  await pii.click()
  await expect(pii).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#filter-personalInfo')).toHaveValue('Y')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await pii.click()
  await expect(pii).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.record-open')).toHaveCount(fixtureSystems.length)

  await expect(page.locator('.hero-search')).toBeHidden()
  await page.setViewportSize({ width: 375, height: 812 })
  await page.locator('#hero-search').fill('flood')
  await page.locator('#hero-search').press('Enter')
  await expect(page.locator('#register-search')).toHaveValue('flood')
  await expect(page.locator('.record-open')).toHaveCount(1)
  await expect(page).toHaveURL(/query=flood/)
})

test('keyword buttons name their search, rows explain matches, and organisation links open a summary', async ({ page }) => {
  await page.goto('/?lang=en')
  await page.getByRole('button', { name: 'Search for “immigration”' }).waitFor()
  await page.locator('#register-search').fill('flood')
  await expect(page.locator('.record-open mark').first()).toHaveText(/flood/i)
  await page.locator('#register-search').fill('')

  const orgLink = page.locator('.org-link').first()
  const orgName = (await orgLink.textContent())?.trim() ?? ''
  await orgLink.click()
  await expect(page.locator('.org-profile h3')).toHaveText(orgName)
  await expect(page.locator('#register-search')).toHaveValue('')
  await page.getByRole('button', { name: 'Show all organisations' }).click()
  await expect(page.locator('.org-profile')).toHaveCount(0)
  await expect(page.locator('.record-open')).toHaveCount(fixtureSystems.length)
})

test('the latest government update is summarised, filterable, and labelled on rows', async ({ page }) => {
  await stubSystemsApi(page, systemsPayload({
    changes: {
      since: '2026-01-10T09:00:00',
      added: [floodRecordId],
      updated: [{ id: '2025-StatCan-004', fields: ['ai_system_status_en'] }],
      removed: [{ id: 'OLD-1', name_en: 'Retired chatbot', name_fr: 'Robot retiré', organisation: 'Org / Org' }],
    },
  }))
  await page.goto('/?lang=en')
  await expect(page.locator('.change-summary')).toContainText('1 new, 1 edited, 1 removed')
  await page.getByRole('button', { name: 'Show changed records' }).click()
  await expect(page.locator('.record-open')).toHaveCount(2)
  await expect(page).toHaveURL(/changed=any/)
  await expect(page.locator(`tr[data-record-id="${floodRecordId}"] .change-tag`)).toHaveText('New')
  await expect(page.locator('tr[data-record-id="2025-StatCan-004"] .change-tag')).toHaveText('Edited')
  await page.locator('.change-summary summary').click()
  await expect(page.locator('.change-summary li')).toContainText('Retired chatbot')
})

test('no change summary appears before a second government update is stored', async ({ page }) => {
  await page.goto('/?lang=en')
  await expect(page.locator('#register-search')).toBeVisible()
  await expect(page.locator('.change-summary')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Changed in the latest update' })).toHaveCount(0)
})
