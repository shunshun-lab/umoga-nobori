// src/lib/kyosoClient.ts
import axios, { AxiosError } from "axios";

const baseURL = process.env.KYOSO_BASE_URL!;
const apiKey = process.env.KYOSO_API_KEY!;
const testJwt = process.env.KYOSO_TEST_JWT; // AUTH_MODE=TEST 用

export const kyoso = axios.create({
  baseURL,
  timeout: 10000,
});

/**
 * Kyoso Cloud Agent への認証ヘッダーを構築
 * @param userFirebaseJwt - ユーザーの Firebase JWT（オプション）
 * @returns 認証ヘッダーオブジェクト
 */
export function buildAuthHeaders(userFirebaseJwt?: string) {
  // Production Safety Check:
  // If we are in production (NODE_ENV=production) AND not explicitly allowing test mode via robust env var,
  // we must NOT use the testJwt fallback.
  const isTestMode = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_MOCK_MODE === "true";

  if (!userFirebaseJwt && !isTestMode) {
    throw new Error("Security Error: No user JWT provided and Test Mode is disabled in Production environment.");
  }

  const token = userFirebaseJwt ?? testJwt;
  if (!token) throw new Error("No JWT for Kyoso");

  return {
    Authorization: `Bearer ${token}`,
    "x-api-key": apiKey,
  };
}

/**
 * API呼び出しをリトライするラッパー関数
 * @param fn - 実行する非同期関数
 * @param retries - 最大リトライ回数 (デフォルト: 3)
 * @param delay - リトライ間隔(ms) (デフォルト: 1000)
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;

    // Axiosのエラーで、400系(クライアントエラー)の場合はリトライしない
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw error;
      }
    }

    // For connection errors like ECONNREFUSED, we might want to skip retry or be very quiet
    if ((error as any).code === 'ECONNREFUSED') {
      // If it's a local service and unreachable, it's likely down. 
      // We skip retries to avoid log spam if it's expected to be down in some envs.
      throw error;
    }

    console.warn(`API call failed, retrying in ${delay}ms... (${retries} retries left). Error: ${(error as any).message || error}`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
  }
}
