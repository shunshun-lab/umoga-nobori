// src/app/api/user/my-events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * ユーザーが主催するイベント一覧を取得
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

    // ユーザーが主催するイベントを取得
    const events = await prisma.event.findMany({
      where: {
        ownerId: user.id,
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
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

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching user's events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
