import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PW_BASE_URL ?? 'http://127.0.0.1:3186'
const shouldStartServer = !process.env.PW_BASE_URL

export default defineConfig({
  testDir: './tests/ui',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL,
    acceptDownloads: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: shouldStartServer ? {
    command: process.env.PW_PRODUCTION === '1'
      ? 'npm run build && npm run start -- --hostname 127.0.0.1 --port 3186'
      : 'npm run dev -- --hostname 127.0.0.1 --port 3186',
    url: baseURL,
    reuseExistingServer: false,
    timeout: process.env.PW_PRODUCTION === '1' ? 180_000 : 90_000,
  } : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
})
