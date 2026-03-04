// src/app/api/user/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * ユーザーが参加したイベント一覧を取得
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // ユーザーが参加したイベントを取得
    const participants = await prisma.participant.findMany({
      where: {
        userId: user.id,
      },
      include: {
        event: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                participants: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // ユーザーが主催したイベントを取得
    const organizedEvents = await prisma.event.findMany({
      where: {
        ownerId: user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        startAt: "desc",
      },
    });

    // イベントデータのみを抽出 (参加)
    const participatingEvents = participants.map((p) => p.event);

    // 重複排除してマージ (主催イベントを優先)
    const allEventsMap = new Map();

    // まず参加イベント
    participatingEvents.forEach(ev => {
      if (ev && ev.id) allEventsMap.set(ev.id, ev);
    });

    // 次に主催イベント (上書き)
    organizedEvents.forEach(ev => {
      if (ev && ev.id) allEventsMap.set(ev.id, { ...ev, isOrganizer: true });
    });

    // 配列に戻して開始日時順にソート
    const events = Array.from(allEventsMap.values()).sort((a: any, b: any) => {
      return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching user events:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}
