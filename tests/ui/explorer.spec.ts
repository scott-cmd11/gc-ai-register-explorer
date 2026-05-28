import { expect, test } from '@playwright/test'
import { stubSystemsApi } from './fixtures'

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
    await page.goto(route)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('body')).not.toContainText('90s Mode')
  }
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
})
