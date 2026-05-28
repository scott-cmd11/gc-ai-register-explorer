import { expect, test } from '@playwright/test'
import axe from 'axe-core'
import { stubSystemsApi } from './fixtures'

test.beforeEach(async ({ page }) => {
  await stubSystemsApi(page)
})

async function getAxeViolations(page: import('@playwright/test').Page) {
  await page.addScriptTag({ content: axe.source })
  return page.evaluate(async () => {
    const result = await window.axe.run(document, {
      resultTypes: ['violations'],
      rules: {
        'color-contrast': { enabled: true },
      },
    })
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.map((node) => node.target.join(' ')),
    }))
  })
}

test('homepage has no critical automated accessibility violations', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Explore the register' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Systems by Status' })).toBeVisible()

  expect(await getAxeViolations(page)).toEqual([])
})

test('dark mode has no critical automated accessibility violations', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Systems by Status' })).toBeVisible()

  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  expect(await getAxeViolations(page)).toEqual([])
})

declare global {
  interface Window {
    axe: typeof axe
  }
}
