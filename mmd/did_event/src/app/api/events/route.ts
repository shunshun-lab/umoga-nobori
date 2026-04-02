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
    const status = searchParams.get("status") || "published";
    const tag = searchParams.get("tag");
    const format = searchParams.get("format");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = searchParams.get("q"); // Keyword search
    const category = searchParams.get("category");
    const organizerCommunityId = searchParams.get("organizerCommunityId");
    const price = searchParams.get("price"); // "free" | "paid"
    const myCommunities = searchParams.get("myCommunities"); // "true"
    const recommend = searchParams.get("recommend"); // "thisWeek" | "popular" | "community"
    const sort = searchParams.get("sort"); // "date_asc" | "date_desc" | "popular" | "newest"
    const limit = searchParams.get("limit"); // number
    const prefecture = searchParams.get("prefecture");

    const whereClause: any = {
      visibility: "public", // デフォルト: 一覧には完全公開のみ表示
    };
    if (status !== 'all') {
      whereClause.status = status;
    }

    if (organizerCommunityId) {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { organizerCommunityId },
        { coOrganizerCommunities: { some: { id: organizerCommunityId } } },
      ];
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
    if (prefecture) {
      whereClause.prefecture = prefecture;
    }

    // Date filters (from/to) — recommend presets can override
    let effectiveFrom = from;
    let effectiveTo = to;

    if (recommend === "thisWeek") {
      const now = new Date();
      effectiveFrom = now.toISOString();
      const endOfWeek = new Date(now);
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);
      effectiveTo = endOfWeek.toISOString();
    }

    if (effectiveFrom || effectiveTo) {
      whereClause.startAt = {};
      if (effectiveFrom) whereClause.startAt.gte = new Date(effectiveFrom);
      if (effectiveTo) whereClause.startAt.lte = new Date(effectiveTo);
    }

    // Price filter: free = all tickets price 0 or no tickets; paid = at least one ticket price > 0
    if (price === "free") {
      whereClause.tickets = { every: { price: { lte: 0 } } };
    } else if (price === "paid") {
      whereClause.tickets = { some: { price: { gt: 0 } } };
    }

    // myCommunities filter: only events from communities the user belongs to
    if (myCommunities === "true" && session?.user?.id) {
      const memberCommunities = await prisma.communityMember.findMany({
        where: { userId: session.user.id },
        select: { communityId: true },
      });
      const memberCommunityIds = memberCommunities.map((m) => m.communityId);
      whereClause.organizerCommunityId = { in: memberCommunityIds };
    }

    // recommend=community: same as myCommunities but for the recommend endpoint
    if (recommend === "community" && session?.user?.id) {
      const memberCommunities = await prisma.communityMember.findMany({
        where: { userId: session.user.id },
        select: { communityId: true },
      });
      const memberCommunityIds = memberCommunities.map((m) => m.communityId);
      whereClause.organizerCommunityId = { in: memberCommunityIds };
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
    // public: 一覧に表示、誰でも閲覧可
    // unlisted: 一覧に非表示、URLを知っていれば誰でも閲覧可
    // private: 一覧に非表示、allowedRoles のメンバー + オーナーのみ閲覧可
    if (session?.user?.id) {
      const visibilityCondition = {
        OR: [
          { visibility: "public" },                    // 完全公開
          { ownerId: session.user.id },                // オーナーは全て見える
          { coOrganizers: { some: { id: session.user.id } } }, // 共催者も見える
          {
            // private イベントで allowedRoles に属している
            AND: [
              { visibility: "private" },
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
        whereClause.AND = [visibilityCondition];
      }

      // デフォルトの visibility: "public" 制約を解除（visibilityCondition が制御する）
      if (whereClause.visibility) delete whereClause.visibility;

    } else {
      // Guest: Public only (already set by default)
    }

    // Determine orderBy
    let orderBy: any;
    const effectiveSort = sort || (recommend === "popular" ? "popular" : null);
    switch (effectiveSort) {
      case "date_desc":
        orderBy = { startAt: "desc" };
        break;
      case "popular":
        orderBy = { participants: { _count: "desc" } };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "date_asc":
      default:
        orderBy = { startAt: "asc" };
        break;
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
        allowedRoles: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy,
      ...(limit ? { take: parseInt(limit, 10) } : {}),
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
      title, description, imageUrl, startAt, endAt, location, format, onlineUrl, capacity, isPublic, organizerCommunityId, visibility,
      registrationDeadline, paymentDeadline,
      category, tags, website,
      googleMapsUrl, venueTitle, venueAddress, venueLat, venueLng, prefecture,
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
    let meetGenerationFailed = false;

    // Google Token Retrieval (with automatic refresh if expired)
    // Meet/Calendar 生成にはカレンダースコープが必要
    let googleToken: string | null = null;
    if (userId) {
      const { getValidGoogleToken, GOOGLE_SCOPES } = await import("@/lib/google-token");
      googleToken = await getValidGoogleToken(userId, GOOGLE_SCOPES.CALENDAR);
    }

    if (format === "online" || format === "hybrid") {
      if (generateMeet && !onlineUrl) {
        const { createGoogleCalendarEventWithMeet } = await import("@/lib/googleMeet");
        const { createGoogleMeetEvent } = await import("@/lib/google-calendar");

        const startDate = new Date(startAt);
        const endDate = endAt ? new Date(endAt) : new Date(startDate.getTime() + 60 * 60 * 1000);

        let meetUrl: string | null = null;

        // Method A: ユーザーのアクセストークン（リフレッシュ済み）→ システムトークン → サービスアカウント
        // createGoogleCalendarEventWithMeet は内部で user token → system token の順で試す
        meetUrl = await createGoogleCalendarEventWithMeet(
          {
            title,
            description: description || "",
            startAt: startDate,
            endAt: endDate,
            location: location || "",
          },
          googleToken ?? undefined
        );

        // Method B: サービスアカウント（最終手段）
        if (!meetUrl) {
          console.log("[Event Create] Falling back to service account for Meet...");
          meetUrl = await createGoogleMeetEvent(title, description || "", startDate, endDate);
        }

        if (meetUrl) {
          finalOnlineUrl = meetUrl;
          console.log(`[Event Create] Meet link generated: ${meetUrl}`);
        } else {
          meetGenerationFailed = true;
          console.error("[Event Create] All Meet generation methods failed. No Meet link set.");
        }
      }
      // Calendar追加はDB保存後にfire-and-forgetで実行（下記参照）

      // 2. YouTube Live (有効化フラグがある場合)
      if (enableYoutube && session?.accessToken) {
        // ... (Existing logic)
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
        isPublic: visibility ? visibility === "public" : (isPublic ?? true),
        visibility: visibility || (isPublic === false ? "private" : "public"),
        status: "published", // デフォルトは公開状態
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
        category: category || null,
        tags: typeof tags === "string" ? tags : (tags && Array.isArray(tags) ? JSON.stringify(tags) : null),
        website: website || null,
        googleMapsUrl: googleMapsUrl || null,
        venueTitle: venueTitle || null,
        venueAddress: venueAddress || null,
        prefecture: prefecture || null,
        venueLat: venueLat != null && !isNaN(Number(venueLat)) ? Number(venueLat) : null,
        venueLng: venueLng != null && !isNaN(Number(venueLng)) ? Number(venueLng) : null,
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

    // --- 非同期タスク（fire-and-forget: レスポンスをブロックしない） ---
    const asyncTasks = async () => {
      try {
        // 1. 作成者への通知
        const { sendNotification } = await import("@/lib/notifications");
        await sendNotification(
          userId,
          "event_message",
          "イベントを作成しました",
          `イベント「${title}」を作成しました。`,
          { eventId: event.id, link: `/events/${event.id}`, actorUserId: userId }
        );

        // 2. コミュニティメンバーへの通知
        if (organizerCommunityId) {
          const members = await prisma.communityMember.findMany({
            where: { communityId: organizerCommunityId },
            select: { userId: true },
          });
          const otherMembers = members.filter(m => m.userId !== userId);
          await Promise.allSettled(
            otherMembers.map(m =>
              sendNotification(
                m.userId,
                "community_event",
                "新しいイベント",
                `「${title}」が公開されました`,
                { eventId: event.id, communityId: organizerCommunityId, link: `/events/${event.id}`, actorUserId: userId }
              )
            )
          );
        }

        // 3. Google Calendar追加（Meet生成以外）
        if (googleToken) {
          try {
            const { createGoogleCalendarEvent } = await import("@/lib/google-calendar");
            const startDate = new Date(startAt);
            const endDate = endAt ? new Date(endAt) : new Date(startDate.getTime() + 60 * 60 * 1000);
            await createGoogleCalendarEvent(googleToken, {
              title,
              description: description || "",
              startAt: startDate,
              endAt: endDate,
              location: location || finalOnlineUrl || "",
            });
          } catch (e) {
            console.error("[Event Create] Google Calendar add failed:", e);
          }
        }
      } catch (e) {
        console.error("[Event Create] Async tasks failed:", e);
      }

      // 4. AI短縮サマリー生成
      try {
        const cleanDesc = description ? description.replace(/<[^>]*>?/gm, "").trim() : "";
        const summaryText = `${title}\n${cleanDesc}`.slice(0, 1000);
        const { openai } = await import("@/lib/openai");
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "あなたはイベント告知の要約アシスタントです。与えられたイベント情報を50文字以内で魅力的に要約してください。絵文字を1-2個使い、参加したくなるような簡潔なキャッチコピーにしてください。URLは含めないでください。" },
            { role: "user", content: summaryText },
          ],
          max_tokens: 100,
          temperature: 0.7,
        });
        const summary = completion.choices?.[0]?.message?.content?.trim();
        if (summary) {
          await prisma.event.update({ where: { id: event.id }, data: { shortSummary: summary } });
        }
      } catch (e) {
        console.error("[Event Create] Short summary generation failed:", e);
      }
    };
    // 非同期実行（awaitしない = レスポンスをブロックしない）
    asyncTasks().catch(e => console.error("[Event Create] Background task error:", e));

    return NextResponse.json({
      ...event,
      redirectToEdit: true,
      ...(meetGenerationFailed && { meetGenerationFailed: true }),
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: `Failed to create event: ${error.message || error}` },
      { status: 500 }
    );
  }
}
