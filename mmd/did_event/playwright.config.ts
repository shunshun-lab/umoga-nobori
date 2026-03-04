import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3020',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 20000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'NEXT_PUBLIC_FIREBASE_API_KEY="mock_key" NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="mock_domain" NEXT_PUBLIC_FIREBASE_PROJECT_ID="mock_project" NEXTAUTH_SECRET="test_secret_123" NEXTAUTH_URL="http://localhost:3020" MOCK_DB="false" GOOGLE_PRIVATE_KEY="" GOOGLE_SERVICE_ACCOUNT_EMAIL="" npm run dev',
    url: 'http://localhost:3020',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
