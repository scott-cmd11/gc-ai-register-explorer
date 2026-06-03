import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { fixtureSystems, stubSystemsApi } from './fixtures'

test('homepage supports the primary exploration journey', async ({ page }) => {
  await stubSystemsApi(page)
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Explore AI systems used across the Government of Canada' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Explore the register' })).toBeVisible()
  await expect(page.getByLabel('Search AI systems')).toBeVisible()
  await expect(page.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')

  await expect(page.locator('main').getByText('3 systems')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Systems by Status' })).toBeVisible()
  await page.getByRole('button', { name: 'View chart data' }).first().click()
  await expect(page.getByRole('table', { name: 'Systems by status' })).toBeVisible()

  const searchComesBeforeCharts = await page.evaluate(() => {
    const search = document.querySelector('#systems-search')
    const statusChart = Array.from(document.querySelectorAll('h3')).find((heading) =>
      heading.textContent?.includes('Systems by Status')
    )
    return Boolean(search && statusChart && search.getBoundingClientRect().top < statusChart.getBoundingClientRect().top)
  })
  expect(searchComesBeforeCharts).toBe(true)

  await page.getByLabel('Search AI systems').fill('Microsoft')
  await expect(page.locator('main').getByText('1 / 3 systems')).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download filtered data as CSV' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('gc-ai-register-1-systems.csv')
  const downloadPath = await download.path()
  expect(downloadPath).toBeTruthy()
  const csvText = await readFile(downloadPath!, 'utf-8')
  expect(csvText).toContain('"\'=HYPERLINK(""https://example.com"",""Microsoft"")"')

  await page.getByLabel('Search AI systems').fill('no matching systems')
  await expect(page.getByText('No systems match your filters')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Clear search and filters' })).toBeVisible()
  await page.getByRole('button', { name: 'Clear search and filters' }).click()
  await expect(page.locator('main').getByText('3 systems')).toBeVisible()

  await page.getByRole('button', { name: 'View details for Benefits modernization assistant' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Close system detail panel' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('source data warnings are visible when the API reports partial data', async ({ page }) => {
  await stubSystemsApi(page)
  await page.route('**/api/systems', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        records: [
          {
            _id: 1,
            ai_register_id: 'AI-001',
            name_ai_system_en: 'Benefits modernization assistant',
            name_ai_system_fr: 'Assistant de modernisation des prestations',
            government_organization: 'Employment and Social Development Canada / Emploi et Développement social Canada',
            description_ai_system_en: 'Supports triage of benefits inquiries using rules-based automation.',
            description_ai_system_fr: 'Soutient le triage des demandes de prestations.',
            ai_system_primary_users_en: 'Program officers',
            ai_system_primary_users_fr: 'Agents de programme',
            developed_by_en: 'Government of Canada',
            developed_by_fr: 'Gouvernement du Canada',
            vendor_information: '',
            ai_system_status_en: 'In production',
            ai_system_status_fr: 'En production',
            status_date: '2025-02-01',
            ai_system_capabilities_en: 'Classification and workflow routing',
            ai_system_capabilities_fr: 'Classification et aiguillage',
            data_sources_en: 'Internal program data',
            data_sources_fr: 'Données internes du programme',
            involves_personal_information: 'Y',
            personal_information_banks_en: 'Program records',
            personal_information_banks_fr: 'Dossiers du programme',
            notification_ai: 'Y',
            ai_system_results_en: 'Faster routing for service requests',
            ai_system_results_fr: 'Acheminement plus rapide des demandes',
          },
        ],
        total: 2,
        lastModified: '2026-04-28T20:10:07.759825',
        warnings: [{
          code: 'partial_dataset',
          message: 'The source API reported more records than this page received.',
          total: 2,
          returned: 1,
        }],
      }),
    })
  })

  await page.goto('/')
  await expect(page.getByText('Data quality notice')).toBeVisible()
  await expect(page.getByText('The source API reported 2 records, but this page received 1.')).toBeVisible()
})

