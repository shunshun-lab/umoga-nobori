// src/app/api/credentials/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVcJob } from "@/lib/kyosoVc";

/**
 * VC 発行ステータス確認エンドポイント
 * EventCredential の発行状況を確認し、完了していれば更新します
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // セッション確認
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const credentialId = params.id;

    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // EventCredential 取得
    const credential = await prisma.eventCredential.findUnique({
      where: { id: credentialId },
    });

    if (!credential) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 }
      );
    }

    // 権限チェック
    if (credential.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 既に ISSUED 状態の場合はそのまま返す
    if (credential.status === "ISSUED") {
      return NextResponse.json({
        id: credential.id,
        status: credential.status,
        vcRecordId: credential.vcRecordId,
        jwt: credential.jwt,
      });
    }

    // ジョブステータスを確認
    if (!credential.vcJobId) {
      return NextResponse.json(
        { error: "No job ID found" },
        { status: 400 }
      );
    }

    const jobStatus = await getVcJob(credential.vcJobId);

    // ジョブが完了している場合、DB を更新
    if (jobStatus.status === "completed" && jobStatus.result) {
      const updatedCredential = await prisma.eventCredential.update({
        where: { id: credentialId },
        data: {
          status: "ISSUED",
          vcRecordId: jobStatus.result.recordId,
          jwt: jobStatus.result.jwt || null,
        },
      });

      return NextResponse.json({
        id: updatedCredential.id,
        status: updatedCredential.status,
        vcRecordId: updatedCredential.vcRecordId,
        jwt: updatedCredential.jwt,
      });
    }

    // ジョブが失敗している場合
    if (jobStatus.status === "failed") {
      await prisma.eventCredential.update({
        where: { id: credentialId },
        data: { status: "FAILED" },
      });

      return NextResponse.json({
        id: credential.id,
        status: "FAILED",
        error: "VC issuance failed",
      });
    }

    // まだ進行中
    return NextResponse.json({
      id: credential.id,
      status: "ISSUING",
      progress: jobStatus.progress,
    });
  } catch (error) {
    console.error("Error checking credential status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
