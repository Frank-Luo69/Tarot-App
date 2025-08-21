import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  use: {
  baseURL: 'http://localhost:3100',
    trace: 'on-first-retry',
    headless: true,
  },
  webServer: {
  command: 'PORT=3100 npm start',
  url: 'http://localhost:3100/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
