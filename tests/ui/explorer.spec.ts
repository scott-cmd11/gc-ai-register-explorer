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
