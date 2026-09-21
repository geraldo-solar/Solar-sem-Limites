import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'capture-ui.spec.ts',
  outputDir: './tmp/capture-ui-results',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4187', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4187 --strictPort --base=/solarsemlimitescadastro/',
    url: 'http://127.0.0.1:4187/solarsemlimitescadastro/',
    reuseExistingServer: false,
  },
});
