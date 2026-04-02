import { test, expect } from '@playwright/test';
import { loginAsTestUser, logout } from './helpers/auth';

test.describe('Authentication Flow', () => {
  test.setTimeout(120000); // loginAsTestUser の redirect 待ち (55s) に合わせて延長

  test('should display login page', async ({ page }) => {
    await page.goto('/auth/signin');
    // ブランド文言はモードによって変わるため、ログイン導線の存在を主に確認する
    await expect(page.locator('h2')).toContainText(/MMD DID Event|for community|JXC/);
    await expect(page.getByRole('button', { name: /LINEで(続ける|登録|ログイン)/ })).toBeVisible();
  });

  test('should login with test account', async ({ page }) => {
    await loginAsTestUser(page);

    // イベント一覧ページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/events/);

    // ログイン後はマイページのプロフィールタブにログアウトボタンがある
    await page.goto('/mypage?tab=profile');
    await page.waitForURL(/\/mypage/, { timeout: 10000 });
    await expect(page.getByRole('button', { name: /ログアウト/ })).toBeVisible({ timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    await loginAsTestUser(page);
    await logout(page);

    // サインインまたはトップにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/(auth\/signin)?\/?(\?.*)?$/);

    // 未認証時のヘッダーにログインリンクが表示される
    await expect(page.getByRole('link', { name: 'ログイン' })).toBeVisible({ timeout: 8000 });
  });

  test('should redirect to signin when accessing protected page', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/mypage');

    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 15000 });
  });
});
