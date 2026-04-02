// src/app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasCommunityPermission } from "@/lib/community-auth";

/**
 * イベント詳細取得
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Session と Event を並列取得
    const [event, session] = await Promise.all([
      prisma.event.findUnique({
        where: { id: params.id },
        include: {
          owner: {
            select: { id: true, name: true, image: true },
          },
          organizerCommunity: {
            select: { id: true, name: true, hpUrl: true, imageUrl: true },
          },
          // participants は _count のみ（全件includeは重い）
          // 詳細は /api/events/[id]/participants で別途取得
          participants: {
            select: {
              id: true,
              userId: true,
              status: true,
              user: { select: { id: true, name: true, image: true } },
            },
            take: 20, // 最初の20件だけ（一覧表示用）
          },
          coOrganizers: {
            select: { id: true, name: true, image: true },
          },
          coOrganizerCommunities: {
            select: { id: true, name: true, imageUrl: true },
          },
          _count: {
            select: { participants: true },
          },
          tickets: {
            select: { id: true, name: true, price: true, limit: true, description: true },
          },
          questions: {
            select: { id: true, type: true, label: true, options: true, required: true, order: true },
            orderBy: { order: "asc" },
          },
          allowedRoles: {
            select: { id: true, name: true, slug: true, color: true },
          },
        },
      }),
      getServerSession(authOptions),
    ]);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 管理者判定をサーバーサイドで（クライアントでの追加API呼び出しを削減）
    let isOwnerOrAdmin = false;
    // isOrganizer: 主催者・共催者（参加ボタンを非表示にする対象）
    let isOrganizer = false;
    if (session?.user?.id) {
      const userId = session.user.id;
      const isOwner = event.ownerId === userId;
      const isCoOrganizer = event.coOrganizers?.some((co: { id: string }) => co.id === userId) ?? false;
      const isPlatformAdmin = !!(session.user as any).isAdmin;

      isOrganizer = isOwner || isCoOrganizer;
      isOwnerOrAdmin = isOrganizer || isPlatformAdmin;

      if (!isOwnerOrAdmin && event.organizerCommunityId) {
        isOwnerOrAdmin = await hasCommunityPermission(userId, event.organizerCommunityId, "MANAGE_EVENTS");
      }
    }

    // Visibility アクセス制御
    // public: 誰でもアクセス可
    // unlisted: URLを知っていれば誰でもアクセス可（一覧に出ないだけ）
    // private: オーナー/共催者/管理者/allowedRoles メンバーのみ
    const visibility = (event as any).visibility || "public";
    if (visibility === "private" && !isOwnerOrAdmin) {
      // allowedRoles のメンバーかチェック
      const allowedRoleIds = (event as any).allowedRoles?.map((r: { id: string }) => r.id) ?? [];
      let hasAccess = false;

      if (session?.user?.id && allowedRoleIds.length > 0) {
        const [memberRole, grantedRole] = await Promise.all([
          prisma.communityMember.findFirst({
            where: { userId: session.user.id, roleId: { in: allowedRoleIds } },
          }),
          prisma.roleGrant.findFirst({
            where: { userId: session.user.id, roleId: { in: allowedRoleIds }, status: "ACTIVE" },
          }),
        ]);
        hasAccess = !!(memberRole || grantedRole);
      }

      if (!hasAccess) {
        return NextResponse.json(
          { error: "このイベントは招待制です。アクセス権限がありません。", code: "PRIVATE_EVENT" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ ...event, isOwnerOrAdmin, isOrganizer });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

/**
 * イベント更新
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { organizerCommunity: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isPlatformAdmin = (session.user as any).isAdmin;
    const canEdit = isPlatformAdmin || (event.organizerCommunityId
      ? await hasCommunityPermission(user.id, event.organizerCommunityId, "MANAGE_EVENTS")
      : event.ownerId === user.id);

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Whitelist allowed fields to prevent "Unknown argument" errors from relations or extra props
    const {
      title, description, imageUrl, location, format, onlineUrl, website,
      capacity, offlineCapacity, onlineCapacity, isPublic, status, category, tags, keyword,
      projectId, theme, concept, target, needs,
      venueTitle, venueLat, venueLng, venueAddress, googleMapsUrl,
      acceptedPaymentMethods, bankDetails,
      tickets, // Add tickets to destructured body
      questions, // Add questions (RegistrationQuestion) to destructured body
      generateMeet, // New field
      visibility, // "public" | "unlisted" | "private"
      allowedRoleIds, // string[]
    } = body;

    let finalOnlineUrl = onlineUrl;

    // Google Meet automatic generation
    if (generateMeet && (format === "online" || format === "hybrid")) {
      const { createGoogleCalendarEventWithMeet } = await import("@/lib/googleMeet");
      const { createGoogleMeetEvent } = await import("@/lib/google-calendar");
      const { getValidGoogleToken } = await import("@/lib/google-token");

      const googleToken = await getValidGoogleToken(user.id);
      const meetStartAt = body.startAt ? new Date(body.startAt) : event.startAt;
      const meetEndAt = body.endAt ? new Date(body.endAt) : event.endAt || new Date(new Date(body.startAt || event.startAt).getTime() + 60 * 60 * 1000);

      // user token → system token → service account の順で試行
      let meetResult = await createGoogleCalendarEventWithMeet(
        {
          title: title || event.title,
          description: description || event.description || "",
          startAt: meetStartAt,
          endAt: meetEndAt,
        },
        googleToken ?? undefined
      );

      if (!meetResult) {
        meetResult = await createGoogleMeetEvent(title || event.title, description || event.description || "", meetStartAt, meetEndAt);
      }

      if (meetResult) {
        finalOnlineUrl = meetResult;
      } else {
        console.error("[Event Update] All Meet generation methods failed.");
      }
    }

    const updateData: any = {
      title, description, imageUrl, location, format, onlineUrl: finalOnlineUrl, website,
      capacity: capacity ? Number(capacity) : null,
      offlineCapacity: offlineCapacity != null ? Number(offlineCapacity) || null : undefined,
      onlineCapacity: onlineCapacity != null ? Number(onlineCapacity) || null : undefined,
      isPublic: visibility ? visibility === "public" : isPublic,
      visibility,
      status, category, tags, keyword,
      projectId: projectId || null,
      theme, concept, target, needs: needs ? (typeof needs === 'string' ? needs : JSON.stringify(needs)) : undefined,
      venueTitle, venueLat, venueLng, venueAddress, googleMapsUrl,
      acceptedPaymentMethods, bankDetails
    };

    // Date handling
    if (body.startAt) updateData.startAt = new Date(body.startAt);
    if (body.endAt !== undefined) updateData.endAt = body.endAt ? new Date(body.endAt) : null;
    if (body.registrationDeadline !== undefined) updateData.registrationDeadline = body.registrationDeadline ? new Date(body.registrationDeadline) : null;
    if (body.paymentDeadline !== undefined) updateData.paymentDeadline = body.paymentDeadline ? new Date(body.paymentDeadline) : null;

    // Filter out undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Transaction for atomic update
    const updatedEvent = await prisma.$transaction(async (tx: typeof prisma) => {
      // 1. Update basic event data
      const event = await tx.event.update({
        where: { id: params.id },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // 2. Handle allowedRoles update
      if (allowedRoleIds !== undefined) {
        // Disconnect all existing, then connect new ones
        await tx.event.update({
          where: { id: params.id },
          data: {
            allowedRoles: { set: [] }, // disconnect all
          },
        });
        if (allowedRoleIds.length > 0) {
          await tx.event.update({
            where: { id: params.id },
            data: {
              allowedRoles: { connect: allowedRoleIds.map((id: string) => ({ id })) },
            },
          });
        }
      }

      // 3. Handle Tickets
      if (tickets && Array.isArray(tickets)) {
        // Get existing tickets
        const existingTickets = await tx.eventTicket.findMany({
          where: { eventId: params.id },
          select: { id: true, participants: { select: { id: true } } } // Check for participants
        });

        const existingIds = existingTickets.map(t => t.id);
        const incomingIds = tickets.map((t: any) => t.id).filter(id => id);

        // Identify tickets to delete
        const ticketsToDelete = existingTickets.filter(t => !incomingIds.includes(t.id));

        // Delete tickets (only if no participants)
        for (const ticket of ticketsToDelete) {
          if (ticket.participants.length > 0) {
            console.warn(`Skipping deletion of ticket ${ticket.id} because it has participants.`);
            continue;
          }
          await tx.eventTicket.delete({ where: { id: ticket.id } });
        }

        // Upsert tickets
        for (const ticket of tickets) {
          if (ticket.id) {
            // Update existing
            await tx.eventTicket.update({
              where: { id: ticket.id },
              data: {
                name: ticket.name,
                price: Number(ticket.price),
                limit: ticket.limit ? Number(ticket.limit) : null,
                description: ticket.description
              }
            });
          } else {
            // Create new
            await tx.eventTicket.create({
              data: {
                eventId: params.id,
                name: ticket.name,
                price: Number(ticket.price),
                limit: ticket.limit ? Number(ticket.limit) : null,
                description: ticket.description
              }
            });
          }
        }
      }

      // 3. Handle Questions (RegistrationQuestion)
      if (questions && Array.isArray(questions)) {
        const existingQuestions = await tx.registrationQuestion.findMany({
          where: { eventId: params.id },
          select: { id: true, answers: { select: { id: true } } },
        });

        const existingQIds = existingQuestions.map(q => q.id);
        const incomingQIds = questions.map((q: any) => q.id).filter((id: string) => id);

        // Delete questions not in incoming list (cascade deletes answers)
        const questionsToDelete = existingQuestions.filter(q => !incomingQIds.includes(q.id));
        for (const q of questionsToDelete) {
          await tx.registrationQuestion.delete({ where: { id: q.id } });
        }

        // Upsert questions
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const data = {
            type: (q.type || "TEXT").toUpperCase(),
            label: q.label,
            options: q.options || [],
            required: q.required || false,
            order: i,
          };

          if (q.id && existingQIds.includes(q.id)) {
            await tx.registrationQuestion.update({
              where: { id: q.id },
              data,
            });
          } else {
            await tx.registrationQuestion.create({
              data: { ...data, eventId: params.id },
            });
          }
        }
      }

      return event;
    });

    // Sync to Google Sheets
    try {
      const { updateEvent } = await import("@/lib/sheets");
      await updateEvent(updatedEvent.id, {
        ...updatedEvent,
        startAt: updatedEvent.startAt.toISOString(),
        endAt: updatedEvent.endAt ? updatedEvent.endAt.toISOString() : null,
      });
    } catch (e) {
      console.error("Failed to sync updated event to sheets:", e);
    }

    // 参加者への変更通知
    if (body.notifyParticipants) {
      try {
        const participants = await prisma.participant.findMany({
          where: { eventId: params.id, status: { notIn: ["REJECTED", "CANCELLED"] } },
          include: { user: { select: { id: true, name: true } } },
        });

        const { sendNotification } = await import("@/lib/notifications");
        const notifyMsg = body.notifyMessage || "イベント情報が更新されました";

        for (const p of participants) {
          try {
            await sendNotification(
              p.userId,
              "event_message",
              `「${updatedEvent.title}」の情報が更新されました`,
              notifyMsg,
              { eventId: params.id, link: `/events/${params.id}`, actorUserId: user.id }
            );
          } catch (notifyErr) {
            console.error(`Failed to notify participant ${p.userId}:`, notifyErr);
          }
        }
        console.log(`[EventUpdate] Notified ${participants.length} participants about changes`);
      } catch (notifyErr) {
        console.error("[EventUpdate] Failed to send update notifications:", notifyErr);
      }
    }

    // タイトルまたは説明が変更された場合、短縮サマリーを再生成（fire-and-forget）
    if (title !== undefined || description !== undefined) {
      (async () => {
        try {
          const eventTitle = title || updatedEvent.title;
          const eventDesc = (description || updatedEvent.description || "").replace(/<[^>]*>?/gm, "").trim();
          const summaryText = `${eventTitle}\n${eventDesc}`.slice(0, 1000);
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
            await prisma.event.update({ where: { id: params.id }, data: { shortSummary: summary } });
          }
        } catch (e) {
          console.error("[Event Update] Short summary generation failed:", e);
        }
      })();
    }

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: `Failed to update event: ${error.message || error}` },
      { status: 500 }
    );
  }
}

/**
 * イベント削除
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isPlatformAdmin = (session.user as any).isAdmin;
    const canDelete = isPlatformAdmin || (event.organizerCommunityId
      ? await hasCommunityPermission(user.id, event.organizerCommunityId, "MANAGE_EVENTS")
      : event.ownerId === user.id);

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
