// src/app/api/events/[id]/participants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasCommunityPermission } from "@/lib/community-auth";

/**
 * イベントの参加者詳細リストを取得（主催者のみ）
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    // イベント情報を取得
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 主催者・プラットフォームAdmin・コミュニティAdmin（MANAGE_EVENTS権限）のみアクセス可能
    let canAccess = event.ownerId === user.id || !!user.isAdmin;
    if (!canAccess && event.organizerCommunityId) {
      canAccess = await hasCommunityPermission(user.id, event.organizerCommunityId, "MANAGE_EVENTS");
    }
    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 参加者詳細リストを取得
    const participants = await prisma.participant.findMany({
      where: {
        eventId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            lineUserId: true,
            did: true,
          },
        },
        answers: {
          select: {
            questionId: true,
            value: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
