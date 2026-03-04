import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addEventToUserGoogleCalendar } from "@/lib/add-to-calendar";

/**
 * イベントをGoogleカレンダーに追加
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
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { name: true, email: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const googleId = (session.user as { googleId?: string | null }).googleId ?? null;
    const result = await addEventToUserGoogleCalendar(
      userId,
      {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startAt: event.startAt,
        endAt: event.endAt,
      },
      { googleId }
    );

    if (!result.success) {
      const status = result.error.includes("連携") || result.error.includes("有効期限") ? 401 : 500;
      return NextResponse.json(
        { error: result.error },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      eventId: result.eventId,
      eventLink: result.eventLink,
    });
  } catch (error: any) {
    console.error("Error adding event to calendar:", error);
    return NextResponse.json(
      { error: "カレンダーへの追加に失敗しました", details: error.message },
      { status: 500 }
    );
  }
}
