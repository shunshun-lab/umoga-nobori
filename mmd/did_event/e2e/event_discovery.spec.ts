import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Events Flow', () => {
  test.setTimeout(120000); // loginAsTestUser 用

  async function goToPublicEventsBrowse(page: import('@playwright/test').Page) {
    await page.goto('/events');
    await page.getByRole('button', { name: 'イベント一覧' }).click();
  }

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
    await goToPublicEventsBrowse(page);

    await expect(page.getByRole('button', { name: 'すべて' })).toBeVisible();
    await expect(page.getByRole('button', { name: '開催予定' })).toBeVisible();
    await expect(page.getByRole('button', { name: '過去のイベント' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'イベントが見つかりません' })).toBeVisible();
  });

  test('should filter events', async ({ page }) => {
    await goToPublicEventsBrowse(page);

    // 「開催予定」フィルターをクリック
    await page.getByRole('button', { name: '開催予定' }).click();

    // アクティブなフィルタは白背景 + shadow（セグメントUI）
    const upcomingButton = page.getByRole('button', { name: '開催予定' });
    await expect(upcomingButton).toHaveClass(/bg-white/);
    await expect(upcomingButton).toHaveClass(/shadow-sm/);
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
    await goToPublicEventsBrowse(page);

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
    const createBtn = page.getByRole('button', { name: /イベントを作成する/ });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click({ force: true });
    await expect(page).toHaveURL(/\/events\/.+/);
    await expect(page.locator('h1')).toContainText('E2Eテストイベント');
  });

  test('should validate required fields when creating event', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/events/create');
    await page.getByText('全て展開').click();

    // タイトルと開始日時を入力せずに送信
    const createBtn = page.getByRole('button', { name: /イベントを作成する/ });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click({ force: true });

    // バリデーションで送信が止まり、作成ページのままであることを確認
    await expect(page).toHaveURL('/events/create');
    await expect(page.locator('input[name="title"]')).toBeVisible();
  });
});
