// src/lib/kyosoVc.ts
import { kyoso, buildAuthHeaders, withRetry } from "./kyosoClient";

/**
 * VC ジョブレスポンスの型定義
 */
export interface VcJobResponse {
  jobId: string;
}

/**
 * VC レコードの型定義
 */
export interface VcRecord {
  recordId: string;
  subjectId: string;
  issuer: string;
  validityPeriod?: {
    start: string;
    end: string;
  };
  claims: Record<string, unknown>;
  jwt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * VC ジョブステータスレスポンスの型定義
 */
export interface VcJobStatusResponse {
  id: string;
  status: "completed" | "in_progress" | "failed" | "pending";
  progress: number;
  result?: VcRecord;
}

/**
 * イベント参加 VC を発行
 * @param params - 発行パラメータ
 * @param params.userJwt - ユーザーの Firebase JWT（オプション）
 * @param params.claims - VC に含めるクレーム情報
 * @returns ジョブ ID
 */
export async function issueEventVcToUser(params: {
  userJwt?: string;
  claims: Record<string, unknown>;
}): Promise<VcJobResponse> {
  try {
    const { userJwt, claims } = params;

    // Retry logic applied
    const res = await withRetry(() => kyoso.post<VcJobResponse>(
      "/vc/connectionless/job/issue-to-holder",
      { claims },
      { headers: buildAuthHeaders(userJwt) }
    ));

    return res.data;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.warn(`DID/VC Service unreachable at ${error.address}:${error.port}, cannot issue VC.`);
      // Mock response for local dev if safe, or throw
      if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
        console.log("Returning mock VC job ID (Service Unreachable)");
        return { jobId: "mock-job-id-" + Date.now() };
      }
      throw new Error("VC Service unreachable");
    }
    console.error("Error issuing event VC:", error.message || error);
    // Mock response for local dev
    if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
      console.log("Returning mock VC job ID");
      return { jobId: "mock-job-id-" + Date.now() };
    }
    throw error;
  }
}
/**
 * 特定の DID に対して VC を発行 (Issuer 権限)
 * @param did - 対象の DID
 * @param claims - クレーム情報
 */
export async function issueEventVcToDid(did: string, claims: Record<string, unknown>): Promise<VcJobResponse> {
  try {
    const res = await withRetry(() => kyoso.post<VcJobResponse>(
      "/vc/connectionless/job/issue",
      { subjectId: did, claims },
      {
        headers: {
          "x-api-key": process.env.KYOSO_API_KEY!,
        },
      }
    ));
    return res.data;
  } catch (error: any) {
    console.error("Error issuing VC to DID:", error.message || error);
    // Mock for Dev
    if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
      console.log("Mocking VC issuance to DID:", did);
      return { jobId: "mock-job-issue-" + Date.now() };
    }
    throw error;
  }
}

/**
 * VC ジョブのステータスを取得
 * @param jobId - ジョブ ID
 * @param userJwt - ユーザーの Firebase JWT（オプション）
 * @returns ジョブステータス
 */
export async function getVcJob(jobId: string, userJwt?: string): Promise<VcJobStatusResponse> {
  try {
    // Retry logic applied
    const res = await withRetry(() => kyoso.get<VcJobStatusResponse>(`/vc/connectionless/job/${jobId}`, {
      headers: buildAuthHeaders(userJwt),
    }));

    return res.data;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.warn(`DID/VC Service unreachable at ${error.address}:${error.port}, cannot get job status.`);
      if ((process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_MOCK_MODE === "true")) {
        // Continue to mock check
      } else {
        throw new Error("VC Service unreachable");
      }
    }

    if ((process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_MOCK_MODE === "true") && jobId.startsWith("mock-job-")) {
      console.log("Returning mock VC job status for:", jobId);
      const isCompleted = jobId.includes("completed");
      return {
        id: jobId,
        status: isCompleted ? "completed" : "pending",
        progress: isCompleted ? 100 : 50,
        result: isCompleted ? {
          recordId: "mock-record-id",
          subjectId: "mock-subject",
          issuer: "mock-issuer",
          claims: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : undefined
      };
    }

    // Don't log detailed error if it was a handled connection issue
    if (error.code !== 'ECONNREFUSED') {
      console.error("Error fetching VC job status:", error.message || error);
    }
    throw error;
  }
}

