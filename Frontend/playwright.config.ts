import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.FRONTEND_E2E_URL ?? 'http://localhost:3001';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  reporter: [['list']],
  use: { baseURL, trace: 'retain-on-failure', ...devices['Desktop Chrome'] },
  webServer: process.env.START_FRONTEND_E2E === 'true' ? { command: 'npm run dev', url: baseURL, reuseExistingServer: true, timeout: 120_000 } : undefined
});
