// src/app/api/user/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * ユーザー自身が主催するイベントの統計データを取得
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ユーザーが主催するイベントのIDリストを取得
    const userEvents = await prisma.event.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });

    const eventIds = userEvents.map((e) => e.id);

    // 統計データ取得（自分のイベントのみ）
    const [
      totalEvents,
      publishedEvents,
      totalParticipants,
      totalVCsIssued,
      recentEvents,
      eventsByCategory,
      eventsByMonth,
    ] = await Promise.all([
      // 総イベント数（自分のイベント）
      prisma.event.count({
        where: { ownerId: user.id },
      }),

      // 公開イベント数（自分のイベント）
      prisma.event.count({
        where: {
          ownerId: user.id,
          status: "published",
        },
      }),

      // 総参加者数（自分のイベント）
      prisma.participant.count({
        where: {
          eventId: { in: eventIds },
          status: "joined",
        },
      }),

      // 発行済みVC数（自分のイベント）
      prisma.eventCredential.count({
        where: {
          eventId: { in: eventIds },
          status: "ISSUED",
        },
      }),

      // 最近のイベント（参加者数順、自分のイベント）
      prisma.event.findMany({
        where: {
          ownerId: user.id,
          status: "published",
        },
        include: {
          _count: {
            select: { participants: true },
          },
        },
        orderBy: { startAt: "desc" },
        take: 10,
      }),

      // カテゴリー別イベント数（自分のイベント）
      prisma.event.groupBy({
        by: ['category'],
        where: {
          ownerId: user.id,
          category: { not: null },
        },
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: 'desc',
          },
        },
      }),

      // 月別イベント数（過去12ヶ月、自分のイベント）
      // SQLite/Prisma compatibility: Fetch dates and aggregate in JS
      prisma.event.findMany({
        where: {
          ownerId: user.id,
          startAt: {
            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // Past 12 months
          },
        },
        select: {
          startAt: true,
        },
        orderBy: {
          startAt: 'asc',
        },
      }),
    ]);

    // Format category data
    const formattedEventsByCategory = (eventsByCategory as any[]).map((item) => ({
      category: item.category,
      count: item._count.category,
    }));

    // Format monthly data in JS
    const monthlyMap = new Map<string, number>();
    (eventsByMonth as { startAt: Date }[]).forEach((event) => {
      const month = event.startAt.toISOString().slice(0, 7); // YYYY-MM
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
    });

    const formattedEventsByMonth = Array.from(monthlyMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 平均参加率を計算（自分のイベント）
    const eventsWithCapacity = await prisma.event.findMany({
      where: {
        ownerId: user.id,
        AND: [{ capacity: { not: null } }, { capacity: { gt: 0 } }],
      },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    });

    const avgParticipationRate =
      eventsWithCapacity.length > 0
        ? eventsWithCapacity.reduce(
          (sum, e) => sum + (e._count.participants / (e.capacity || 1)) * 100,
          0
        ) / eventsWithCapacity.length
        : 0;

    return NextResponse.json({
      overview: {
        totalEvents,
        publishedEvents,
        totalParticipants,
        totalVCsIssued,
        avgParticipationRate: Math.round(avgParticipationRate * 10) / 10,
      },
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        title: e.title,
        startAt: e.startAt,
        participantCount: e._count.participants,
        capacity: e.capacity,
        category: e.category,
      })),
      eventsByCategory: formattedEventsByCategory,
      eventsByMonth: formattedEventsByMonth,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
