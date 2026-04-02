import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // 同一テストユーザーでログインするケースが多く、並列ワーカーだとセッション競合で大量に壊れる
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
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
    command: 'NEXT_PUBLIC_FIREBASE_API_KEY="mock_key" NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="mock_domain" NEXT_PUBLIC_FIREBASE_PROJECT_ID="mock_project" NEXTAUTH_SECRET="test_secret_123" NEXTAUTH_URL="http://localhost:3020" MOCK_DB="false" DISABLE_PHONE_VERIFICATION="true" GOOGLE_PRIVATE_KEY="" GOOGLE_SERVICE_ACCOUNT_EMAIL="" npm run dev',
    url: 'http://localhost:3020',
    // ローカルで手元の `npm run dev` を再利用すると、別プロセス終了で 3020 が落ちて E2E が連鎖失敗しやすい。
    // 明示的に `PW_REUSE_DEV_SERVER=1` を付けたときだけ再利用する。
    reuseExistingServer: process.env.CI ? false : process.env.PW_REUSE_DEV_SERVER === '1',
    timeout: 120 * 1000,
  },
});
