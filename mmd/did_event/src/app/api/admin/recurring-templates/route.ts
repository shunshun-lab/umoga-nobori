// src/app/api/admin/recurring-templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 繰り返しパターンに基づいて次のN回分の開催日を計算
 */
function calculateOccurrences(
  template: {
    repeatType: string;
    interval: number;
    dayOfWeek?: number | null;
    weekOfMonth?: number | null;
    customDays?: string | null;
  },
  count: number
): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDate = new Date(today);

  switch (template.repeatType) {
    case "daily":
      // 毎日繰り返し
      for (let i = 0; i < count; i++) {
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + template.interval * i);
        dates.push(nextDate);
      }
      break;

    case "weekly":
      // 毎週同じ曜日
      if (template.dayOfWeek === null || template.dayOfWeek === undefined) break;

      for (let i = 0; i < count; i++) {
        const nextDate = new Date(currentDate);
        const currentDay = nextDate.getDay();
        let daysUntilNext = template.dayOfWeek - currentDay;

        if (i === 0) {
          // 初回: 次の該当曜日
          if (daysUntilNext <= 0) daysUntilNext += 7;
        } else {
          // 2回目以降: interval週間後
          daysUntilNext = template.interval * 7;
        }

        nextDate.setDate(nextDate.getDate() + daysUntilNext);
        dates.push(nextDate);
        currentDate = nextDate;
      }
      break;

    case "monthly":
      // 毎月同じ順番の同じ曜日（例: 第2木曜日）
      if (template.dayOfWeek === null || template.weekOfMonth === null) break;

      for (let i = 0; i < count; i++) {
        const date = findNthWeekdayOfMonth(
          currentDate,
          template.dayOfWeek!,
          template.weekOfMonth!,
          i === 0 ? 0 : template.interval
        );
        dates.push(date);
        currentDate = date;
      }
      break;

    case "custom":
      // カスタム（複数曜日指定）
      if (!template.customDays) break;
      const customDays = JSON.parse(template.customDays) as number[];

      let occurrenceCount = 0;
      let searchDate = new Date(currentDate);

      while (occurrenceCount < count) {
        const dayOfWeek = searchDate.getDay();

        if (customDays.includes(dayOfWeek) && searchDate >= today) {
          dates.push(new Date(searchDate));
          occurrenceCount++;
        }

        searchDate.setDate(searchDate.getDate() + 1);
      }
      break;
  }

  return dates;
}

/**
 * 指定された月の第N週の指定曜日を取得
 */
function findNthWeekdayOfMonth(
  startDate: Date,
  dayOfWeek: number,
  weekOfMonth: number,
  monthsAhead: number = 0
): Date {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + monthsAhead);
  date.setDate(1);

  // 月初が何曜日か
  const firstDayOfMonth = date.getDay();

  // 目的の曜日の第1週目の日付を計算
  let daysUntilTarget = dayOfWeek - firstDayOfMonth;
  if (daysUntilTarget < 0) daysUntilTarget += 7;

  // 第N週目の日付を計算
  const targetDate = 1 + daysUntilTarget + (weekOfMonth - 1) * 7;
  date.setDate(targetDate);

  return date;
}

/**
 * 定例イベントテンプレート一覧を取得
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const templates = await prisma.recurringEventTemplate.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching recurring templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * 定例イベントテンプレートを作成
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      imageUrl,
      repeatType,
      interval,
      dayOfWeek,
      weekOfMonth,
      customDays,
      startTime,
      endTime,
      location,
      format,
      onlineUrl,
      capacity,
      endType,
      endDate,
      maxOccurrences,
      maxFutureEvents,
    } = body;

    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email as string },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    const template = await prisma.recurringEventTemplate.create({
      data: {
        title,
        description,
        imageUrl,
        repeatType,
        interval,
        dayOfWeek,
        weekOfMonth,
        customDays,
        startTime,
        endTime,
        location,
        format: format || "online",
        onlineUrl,
        capacity,
        endType,
        endDate: endDate ? new Date(endDate) : null,
        maxOccurrences,
        ownerId: adminUser.id,
        maxFutureEvents: maxFutureEvents || 2,
        isActive: true,
      },
    });

    // Get admin's personal community for Events
    const adminUserWithComm = await prisma.user.findUnique({
      where: { id: adminUser.id },
      select: { personalCommunityId: true } as any
    });

    if (!adminUserWithComm?.personalCommunityId) {
      // Should theoretically not happen if migration worked, but safe fallback or error?
      // Creating a template is an admin action, we demand constitution compliance.
      return NextResponse.json(
        { error: "Admin user has no Personal Community. Please run backfill." },
        { status: 400 }
      );
    }

    // 初期イベントを自動生成
    const maxEvents = maxFutureEvents || 2;
    const occurrenceDates = calculateOccurrences(
      {
        repeatType,
        interval,
        dayOfWeek,
        weekOfMonth,
        customDays,
      },
      maxEvents
    );

    const events: Awaited<ReturnType<typeof prisma.event.create>>[] = [];
    for (let i = 0; i < occurrenceDates.length; i++) {
      const eventDate = occurrenceDates[i];

      // 開始・終了時刻を設定
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const startAt = new Date(eventDate);
      startAt.setHours(startHour, startMinute, 0, 0);

      let endAt: Date | null = null;
      if (endTime) {
        const [endHour, endMinute] = endTime.split(":").map(Number);
        endAt = new Date(eventDate);
        endAt.setHours(endHour, endMinute, 0, 0);
      }

      const event = await prisma.event.create({
        data: {
          title,
          description,
          imageUrl,
          startAt,
          endAt,
          location,
          format: format || "online",
          onlineUrl,
          capacity,
          ownerId: adminUser.id,
          organizerCommunityId: adminUserWithComm.personalCommunityId,
          createdByUserId: adminUser.id,
          isPublic: true,
          status: "published",
          isRecurring: true,
          recurringTemplateId: template.id,
          instanceNumber: i + 1,
          isApproved: false, // 最初は未承認
        } as any,
      });

      events.push(event);
    }

    return NextResponse.json({ template, events });
  } catch (error) {
    console.error("Error creating recurring template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
