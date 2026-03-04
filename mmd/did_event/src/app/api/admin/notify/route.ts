// src/app/api/admin/notify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendLineNotificationToMultiple,
  sendLineNotification,
} from "@/lib/lineNotify";

/**
 * 管理者が任意のユーザーに LINE 通知を送信
 * 管理者のみが実行可能
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userIds, message, eventId } = body;

    // バリデーション
    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs are required" },
        { status: 400 }
      );
    }

    // イベント情報を取得（オプション）
    let eventTitle = "";
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { title: true },
      });
      if (event) {
        eventTitle = event.title;
      }
    }

    // ユーザーの LINE ID を取得
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        lineUserId: true,
      },
    });

    // LINE ユーザーID を持つユーザーのみ抽出
    const lineUserIds = users
      .filter((u: { lineUserId?: string | null }) => u.lineUserId)
      .map((u: { lineUserId?: string | null }) => u.lineUserId as string);

    if (lineUserIds.length === 0) {
      return NextResponse.json(
        { error: "No users with LINE account found" },
        { status: 400 }
      );
    }

    // メッセージの整形
    let formattedMessage = message;
    if (eventTitle) {
      formattedMessage = `【${eventTitle}】からのお知らせ\n\n${message}`;
    } else {
      formattedMessage = `【管理者】からのお知らせ\n\n${message}`;
    }

    // 通知を送信
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
      totalRequested: userIds.length,
    });
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
