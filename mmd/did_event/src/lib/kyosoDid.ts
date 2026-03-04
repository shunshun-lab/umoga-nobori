// src/lib/kyosoDid.ts
import { kyoso, buildAuthHeaders } from "./kyosoClient";

/**
 * DID レスポンスの型定義
 */
export interface DidResponse {
  did: string;
  longFormDid: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DID ジョブレスポンスの型定義
 */
export interface DidJobResponse {
  jobId: string;
}

/**
 * DID ジョブステータスレスポンスの型定義
 */
export interface DidJobStatusResponse {
  id: string;
  status: "completed" | "in_progress" | "failed" | "pending";
  progress: number;
  result?: DidResponse & { keyId?: string };
}

/**
 * ユーザーの DID を取得
 * @param userJwt - ユーザーの Firebase JWT（オプション）
 * @returns DID 情報または null
 */
export async function getUserDid(userJwt?: string): Promise<DidResponse | null> {
  try {
    const res = await kyoso.get("/did", {
      headers: buildAuthHeaders(userJwt),
    });
    return res.data as DidResponse | null;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.warn(`DID Service unreachable at ${error.address}:${error.port}, skipping DID check.`);
      return null;
    }
    if (error.response?.status === 404) {
      console.warn("DID not found (404), treating as no existing DID.");
      return null;
    }
    console.error("Error fetching user DID:", error);
    throw error;
  }
}

/**
 * DID を作成してブロックチェーンに発行
 * @param userJwt - ユーザーの Firebase JWT（オプション）
 * @returns DID 作成結果
 */
export async function createAndPublishDid(userJwt?: string): Promise<DidResponse> {
  try {
    // DID 作成ジョブを開始
    const createRes = await kyoso.post<DidJobResponse>(
      "/did/job/create-and-publish",
      {},
      { headers: buildAuthHeaders(userJwt) }
    );
    const { jobId } = createRes.data;

    // ジョブ完了をポーリング（最大10回、2秒間隔）
    for (let i = 0; i < 10; i++) {
      const jobRes = await kyoso.get<DidJobStatusResponse>(`/did/job/${jobId}`, {
        headers: buildAuthHeaders(userJwt),
      });
      const job = jobRes.data;

      if (job.status === "completed" && job.result) {
        return job.result;
      }

      if (job.status === "failed") {
        throw new Error("DID creation job failed");
      }

      // 2秒待機
      await new Promise((r) => setTimeout(r, 2000));
    }

    throw new Error("DID job timeout");
  } catch (error) {
    console.error("Error creating and publishing DID:", error);
    throw error;
  }
}

/**
 * Issuer DID を取得
 * @returns Issuer DID 情報
 */
export async function getIssuerDid(): Promise<DidResponse> {
  try {
    const res = await kyoso.get<DidResponse>("/did/issuer", {
      headers: {
        "x-api-key": process.env.KYOSO_API_KEY!,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching issuer DID:", error);
    throw error;
  }
}
