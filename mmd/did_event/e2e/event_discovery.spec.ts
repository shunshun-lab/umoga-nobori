import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Events Flow', () => {
  test.setTimeout(120000); // loginAsTestUser 用

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/events*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      } else {
        await route.continue();
      }
    });
  });

  test('should display events list', async ({ page }) => {
    await page.goto('/events');

    await expect(page.locator('h1')).toContainText('イベント一覧');
    await expect(page.locator('button:has-text("すべて")')).toBeVisible();
    await expect(page.locator('button:has-text("開催予定")')).toBeVisible();
    await expect(page.locator('button:has-text("過去のイベント")')).toBeVisible();
  });

  test('should filter events', async ({ page }) => {
    await page.goto('/events');

    // 「開催予定」フィルターをクリック
    await page.getByRole('button', { name: '開催予定' }).click();

    // フィルターがアクティブになることを確認（indigo）
    const upcomingButton = page.getByRole('button', { name: '開催予定' });
    await expect(upcomingButton).toHaveClass(/bg-indigo-600/);
  });

  test('should navigate to event detail', async ({ page }) => {
    const mockEvent = {
      id: 'event-e2e-1',
      title: 'E2E遷移テスト',
      startAt: new Date().toISOString(),
      endAt: null,
      description: null,
      imageUrl: null,
      location: null,
      format: null,
      onlineUrl: null,
      capacity: null,
      category: null,
      tags: null,
      owner: { id: 'u1', name: 'Owner', image: null },
      _count: { participants: 0 },
    };
    await page.route('**/api/events*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockEvent]) });
      } else {
        await route.continue();
      }
    });
    await page.goto('/events');

    await page.waitForSelector('a[href*="/events/event-e2e-1"]', { timeout: 10000 });
    await page.locator('a[href*="/events/event-e2e-1"]').first().click();

    await expect(page).toHaveURL(/\/events\/event-e2e-1/);
  });

  // 作成フォームは複数ステップ（基本情報・コンテンツ・詳細設定・確認）のため、別途 E2E でカバーする
  test.skip('should create new event', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/events/create');
    await expect(page).toHaveURL('/events/create');
    await page.fill('input[name="title"]', 'E2Eテストイベント');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await page.fill('input[name="startAt"]', futureDate.toISOString().slice(0, 16));
    const createBtn = page.getByRole('button', { name: /イベントを作成/ });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click({ force: true });
    await expect(page).toHaveURL(/\/events\/.+/);
    await expect(page.locator('h1')).toContainText('E2Eテストイベント');
  });

  test('should validate required fields when creating event', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/events/create');

    // タイトルと開始日時を入力せずに送信
    const createBtn = page.getByRole('button', { name: /イベントを作成/ });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click({ force: true });

    // バリデーションで送信が止まり、作成ページのままであることを確認
    await expect(page).toHaveURL('/events/create');
    await expect(page.locator('input[name="title"]')).toBeVisible();
  });
});