test('mobile exploration controls are readable and do not overflow', async ({ page }) => {
  await stubSystemsApi(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Explore the register' })).toBeVisible()
  await expect(page.getByLabel('Search AI systems')).toBeVisible()

  const layout = await page.evaluate(() => ({
    hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    selectWidths: Array.from(document.querySelectorAll('select')).map((select) =>
      Math.round(select.getBoundingClientRect().width)
    ),
  }))

  expect(layout.hasHorizontalOverflow).toBe(false)
  expect(layout.selectWidths).toHaveLength(6)
  expect(Math.min(...layout.selectWidths)).toBeGreaterThanOrEqual(300)
  await expect(page.getByRole('list', { name: 'All 3 AI systems' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'View details for Benefits modernization assistant' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Scroll down for more content' })).toHaveCount(0)
})

test('public information routes render credible page titles', async ({ page }) => {
  for (const route of ['/about', '/privacy', '/terms']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('body')).not.toContainText('90s Mode')
  }
})

test('language cookie server-renders French public pages without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3000',
    javaScriptEnabled: false,
  })
  await context.addCookies([{ name: 'ai-register-lang', value: 'fr', url: 'http://127.0.0.1:3000' }])
  const page = await context.newPage()

  await page.goto('/privacy')

  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page.getByRole('heading', { name: /Politique de confidentialit/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toHaveCount(0)

  await context.close()
})

test('keyboard path opens and closes a system detail dialog', async ({ page }) => {
  await stubSystemsApi(page)
  await page.goto('/')

  await page.keyboard.press('Control+K')
  await expect(page.getByLabel('Search AI systems')).toBeFocused()

  const detailsButton = page.getByRole('button', { name: 'View details for Benefits modernization assistant' })
  await detailsButton.focus()
  await expect(detailsButton).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(detailsButton).toBeFocused()
})

test('API failure state is clear and non-technical', async ({ page }) => {
  await page.route('**/api/systems', async (route) => {
    await route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Upstream unavailable' }),
    })
  })

  await page.goto('/')
  await expect(page.getByText('Failed to load data')).toBeVisible()
  await expect(page.getByText('Unable to load AI registry data. Please try again later.')).toBeVisible()
  await expect(page.getByText('The source registry did not respond successfully.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Official source' })).toHaveAttribute('href', /open\.canada\.ca/)
})

test('API failure state can retry into the explorer', async ({ page }) => {
  let calls = 0
  await page.route('**/api/systems', async (route) => {
    calls += 1
    if (calls === 1) {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Upstream unavailable' }),
      })
      return
    }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        records: fixtureSystems,
        total: fixtureSystems.length,
        lastModified: '2026-04-28T20:10:07.759825',
      }),
    })
  })

  await page.goto('/')
  await expect(page.getByText('Failed to load data')).toBeVisible()

  await page.getByRole('button', { name: 'Retry' }).click()

  await expect(page.getByRole('heading', { name: 'Explore the register' })).toBeVisible()
  await expect(page.locator('main').getByText('3 systems')).toBeVisible()
  expect(calls).toBe(2)
})

test('search ignores accents across bilingual fields', async ({ page }) => {
  await stubSystemsApi(page)
  await page.goto('/')

  await page.getByRole('button', { name: /fran/i }).click()
  await page.getByLabel(/Rechercher/).fill('coherence')

  await expect(page.locator('main').getByText(/1 \/ 3 syst/)).toBeVisible()
  await expect(page.getByRole('button', { name: /Flux de traduction Microsoft/ })).toBeVisible()
})

test('binary filters show readable labels instead of raw dataset codes', async ({ page }) => {
  await stubSystemsApi(page)
  await page.goto('/')

  await expect(page.locator('#filter-personal-data option[value="Y"]')).toHaveText('Has personal data')
  await expect(page.locator('#filter-personal-data option[value="N"]')).toHaveText('No personal data')
  await expect(page.locator('#filter-notification option[value="Y"]')).toHaveText('Users notified')
  await expect(page.locator('#filter-notification option[value="N"]')).toHaveText('No notification')

  await page.getByRole('button', { name: /fran/i }).click()

  await expect(page.locator('#filter-personal-data option[value="Y"]')).toHaveText(/Donn.es personnelles/)
  await expect(page.locator('#filter-personal-data option[value="N"]')).toHaveText(/Aucune donn.e personnelle/)
  await expect(page.locator('#filter-notification option[value="Y"]')).toHaveText(/Utilisateurs avis.s/)
  await expect(page.locator('#filter-notification option[value="N"]')).toHaveText(/Aucune notification/)
})
