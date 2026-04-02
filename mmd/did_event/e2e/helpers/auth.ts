import { Page, expect } from '@playwright/test';
import { goToPublicEventsListTab } from './events';

const PHONE_SKIP_KEY = 'skip_phone_verification';

/**
 * テスト用: 電話番号確認ガードをスキップする
 */
export async function setSkipPhoneVerification(page: Page) {
  await page.addInitScript((key: string) => {
    localStorage.setItem(key, 'true');
  }, PHONE_SKIP_KEY);
}

/**
 * 現在のページでスキップフラグを立ててからリロード
 */
export async function applySkipPhoneVerificationAndReload(page: Page) {
  await page.evaluate((key: string) => {
    localStorage.setItem(key, 'true');
  }, PHONE_SKIP_KEY);
  await page.reload();
}

/**
 * ページが安定するまで待つ（リダイレクトチェーンの終了を検出）
 */
async function waitForStableUrl(page: Page, timeout = 5000) {
  let lastUrl = page.url();
  const start = Date.now();
  while (Date.now() - start < timeout) {
    await page.waitForTimeout(500);
    const currentUrl = page.url();
    if (currentUrl === lastUrl) return currentUrl;
    lastUrl = currentUrl;
  }
  return lastUrl;
}

/**
 * NextAuth のセッションがブラウザコンテキストで有効になるまで待つ（useSession の初期 null 対策）
 */
export async function waitForAuthenticatedSession(page: Page, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await page.request.get('/api/auth/session');
    if (res.ok()) {
      const data = await res.json().catch(() => null);
      if (data?.user) return;
    }
    await page.waitForTimeout(250);
  }
  throw new Error('Timed out waiting for authenticated session');
}

/**
 * テストユーザーでログインする
 * サインイン → リダイレクトチェーン安定化 → オンボーディング/verify-phone スキップ → /events
 */
export async function loginAsTestUser(page: Page, username: string = 'test') {
  await setSkipPhoneVerification(page);

  await page.goto('/dev/login');
  await page.waitForLoadState('domcontentloaded');
  // /dev/login の各テストアカウント行にある「ログイン」ボタンをクリック
  // test1=0番目, test2=1番目のログインボタン
  const btnIndex = username === 'test2' ? 1 : 0;
  const btn = page.getByRole('button', { name: 'ログイン' }).nth(btnIndex);
  await expect(btn).toBeVisible({ timeout: 5000 });

  // ログインクリック
  await btn.click();

  // /dev/login の callbackUrl は /dev/login 自身なので、ページ遷移完了を待つ
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  // セッションが確立されるまで少し待つ
  await page.waitForTimeout(2000);
  await waitForAuthenticatedSession(page);

  // ログイン完了後、/events に遷移
  await page.goto('/events');
  await waitForStableUrl(page, 6000);

  // verify-phone ガードの処理
  if (page.url().includes('/verify-phone')) {
    await applySkipPhoneVerificationAndReload(page);
    await waitForStableUrl(page, 3000);
    if (page.url().includes('/verify-phone')) {
      await page.goto('/events');
      await waitForStableUrl(page, 3000);
    }
  }

  // オンボーディングスキップ
  if (page.url().includes('/onboarding')) {
    // API でオンボーディング完了をマーク
    await page.evaluate(async () => {
      try {
        await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intent_primary: 'attend_event',
            closest_path: 'event_participant',
          }),
        });
      } catch {}
    });
    await page.goto('/events');
    await waitForStableUrl(page, 3000);
  }

  // まだ /events でなければ強制遷移
  if (!page.url().includes('/events')) {
    await page.goto('/events');
  }
  await page.waitForURL(/\/events/, { timeout: 15000 });
  await goToPublicEventsListTab(page);
}

/**
 * ログアウトする
 */
export async function logout(page: Page) {
  await setSkipPhoneVerification(page);

  await page.goto('/mypage?tab=profile');
  await waitForStableUrl(page, 5000);

  // オンボーディングに飛ばされた場合はスキップして再遷移
  if (page.url().includes('/onboarding')) {
    await page.evaluate(async () => {
      try {
        await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intent_primary: 'attend_event',
            closest_path: 'event_participant',
          }),
        });
      } catch {}
    });
    await page.goto('/mypage?tab=profile');
    await waitForStableUrl(page, 3000);
  }

  if (page.url().includes('/verify-phone')) {
    await applySkipPhoneVerificationAndReload(page);
    await page.goto('/mypage?tab=profile');
    await page.waitForURL(/\/mypage/, { timeout: 10000 });
  }

  const logoutBtn = page.getByRole('button', { name: /ログアウト/ });
  if (!(await logoutBtn.isVisible().catch(() => false))) {
    const profileBtn = page.getByRole('button', { name: /プロフィール設定/ });
    if (await profileBtn.isVisible().catch(() => false)) {
      await profileBtn.click();
    }
  }

  await expect(logoutBtn).toBeVisible({ timeout: 15000 });
  page.once('dialog', (d) => d.accept());
  await logoutBtn.click();
  await page.waitForURL(/\/(auth\/signin)?\/?(\?|$)/, { timeout: 10000 });
}
