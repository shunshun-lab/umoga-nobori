import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Event Registration Flow', () => {
    test('should allow user to join an event', async ({ page }) => {
        // Login as test user 2 (non-admin)
        await loginAsTestUser(page, 'test2');

        // Go to event-4 (which is not joined by test2 initially)
        await page.goto('/events/event-4');

        // Wait for loading to finish
        await expect(page.locator('text=読み込み中...')).toBeHidden({ timeout: 15000 });

        // Check if already joined
        const joinedText = page.locator('text=このイベントに参加済みです');
        if (await joinedText.isVisible()) {
            return; // Already joined, test passes
        }

        // Check if login required
        const loginLink = page.locator('text=ログインして参加する');
        if (await loginLink.isVisible()) {
            throw new Error('User is not logged in');
        }

        // 参加ボタンは StickyRegistrationFooter の「参加する」（i18n: events.register）
        const joinButton = page.getByRole('button', { name: '参加する' });
        if (!await joinButton.isVisible()) {
            console.log('Join button not visible. Page content:', await page.content());
        }
        await expect(joinButton).toBeVisible({ timeout: 10000 });

        // 確認ダイアログを accept してからクリック
        page.once('dialog', (d) => d.accept());
        await joinButton.click();

        // 処理完了を待つ
        await expect(page.locator('text=このイベントに参加済みです')).toBeVisible({ timeout: 15000 });

        // Reload to confirm persistence
        await page.reload();
        await expect(page.locator('text=このイベントに参加済みです')).toBeVisible();
    });
});
