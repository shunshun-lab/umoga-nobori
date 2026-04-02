// src/app/api/admin/events/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * イベントを承認する
 */
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // イベントを承認
    const event = await prisma.event.update({
      where: { id: params.id },
      data: { isApproved: true },
      include: {
        recurringTemplate: true,
      },
    });

    // 定例イベントの場合、次の回を生成
    if (event.isRecurring && event.recurringTemplateId) {
      const template = await prisma.recurringEventTemplate.findUnique({
        where: { id: event.recurringTemplateId },
      });

      if (template && template.isActive) {
        // 現在のインスタンス番号から次の回を計算
        const nextInstanceNumber = (event.instanceNumber || 0) + 1;

        // 既存の次回以降のイベント数を確認
        const futureEventsCount = await prisma.event.count({
          where: {
            recurringTemplateId: template.id,
            instanceNumber: {
              gte: nextInstanceNumber,
            },
          },
        });

        // maxFutureEventsまで未生成なら新しいイベントを作成
        if (futureEventsCount < template.maxFutureEvents) {
          // 次回の開催日を計算
          const nextDate = calculateNextEventDate(
            event.startAt,
            template.dayOfWeek
          );

          // 開始・終了時刻を計算
          const [startHour, startMinute] = template.startTime.split(":").map(Number);
          const startAt = new Date(nextDate);
          startAt.setHours(startHour, startMinute, 0, 0);

          let endAt: Date | null = null;
          if (template.endTime) {
            const [endHour, endMinute] = template.endTime.split(":").map(Number);
            endAt = new Date(nextDate);
            endAt.setHours(endHour, endMinute, 0, 0);
          }

          // 新しいイベントを作成
          // Fetch owner's personal community
          const ownerUser = await prisma.user.findUnique({
            where: { id: template.ownerId },
            select: { personalCommunityId: true } as any
          });

          if (ownerUser?.personalCommunityId) {
            // 新しいイベントを作成
            await prisma.event.create({
              data: {
                title: template.title,
                description: template.description,
                imageUrl: template.imageUrl,
                startAt,
                endAt,
                location: template.location,
                format: template.format,
                capacity: template.capacity,
                ownerId: template.ownerId,
                organizerCommunityId: ownerUser.personalCommunityId,
                createdByUserId: template.ownerId,
                isPublic: true,
                status: "published",
                isRecurring: true,
                recurringTemplateId: template.id,
                instanceNumber: nextInstanceNumber + template.maxFutureEvents - 1, // Logic seems slightly off here (jumping ahead?) but keeping original logic structure
                isApproved: false,
              } as any,
            });
          }
        }
      }
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error approving event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * 次の開催日を計算（次の指定曜日）
 */
function calculateNextEventDate(currentDate: Date, dayOfWeek: number | null): Date {
  const date = new Date(currentDate);
  const currentDay = date.getDay();

  // 次の週の同じ曜日を計算
  const daysUntilNext = 7;
  date.setDate(date.getDate() + daysUntilNext);

  return date;
}
