import { Page, expect } from '@playwright/test';

const PHONE_SKIP_KEY = 'skip_phone_verification';

/**
 * テスト用: 電話番号確認ガードをスキップする（既存のアプリのローカルストレージ仕様を利用。本番機能は変更しない）
 */
export async function setSkipPhoneVerification(page: Page) {
  await page.addInitScript((key: string) => {
    localStorage.setItem(key, 'true');
  }, PHONE_SKIP_KEY);
}

/**
 * 現在のページでスキップフラグを立ててからリロード（既にページを開いている場合用）
 */
export async function applySkipPhoneVerificationAndReload(page: Page) {
  await page.evaluate((key: string) => {
    localStorage.setItem(key, 'true');
  }, PHONE_SKIP_KEY);
  await page.reload();
}

/**
 * テストユーザーでログインする（UI経由。API/CSRFに依存しない）
 * サインイン → 必要なら verify-phone スキップ → /events で完了
 */
export async function loginAsTestUser(page: Page, username: string = 'test') {
  // 初回ナビ前にスキップフラグを注入（次のページロードから有効）
  await setSkipPhoneVerification(page);

  await page.goto('/auth/signin');
  await page.waitForLoadState('domcontentloaded');
  const buttonText = username === 'test2' ? 'Test User 2' : 'Test User 1';
  const btn = page.getByRole('button', { name: buttonText });
  await expect(btn).toBeVisible({ timeout: 5000 });

  // クリックしてから遷移を待つ（NextAuth の redirect が完了するまで）
  await btn.click();
  await page.waitForURL(/\/(dashboard|events|verify-phone|hub|mypage)/, { timeout: 55000 });

  const url = page.url();
  if (url.includes('/verify-phone')) {
    await applySkipPhoneVerificationAndReload(page);
    await page.waitForURL(/\/(dashboard|events|hub|mypage|verify-phone)/, { timeout: 10000 });
    if (page.url().includes('/verify-phone')) {
      await page.goto('/events');
    }
  }
  if (!page.url().includes('/events')) {
    await page.goto('/events');
  }
  await page.waitForURL(/\/events/, { timeout: 15000 });
}

/**
 * ログアウトする（UI経由。マイページ /mypage で「編集」→ プロフィールタブ内の「ログアウト」をクリック）
 */
export async function logout(page: Page) {
  await setSkipPhoneVerification(page);
  await page.goto('/mypage');
  await page.waitForURL(/\/mypage|\/verify-phone/, { timeout: 10000 });

  if (page.url().includes('/verify-phone')) {
    await applySkipPhoneVerificationAndReload(page);
    await page.goto('/mypage');
    await page.waitForURL(/\/mypage/, { timeout: 10000 });
  }

  // ログアウトはプロフィールタブ内にある。デスクトップ: 編集リンク/ボタン / モバイル: メニューで「プロフィール設定」
  const editLink = page.getByRole('link', { name: /プロフィールを編集|編集/ });
  const editBtn = page.getByRole('button', { name: '編集' });
  const menuSelect = page.getByRole('combobox', { name: 'メニューを選択' });
  if (await editLink.isVisible().catch(() => false)) {
    await editLink.click();
  } else if (await editBtn.isVisible().catch(() => false)) {
    await editBtn.click();
  } else if (await menuSelect.isVisible().catch(() => false)) {
    await menuSelect.selectOption('profile');
  }
  // プロフィールタブ描画を待つ（ログアウトは ProfileSection 内）
  await page.waitForLoadState('domcontentloaded');
  const logoutBtn = page.getByRole('button', { name: /ログアウト/ });
  await expect(logoutBtn).toBeVisible({ timeout: 15000 });
  page.once('dialog', (d) => d.accept());
  await logoutBtn.click();
  await page.waitForURL(/\/(auth\/signin)?\/?(\?|$)/, { timeout: 10000 });
}
