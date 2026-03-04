// src/app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasCommunityPermission } from "@/lib/community-auth";
// import { createGoogleCalendarEventWithMeet } from "@/lib/googleMeet";
import { getAllEvents } from "@/lib/sheets";

/**
 * イベント一覧取得
 */
/**
 * イベント一覧取得
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "active";
    const tag = searchParams.get("tag");
    const format = searchParams.get("format");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = searchParams.get("q"); // Keyword search
    const category = searchParams.get("category");
    const organizerCommunityId = searchParams.get("organizerCommunityId");

    const whereClause: any = {
      isPublic: true,
    };
    if (status !== 'all') {
      whereClause.status = status;
    }

    if (organizerCommunityId) {
      whereClause.organizerCommunityId = organizerCommunityId;
    }

    if (tag) {
      whereClause.tags = { contains: tag };
    }
    if (format) {
      whereClause.format = format;
    }
    if (category) {
      whereClause.category = category;
    }
    if (from || to) {
      whereClause.startAt = {};
      if (from) whereClause.startAt.gte = new Date(from);
      if (to) whereClause.startAt.lte = new Date(to);
    }

    // Keyword Search (OR condition)
    if (q) {
      // Prisma requires explicit AND for combining ORs if we want both to be true
      const searchCondition = {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { location: { contains: q } },
          { keyword: { contains: q } }
        ]
      };

      if (whereClause.OR) {
        whereClause.AND = [
          { OR: whereClause.OR },
          searchCondition
        ];
        delete whereClause.OR;
      } else {
        whereClause.OR = searchCondition.OR;
      }
    }

    // Visibility Logic
    if (session?.user?.id) {
      // Authenticated user: See public events OR owned events OR events restricted to their roles
      // Combine with existing OR if present (keyword search) is tricky.
      // The simpliest way is to put visibility check as a separate AND condition if possible, 
      // but Prisma AND:[{OR}, {OR}] works.

      const visibilityCondition = {
        OR: [
          { isPublic: true },
          { ownerId: session.user.id },
          {
            allowedRoles: {
              some: {
                members: {
                  some: {
                    userId: session.user.id
                  }
                }
              }
            }
          }
        ]
      };

      if (whereClause.OR) { // Already has search OR
        if (!whereClause.AND) whereClause.AND = [];
        whereClause.AND.push({ OR: whereClause.OR }); // Push search OR
        whereClause.AND.push(visibilityCondition); // Push visibility OR
        delete whereClause.OR;
      } else if (whereClause.AND) {
        whereClause.AND.push(visibilityCondition);
      } else {
        // No search OR yet
        whereClause.AND = [visibilityCondition];
      }

      // Remove strict isPublic: true if it was set (it is set by default above)
      if (whereClause.isPublic) delete whereClause.isPublic;

    } else {
      // Guest: Public only (already set by default)
    }

    // 全イベントを取得（organizerCommunity は include しない＝削除済みコミュニティ参照でも Prisma が落ちない）
    const events = await prisma.event.findMany({
      where: whereClause,
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
        tickets: true,
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // organizerCommunity を別取得して付与（参照先が削除済みの場合は null のまま＝機能損なわない）
    const communityIds = [...new Set(events.map((e) => e.organizerCommunityId).filter(Boolean))] as string[];
    const communities =
      communityIds.length > 0
        ? await prisma.community.findMany({
            where: { id: { in: communityIds } },
            select: { id: true, name: true },
          })
        : [];
    const communityById = Object.fromEntries(communities.map((c) => [c.id, c]));

    const eventsWithCommunity = events.map((event) => ({
      ...event,
      organizerCommunity: event.organizerCommunityId
        ? communityById[event.organizerCommunityId] ?? null
        : null,
    }));

    return NextResponse.json(eventsWithCommunity);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/**
 * イベント作成
 * 認証不要 - 誰でもmhd.toroku@gmail.comのアカウントでMeetリンクを発行可能
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();
    const {
      title, description, imageUrl, startAt, endAt, location, format, onlineUrl, capacity, isPublic, organizerCommunityId,
      registrationDeadline, paymentDeadline,
      // Hare fields
      concept, target, needs, projectId, theme,
      // Check-in
      keyword,
      // Tickets
      tickets,
      // Registration Settings
      approvalRequired,
      questions // Array of { type, label, options, required }
    } = body;

    if (!title || !startAt) {
      return NextResponse.json(
        { error: "Title and startAt are required" },
        { status: 400 }
      );
    }

    if (!organizerCommunityId) {
      return NextResponse.json(
        { error: "Organizer community is required" },
        { status: 400 }
      );
    }

    const isPlatformAdmin = (session.user as any).isAdmin;
    const hasPermission = isPlatformAdmin
      || await hasCommunityPermission(userId, organizerCommunityId, "MANAGE_EVENTS");

    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 開催形式に応じたバリデーション
    if (format === "offline" && !location) {
      return NextResponse.json(
        { error: "Location is required for offline events" },
        { status: 400 }
      );
    }

    // オンラインイベントの場合、Google MeetまたはYouTube Liveを自動生成
    const { enableYoutube, generateMeet } = body;
    let finalOnlineUrl = onlineUrl;
    let youtubeData: any = {};

    // Google Token Retrieval (Checking if user is connected)
    let googleToken: string | null = null;
    if (userId) {
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          provider: "google"
        }
      });
      if (account?.access_token) {
        googleToken = account.access_token;
      }
    }

    if (format === "online" || format === "hybrid") {
      if (generateMeet && !onlineUrl) {
        try {
          const { createGoogleMeetEvent, createGoogleMeetEventWithToken } = await import("@/lib/google-calendar");
          const { createGoogleCalendarEventWithMeet } = await import("@/lib/googleMeet");

          const startDate = new Date(startAt);
          const endDate = endAt ? new Date(endAt) : new Date(startDate.getTime() + 60 * 60 * 1000);

          let meetUrl: string | null = null;

          // Method A: Use User's Access Token (Preferred for Consumer Accounts)
          if (googleToken) {
            meetUrl = await createGoogleMeetEventWithToken(googleToken, title, description || "", startDate, endDate);
          }

          // Method B: Fallback to System Account (OAuth2 Refresh Token > Service Account)
          if (!meetUrl) {
            // 優先: OAuth2 Refresh Token (dev@mmdao.org / mhd.toroku@gmail.com)
            // src/lib/googleMeet.ts のロジックを使用
            try {
              console.log("Attempting to create Meet via OAuth Refresh Token...");
              meetUrl = await createGoogleCalendarEventWithMeet({
                title,
                description: description || "",
                startAt: startDate,
                endAt: endDate,
                location: location || "",
              });
            } catch (e) {
              console.warn("OAuth Refresh Token method failed, falling back to Service Account:", e);
              // 最終手段: Service Account
              meetUrl = await createGoogleMeetEvent(title, description || "", startDate, endDate);
            }
          }

          if (meetUrl) {
            finalOnlineUrl = meetUrl;
            console.log(`[Event Create] Meet link generated successfully: ${meetUrl}`);
          } else {
            console.warn("[Event Create] Meet generation returned null - using fallback or manual URL");
          }
        } catch (e: any) {
          console.error("[Event Create] Meet generation failed with error:", e?.message || e);
          console.error("[Event Create] Error details:", JSON.stringify(e, null, 2));
        }
      }
      // If NOT generating Meet, but User has Google Account, Add to Calendar
      else if (googleToken) {
        try {
          const { createGoogleCalendarEvent } = await import("@/lib/google-calendar");
          const startDate = new Date(startAt);
          const endDate = endAt ? new Date(endAt) : new Date(startDate.getTime() + 60 * 60 * 1000);

          await createGoogleCalendarEvent(googleToken, {
            title,
            description: description || "",
            startAt: startDate,
            endAt: endDate,
            location: location || finalOnlineUrl || ""
          });
          console.log("Added to Google Calendar (Online/Hybrid without Auto-Meet)");
        } catch (e) {
          console.error("Failed to add to Google Calendar:", e);
        }
      }

      // 2. YouTube Live (有効化フラグがある場合)
      if (enableYoutube && session?.accessToken) {
        // ... (Existing logic)
      }
    } else if (format === 'offline' && googleToken) {
      // Offline Event: Add to Google Calendar if connected
      try {
        const { createGoogleCalendarEvent } = await import("@/lib/google-calendar");
        const startDate = new Date(startAt);
        const endDate = endAt ? new Date(endAt) : new Date(startDate.getTime() + 60 * 60 * 1000);

        await createGoogleCalendarEvent(googleToken, {
          title,
          description: description || "",
          startAt: startDate,
          endAt: endDate,
          location: location || ""
        });
        console.log("Added to Google Calendar (Offline)");
      } catch (e) {
        console.error("Failed to add to Google Calendar:", e);
      }
    }

    // イベントを作成（初回はdraft状態で作成）

    // イベントを作成（初回はdraft状態で作成）
    const event = await prisma.event.create({
      data: {
        title,
        description,
        imageUrl,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        paymentDeadline: paymentDeadline ? new Date(paymentDeadline) : null,
        location,
        format: format || "offline",
        onlineUrl: finalOnlineUrl,
        youtubeBroadcastId: youtubeData.youtubeBroadcastId,
        youtubeStreamUrl: youtubeData.youtubeStreamUrl,
        rtmpKey: youtubeData.rtmpKey,
        capacity,
        isPublic: isPublic ?? true,
        status: "draft", // 初回は下書きとして作成
        ownerId: userId,
        organizerCommunityId,
        communities: {
          connect: { id: organizerCommunityId }
        },
        // Hare fields
        concept,
        target,
        needs: needs ? JSON.stringify(needs) : undefined,
        projectId: projectId || null,
        keyword,
        theme,
        tickets: tickets && tickets.length > 0 ? {
          createMany: {
            data: tickets.map((t: any) => ({
              name: t.name,
              price: isNaN(Number(t.price)) ? 0 : Number(t.price),
              limit: t.limit && !isNaN(Number(t.limit)) ? Number(t.limit) : null,
              description: t.description || null,
            }))
          }
        } : undefined,
        acceptedPaymentMethods: body.acceptedPaymentMethods,
        bankDetails: body.bankDetails,
        // Registration Settings
        approvalRequired: approvalRequired || false,
        questions: questions && questions.length > 0 ? {
          createMany: {
            data: questions.map((q: any, index: number) => ({
              type: q.type || "text",
              label: q.label,
              options: q.options || [],
              required: q.required || false,
              order: index
            }))
          }
        } : undefined,
        // Co-organizers
        coOrganizers: body.coOrganizerIds && body.coOrganizerIds.length > 0
          ? { connect: body.coOrganizerIds.map((id: string) => ({ id })) }
          : undefined,
        coOrganizerCommunities: body.coOrganizerCommunityIds && body.coOrganizerCommunityIds.length > 0
          ? { connect: body.coOrganizerCommunityIds.map((id: string) => ({ id })) }
          : undefined,
        allowedRoles: body.allowedRoleIds && body.allowedRoleIds.length > 0
          ? { connect: body.allowedRoleIds.map((id: string) => ({ id })) }
          : undefined,
      },
    });

    if (userId) {
      const { sendNotification } = await import("@/lib/notifications");
      await sendNotification(
        userId,
        "event_message",
        "イベントを作成しました",
        `イベント「${title}」を作成しました。`,
        { eventId: event.id, link: `/events/${event.id}` }
      );
    }

    return NextResponse.json({ ...event, redirectToEdit: true }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: `Failed to create event: ${error.message || error}` },
      { status: 500 }
    );
  }
}
