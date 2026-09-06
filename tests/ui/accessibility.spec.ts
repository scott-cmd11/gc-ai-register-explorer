import { expect, test } from '@playwright/test'
import axe from 'axe-core'
import { stubSystemsApi } from './fixtures'

test.beforeEach(async ({ page }) => { await stubSystemsApi(page) })

async function violations(page: import('@playwright/test').Page) {
  await page.addScriptTag({ content: axe.source })
  return page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] })).violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map((node) => node.target.join(' ')) })))
}

test('main focus scene has no automated accessibility violations in either theme', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#register-search')).toBeVisible()
  expect(await violations(page)).toEqual([])
  await page.locator('#theme-toggle').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  expect(await violations(page)).toEqual([])
})

test('language, no-JavaScript privacy route, footer, and narrow layout remain usable', async ({ page, browser }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.locator('#lang-toggle').click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page.locator('#register-search')).toBeVisible()
  await expect(page.locator('.site-footer').getByRole('link', { name: /confidentialité/i })).toHaveAttribute('href', '/privacy')
  await expect(page.locator('.site-footer').getByRole('link', { name: /visite guidée/i })).toHaveAttribute('href', '/walkthrough')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2)).toBe(true)

  const baseURL = process.env.PW_BASE_URL ?? 'http://127.0.0.1:3186'
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  await context.addCookies([{ name: 'ai-register-lang', value: 'fr', url: baseURL }])
  const noJs = await context.newPage()
  await noJs.goto('/privacy')
  await expect(noJs.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(noJs.getByRole('heading', { name: /politique de confidentialité/i })).toBeVisible()
  await context.close()
})

test('public information routes have no automated accessibility violations or narrow overflow in English and French', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const route of ['/about', '/privacy', '/terms']) {
    for (const language of ['en', 'fr']) {
      await page.goto(route + '?lang=' + language)
      await expect(page.locator('html')).toHaveAttribute('lang', language)
      await expect(page.locator('h1')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2)).toBe(true)
      expect(await violations(page)).toEqual([])
    }
  }
})

test('walkthrough decodes its two-minute media, loads captions, and advances chapters', async ({ page }) => {
  await page.goto('/walkthrough')
  const video = page.locator('video')
  await expect(video.locator('source[src="/walkthrough/narrated-cut.mp4"]')).toHaveCount(1)
  await expect(video.locator('track[kind="captions"][src$=".vtt"]')).toHaveCount(1)
  const media = await page.waitForFunction(() => {
    const element = document.querySelector('video')
    const cues = element?.textTracks[0]?.cues?.length ?? 0
    return element && Number.isFinite(element.duration) && element.duration > 119.5 && element.duration < 120.5 && cues === 30
      ? { duration: element.duration, cues }
      : false
  })
  expect(await media.jsonValue()).toEqual({ duration: 120, cues: 30 })
  const chapters = page.getByRole('navigation', { name: /walkthrough chapters/i }).getByRole('button')
  await expect(chapters).toHaveCount(8)
  await video.evaluate((element) => { (element as HTMLVideoElement).muted = true })
  await chapters.nth(3).click()
  await expect(chapters.nth(3)).toHaveAttribute('aria-current', 'step')
  await page.waitForFunction(() => (document.querySelector('video')?.currentTime ?? 0) > 37)
})

declare global { interface Window { axe: typeof axe } }