/**
 * VC レコード一覧を取得
 * @param userJwt - ユーザーの Firebase JWT（オプション）
 * @returns VC レコード一覧
 */
export async function getVcRecords(userJwt?: string): Promise<{ contents: VcRecord[] }> {
  try {
    const res = await kyoso.get("/vc", {
      headers: buildAuthHeaders(userJwt),
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching VC records:", error);
    throw error;
  }
}

/**
 * 特定の VC レコードを取得
 * @param recordId - レコード ID
 * @param userJwt - ユーザーの Firebase JWT（オプション）
 * @returns VC レコード詳細
 */
export async function getVcRecord(recordId: string, userJwt?: string): Promise<VcRecord> {
  try {
    const res = await kyoso.get<VcRecord>(`/vc/${recordId}`, {
      headers: buildAuthHeaders(userJwt),
    });
    return res.data;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.warn(`DID/VC Service unreachable at ${error.address}:${error.port}, cannot fetch VC record.`);
      throw new Error("VC Service unreachable");
    }
    console.error("Error fetching VC record:", error);
    throw error;
  }
}
/**
 * イベント参加VCを発行するラッパー関数
 * @param user - ユーザー情報
 * @param event - イベント情報
 */
export async function issueEventCredential(user: any, event: any) {
  // VCに含めるクレーム情報を構築
  const claims = {
    eventId: event.id,
    eventName: event.title,
    eventDate: event.startAt,
    participantName: user.name,
    participantId: user.id,
    issuedAt: new Date().toISOString(),
  };

  // Kyoso APIを呼び出してVC発行ジョブを作成
  const job = await issueEventVcToUser({
    claims,
    // userJwt: ... // 必要に応じてFirebase JWTなどを渡す
  });

  return job;
}

/**
 * Fan Membership VC を発行
 * RoleGrant が ACTIVE になったときに呼ぶ。
 */
export async function issueMembershipCredential(params: {
  user: { id: string; name: string | null; did?: string | null };
  community: { id: string; name: string };
  role: { id: string; name: string };
  grantedAt: Date;
  expiresAt?: Date | null;
}) {
  const claims = {
    type: "FanMembershipCredential",
    communityId: params.community.id,
    communityName: params.community.name,
    roleId: params.role.id,
    roleName: params.role.name,
    holderId: params.user.id,
    holderName: params.user.name,
    grantedAt: params.grantedAt.toISOString(),
    expiresAt: params.expiresAt?.toISOString() ?? null,
    issuedAt: new Date().toISOString(),
  };

  if (params.user.did) {
    return issueEventVcToDid(params.user.did, claims);
  }
  return issueEventVcToUser({ claims });
}

/**
 * Skill VC を発行
 * スキルが確認 (confirmed) されたときに呼ぶ。
 */
export async function issueSkillCredential(params: {
  user: { id: string; name: string | null; did?: string | null };
  skill: string;
  category?: string | null;
  confirmedBy?: { id: string; name: string | null };
}) {
  const claims = {
    type: "SkillCredential",
    holderId: params.user.id,
    holderName: params.user.name,
    skill: params.skill,
    category: params.category ?? null,
    confirmedById: params.confirmedBy?.id ?? null,
    confirmedByName: params.confirmedBy?.name ?? null,
    issuedAt: new Date().toISOString(),
  };

  if (params.user.did) {
    return issueEventVcToDid(params.user.did, claims);
  }
  return issueEventVcToUser({ claims });
}
