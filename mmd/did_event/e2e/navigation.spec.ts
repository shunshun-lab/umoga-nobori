import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';
import { openGuestLandingAbout } from './helpers/landing';

test.describe('Navigation', () => {
  test.setTimeout(120000); // loginAsTestUser 使用テスト用

  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'ログイン' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'イベント一覧' }).first()).toBeVisible();
    await openGuestLandingAbout(page);
    await expect(page.getByText(/出会いを/)).toBeVisible();
  });

  test('should navigate between pages using header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // イベント一覧に移動（サイドバーのリンク。デスクトップでサイドバーは表示される）
    const eventsLink = page.getByRole('link', { name: 'イベント一覧' });
    await eventsLink.first().click();
    await expect(page).toHaveURL('/events');

    // ヘッダー中央のロゴをクリック（トップまたはタイムラインへ）
    const header = page.locator('header');
    const logoLink = header.locator('a[href="/"], a[href="/timeline"]').first();
    await logoLink.click();
    await expect(page).toHaveURL(/3020\/(timeline)?(\?.*)?$/);
  });

  test('should show authenticated navigation items after login', async ({ page }) => {
    await loginAsTestUser(page);

    // 認証後はナビ（サイドバー or モバイルハンバーガー）と作成メニューが利用可能
    const navVisible =
      page.getByRole('link', { name: 'イベント一覧' }).or(page.getByRole('button', { name: 'メニューを開く' }));
    await expect(navVisible.first()).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('button', { name: '作成メニュー' }).or(page.locator('a[href="/events/create"]')).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to dashboard', async ({ page }) => {
    await loginAsTestUser(page);

    // マイページに移動（/mypage がメインのユーザー画面）
    await page.goto('/mypage');
    await expect(page).toHaveURL(/\/mypage/);
  });

  test('should show mobile navigation', async ({ page }) => {
    // モバイル画面サイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // ヘッダーのハンバーガーボタン（メニューを開く）が表示されることを確認
    await expect(page.getByRole('button', { name: 'メニューを開く' })).toBeVisible();
  });
});
