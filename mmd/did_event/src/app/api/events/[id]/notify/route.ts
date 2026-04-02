// src/app/api/events/[id]/notify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendLineNotificationToMultiple,
  formatEventNotificationMessage,
} from "@/lib/lineNotify";

/**
 * イベント参加者に LINE 通知を送信
 * イベント主催者のみが実行可能
 */
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;
    const body = await req.json();
    const { message } = body;

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // イベント取得（主催者チェック）
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                lineUserId: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 主催者チェック
    if (event.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Only event organizer can send notifications" },
        { status: 403 }
      );
    }

    // LINE ユーザーID を持つ参加者のみ抽出
    const lineUserIds = event.participants
      .filter((p) => p.user.lineUserId)
      .map((p) => p.user.lineUserId as string);

    if (lineUserIds.length === 0) {
      return NextResponse.json(
        { error: "No participants with LINE account found" },
        { status: 400 }
      );
    }

    // 通知を送信
    const formattedMessage = formatEventNotificationMessage(
      event.title,
      message
    );

    try {
      await sendLineNotificationToMultiple(lineUserIds, formattedMessage);
    } catch (lineError) {
      console.error("Error sending LINE notifications:", lineError);
      return NextResponse.json(
        { error: "Failed to send LINE notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sentCount: lineUserIds.length,
      totalParticipants: event.participants.length,
    });
  } catch (error) {
    console.error("Error sending event notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
