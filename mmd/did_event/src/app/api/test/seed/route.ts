// src/app/api/test/seed/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * テストデータ投入
 */
export async function POST() {
  try {
    // テストユーザー作成
    const user = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        email: "test@example.com",
        name: "テストユーザー",
        lineUserId: "test-line-user-123",
        provider: "line",
      },
    });

    // テストイベント作成
    const event = await prisma.event.create({
      data: {
        title: "技術カンファレンス 2024",
        description: "DIDとVCを学ぶイベント",
        startAt: new Date("2024-12-01T10:00:00Z"),
        endAt: new Date("2024-12-01T18:00:00Z"),
        location: "東京",
        capacity: 100,
        ownerId: user.id,
        isPublic: true,
        status: "published",
        organizerCommunityId: "fallback-system", // Required field
      },
    });

    return NextResponse.json({
      status: "success",
      message: "テストデータを作成しました",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        event: {
          id: event.id,
          title: event.title,
          startAt: event.startAt,
        },
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "テストデータの作成に失敗しました",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
