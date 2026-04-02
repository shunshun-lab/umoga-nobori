import { test, expect } from '@playwright/test';
import { openGuestLandingAbout } from './helpers/landing';

test.describe('Home Page (Landing)', () => {
    test('should display landing hero and 3 entrances', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByRole('link', { name: 'イベント一覧' }).first()).toBeVisible();
        await openGuestLandingAbout(page);

        // Hero (折りたたみ内)
        await expect(page.getByText(/出会いを/)).toBeVisible();
        await expect(page.getByText(/その場でつながりに/)).toBeVisible();
        await expect(page.getByText(/電子名刺・イベント・クエストの3つの入口から/)).toBeVisible();

        // 3 entrance buttons
        await expect(page.getByText('対面で電子名刺から')).toBeVisible();
        await expect(page.getByText('イベント登録から')).toBeVisible();
        await expect(page.getByText('クエスト登録から')).toBeVisible();
    });

    test('should display 3 entrance stories section', async ({ page }) => {
        await page.goto('/');
        await openGuestLandingAbout(page);
        await expect(page.locator('h3', { hasText: '3つの入口' })).toBeVisible();
        await expect(page.getByText('対面で電子名刺から')).toBeVisible();
        await expect(page.getByText('イベント登録から')).toBeVisible();
        await expect(page.getByText('クエスト登録から')).toBeVisible();
    });

    test('should display persona section', async ({ page }) => {
        await page.goto('/');
        await openGuestLandingAbout(page);
        await expect(page.locator('h3', { hasText: 'こんな方に' })).toBeVisible();
        await expect(page.getByText('営業している人')).toBeVisible();
        await expect(page.getByText('コミュニティリーダー')).toBeVisible();
    });

    test('should navigate to events from hero', async ({ page }) => {
        await page.goto('/');
        const link = page.getByRole('link', { name: 'イベント一覧' }).first();
        await link.scrollIntoViewIfNeeded();
        await Promise.all([
            page.waitForURL(/\/events/, { timeout: 15000 }),
            link.click(),
        ]);
        await expect(page).toHaveURL(/\/events/);
    });

    test('should navigate to communities from CTA', async ({ page }) => {
        await page.goto('/');
        const link = page.getByRole('link', { name: 'コミュニティ一覧' }).first();
        await expect(link).toHaveAttribute('href', '/communities');
        await link.scrollIntoViewIfNeeded();
        await Promise.all([
            page.waitForURL(/\/communities/, { timeout: 15000 }),
            link.click(),
        ]);
        await expect(page).toHaveURL(/\/communities/);
    });

    test('should navigate to contact for collab', async ({ page }) => {
        await page.goto('/');
        await openGuestLandingAbout(page);
        const link = page.getByRole('link', { name: 'お問い合わせ' }).first();
        await link.scrollIntoViewIfNeeded();
        await Promise.all([
            page.waitForURL(/\/contact/, { timeout: 15000 }),
            link.click(),
        ]);
        await expect(page).toHaveURL(/\/contact/);
    });
});
