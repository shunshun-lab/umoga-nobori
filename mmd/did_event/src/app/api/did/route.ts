// src/app/api/did/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserDid } from "@/lib/kyosoDid";

/**
 * ユーザーの DID を取得
 */
export async function GET(req: NextRequest) {
  try {
    // セッション確認
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    // DBから DID 情報を取得 (Service経由)
    // Prompt 3.6: "DBの didValue を基準に個別GETする方針に寄せる"
    // didValue exists in User.did
    if (!user.did) {
      return NextResponse.json(null); // No DID yet
    }

    // Retrieve details if needed (optional, or just return DID string)
    // Prompt says "return results of DidService.getByDidRef(didValue)"
    // If we only need the string, just returning user.did is faster.
    // But `DidResponse` shape includes status etc.
    // Let's try to fetch active doc from Agent if possible, or construct basic response.

    const { getDidByRef } = await import("@/lib/services/did.service");
    const didDoc = await getDidByRef(user.did);

    if (!didDoc) {
      // Fallback if Registrar fetch fails but we have DID?
      return NextResponse.json({
        did: user.did,
        status: "ISSUED_LOCAL",
        longFormDid: user.did
      });
    }

    return NextResponse.json(didDoc);
  } catch (error) {
    console.error("Error fetching DID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
