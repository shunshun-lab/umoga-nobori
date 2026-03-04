
// src/app/api/events/[id]/verify-passphrase/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueEventCredential } from "@/lib/kyosoVc";

/**
 * 合言葉を検証してVCを発行
 * Updated to use 'keyword' instead of legacy 'passphrase'
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        owner: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // イベントが合言葉を要求しない場合はエラー (keyword is null or empty)
    if (!event.keyword) {
      return NextResponse.json(
        { error: "This event does not require a keyword" },
        { status: 400 }
      );
    }

    // リクエストボディから合言葉を取得
    const body = await req.json();
    const { passphrase } = body; // Client still sends 'passphrase' field? Or 'keyword'? Support both.
    const inputKeyword = passphrase || body.keyword;

    if (!inputKeyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    // 合言葉が一致するか確認
    if (inputKeyword !== event.keyword) {
      return NextResponse.json(
        { error: "Invalid keyword" },
        { status: 403 }
      );
    }

    // Passphrase Valid From/Until logic is REMOVED as columns were dropped.
    // Assuming keyword is always valid if set.

    // 既にこのイベントの参加証明を持っているかチェック
    const existingCredential = await prisma.eventCredential.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: event.id,
        },
      },
    });

    if (existingCredential) {
      return NextResponse.json(
        {
          message: "Credential already issued",
          credential: existingCredential,
        },
        { status: 200 }
      );
    }

    // VCを発行
    const credential = await issueEventCredential(user, event);

    return NextResponse.json({
      message: "Keyword verified and credential issued successfully",
      credential,
    });
  } catch (error) {
    console.error("Error verifying keyword:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
