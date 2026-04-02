// src/app/api/events/[id]/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueEventVcToUser, issueEventVcToDid } from "@/lib/kyosoVc";
import { createAndPublishDid } from "@/lib/kyosoDid";
import { addEventToUserGoogleCalendar } from "@/lib/add-to-calendar";
import { Prisma } from "@/generated/prisma/client";
import { createPointTransaction } from "@/lib/ledger";
import { recordEventJoined, recordLedgerEarned, recordCredentialIssued } from "@/lib/member-facts";
import { requirePhoneVerification } from "@/lib/require-phone";

// Define Body Interface
interface JoinRequestBody {
  ticketId?: string;
  answers?: { questionId: string; value: string }[];
  intentId?: string;
  paymentMethod?: string;
  attendanceMode?: "online" | "offline";
}

/**
 * イベント参加エンドポイント
 * ユーザーがイベントに参加し、VC を発行します
 */
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // セッション確認
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const eventId = params.id;

    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 電話番号認証チェック（必須）
    const phoneCheck = await requirePhoneVerification(user.id);
    if (phoneCheck) return phoneCheck;

    // Parse Body
    let body: JoinRequestBody = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { ticketId, answers = [], intentId, paymentMethod, attendanceMode } = body;

    // イベント取得
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        owner: true,
        tickets: {
          include: {
            _count: {
              select: { participants: true }
            }
          }
        },
        questions: true,
        allowedRoles: { select: { id: true } },
        coOrganizers: { select: { id: true } },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // --- Visibility / Entitlement gating ---
    // private イベントのみロールチェック（unlisted は URLを知っていれば参加可）
    const eventVisibility = (event as any).visibility || "public";
    const allowedRoleIds = (event as { allowedRoles?: { id: string }[] }).allowedRoles?.map(r => r.id) ?? [];
    if (eventVisibility === "private" && allowedRoleIds.length > 0) {
      // Owner と admin はゲーティング免除
      const isOwner = event.ownerId === user.id;
      const isAdmin = user.isAdmin;
      if (!isOwner && !isAdmin) {
        // CommunityMember.roleId または RoleGrant で該当ロールを持っているか確認
        const [memberRole, grantedRole] = await Promise.all([
          prisma.communityMember.findFirst({
            where: {
              userId: user.id,
              roleId: { in: allowedRoleIds },
            },
          }),
          prisma.roleGrant.findFirst({
            where: {
              userId: user.id,
              roleId: { in: allowedRoleIds },
              status: "ACTIVE",
            },
          }),
        ]);
        if (!memberRole && !grantedRole) {
          return NextResponse.json(
            { error: "このイベントに参加するには特定のロールが必要です" },
            { status: 403 }
          );
        }
      }
    }

    // Strict typing for included relations
    type EventWithRelations = Prisma.EventGetPayload<{
      include: {
        owner: true;
        tickets: { include: { _count: { select: { participants: true } } } };
        questions: true;
      }
    }>;
    const typedEvent = event as EventWithRelations;

    // Validate Questions (questions may be missing from generated Prisma type)
    const questions = (typedEvent as { questions?: { id: string; required?: boolean; label?: string }[] }).questions;
    if (questions && questions.length > 0) {
      const requiredQuestions = questions.filter((q: { required?: boolean }) => q.required);
      for (const q of requiredQuestions) {
        const answer = answers.find(a => a.questionId === q.id);
        if (!answer || !answer.value) {
          return NextResponse.json(
            { error: `Answer for required question "${(q as { label?: string }).label ?? q.id}" is missing` },
            { status: 400 }
          );
        }
      }
    }

    // Validate Ticket (tickets may be missing from generated Prisma type)
    type TicketWithCount = { id: string; limit: number | null; price: number; _count?: { participants: number } };
    const tickets = (typedEvent as { tickets?: TicketWithCount[] }).tickets;
    if (tickets && tickets.length > 0) {
      if (!ticketId) {
        return NextResponse.json(
          { error: "Ticket selection is required" },
          { status: 400 }
        );
      }

      const selectedTicket = tickets.find((t: { id: string }) => t.id === ticketId);
      if (!selectedTicket) {
        return NextResponse.json(
          { error: "Invalid ticket" },
          { status: 400 }
        );
      }

      // Check Limit
      if (selectedTicket.limit !== null) {
        const soldCount = selectedTicket._count?.participants || 0;
        if (soldCount >= selectedTicket.limit) {
          return NextResponse.json(
            { error: "Ticket is sold out" },
            { status: 400 }
          );
        }
      }
    }

    // ハイブリッドイベントの場合、attendanceMode 必須
    if (event.format === "hybrid") {
      if (!attendanceMode || !["online", "offline"].includes(attendanceMode)) {
        return NextResponse.json(
          { error: "ハイブリッドイベントでは参加方法（会場/オンライン）を選択してください" },
          { status: 400 }
        );
      }
      // モード別定員チェック
      const modeCapacity = attendanceMode === "offline"
        ? (event as any).offlineCapacity
        : (event as any).onlineCapacity;
      if (modeCapacity != null) {
        const modeCount = await prisma.participant.count({
          where: {
            eventId,
            attendanceMode,
            status: { in: ["JOINED", "PENDING", "ATTENDED", "COMPLETED"] },
          },
        });
        if (modeCount >= modeCapacity) {
          return NextResponse.json(
            { error: attendanceMode === "offline" ? "会場参加の定員に達しています" : "オンライン参加の定員に達しています" },
            { status: 400 }
          );
        }
      }
    }

    // 既に参加済みかチェック
    const existingParticipant = await prisma.participant.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: eventId,
        },
      },
    });

    if (existingParticipant && !intentId) {
      return NextResponse.json(
        { error: "Already joined this event" },
        { status: 400 }
      );
    }

    // Determine Payment Status
    let paymentStatus = "free";
    let method: string | null = null;

    if (ticketId && tickets) {
      const selectedTicket = tickets.find((t: { id: string }) => t.id === ticketId);
      if (selectedTicket && selectedTicket.price > 0) {
        // Paid Ticket
        method = paymentMethod || null;

        if (!method) {
          return NextResponse.json(
            { error: "Payment method is required for paid tickets" },
            { status: 400 }
          );
        }

        paymentStatus = "pending";
      }
    }

    // Determine Participation Status (check approvalRequired)
    const approvalRequired = (typedEvent as { approvalRequired?: boolean }).approvalRequired;
    const participationStatus: string = approvalRequired ? "PENDING" : "JOINED";

    // --- TRANSACTION START ---
    const { participant, intentConsumed, isNewJoin } = await prisma.$transaction(async (tx: typeof prisma) => {
      // 1. Participant Creation/Retrieval
      let part = await tx.participant.findUnique({
        where: { userId_eventId: { userId: user.id, eventId: eventId } }
      });

      let isNew = false;
      if (!part) {
        part = await tx.participant.create({
          data: {
            userId: user.id,
            eventId: eventId,
            status: participationStatus,
            ticketId: ticketId || null,
            paymentStatus,
            paymentMethod: method,
            attendanceMode: attendanceMode || null,
            answers: {
              create: answers.map(a => ({
                questionId: a.questionId,
                value: a.value
              }))
            }
          },
        });
        isNew = true;
      }

      let consumed = false;

      // 2. Intent Handling
      if (intentId) {
        const intent = await tx.joinIntent.findUnique({ where: { id: intentId } });
        // Consume if valid and not consumed
        if (intent && !intent.consumedAt) {
          // A) Ensure Follow Referrer
          if (intent.referrerUserId && intent.referrerUserId !== user.id) {
            await tx.follow.upsert({
              where: { followerId_followingId: { followerId: user.id, followingId: intent.referrerUserId } },
              create: { followerId: user.id, followingId: intent.referrerUserId },
              update: {}
            });
            // Log
            await tx.attributionLog.create({
              data: { action: "AUTO_FOLLOW", referrerUserId: intent.referrerUserId, userId: user.id, src: intent.src }
            });
          }

          // B) Ensure Follow Organizer
          if (typedEvent.ownerId && typedEvent.ownerId !== user.id) {
            await tx.follow.upsert({
              where: { followerId_followingId: { followerId: user.id, followingId: typedEvent.ownerId } },
              create: { followerId: user.id, followingId: typedEvent.ownerId },
              update: {}
            });
          }

          // C) Ensure Community Join
          const targetCommId = (typedEvent as { organizerCommunityId?: string }).organizerCommunityId;
          if (targetCommId) {
            await tx.communityMember.upsert({
              where: { userId_communityId: { userId: user.id, communityId: targetCommId } },
              create: { userId: user.id, communityId: targetCommId, role: "MEMBER" },
              update: {}
            });
            // Log
            await tx.attributionLog.create({
              data: { action: "AUTO_COMMUNITY_JOIN", userId: user.id, communityId: targetCommId, src: intent.src }
            });
          }

          // D) Consume Intent
          await tx.joinIntent.update({
            where: { id: intent.id },
            data: { consumedAt: new Date(), consumedByUserId: user.id }
          });
          consumed = true;

          // E) Log Completion
          await tx.attributionLog.create({
            data: {
              action: "JOIN_COMPLETED",
              referrerUserId: intent.referrerUserId,
              userId: user.id,
              eventId: typedEvent.id,
              communityId: targetCommId,
              src: intent.src,
            }
          });
        }
      }

      return { participant: part, intentConsumed: consumed, isNewJoin: isNew };
    });

    // If PENDING, we stop here (no VC, no post yet)
    if (participationStatus === "PENDING") {
      return NextResponse.json({
        participant,
        message: "Registration received. Waiting for organizer approval."
      });
    }

    // 参加確定時: Googleカレンダーに自動追加（連携済みユーザーのみ）
    if (isNewJoin && participationStatus === "JOINED") {
      try {
        const googleId = (session.user as { googleId?: string | null }).googleId ?? null;
        const calResult = await addEventToUserGoogleCalendar(
          user.id,
          {
            id: typedEvent.id,
            title: typedEvent.title,
            description: typedEvent.description,
            location: typedEvent.location,
            startAt: typedEvent.startAt,
            endAt: typedEvent.endAt,
          },
          { googleId }
        );
        if (calResult.success) {
          console.log(`[Join] Event ${eventId} added to Google Calendar for user ${user.id}`);
        }
      } catch (calErr) {
        console.error("[Join] Failed to add event to Google Calendar:", calErr);
      }
    }

    // New Join Specific Actions (Chat Post, VC)
    if (isNewJoin) {
      // Record EVENT_JOINED fact
      const factCommunityId = (typedEvent as { organizerCommunityId?: string }).organizerCommunityId
        || (typedEvent as { communityId?: string }).communityId;
      if (factCommunityId) {
        await recordEventJoined({
          communityId: factCommunityId,
          userId: user.id,
          eventId,
          participantId: participant.id,
        });
      }

      // A) JOIN報酬（ポイント付与）: 設定がある場合のみ、重複なしで付与
      try {
        const joinReward = await prisma.eventPointReward.findUnique({
          where: { eventId_type: { eventId, type: "JOIN" } }
        });
        if (joinReward?.isActive && Number(joinReward.amount) > 0) {
          const alreadyGranted = await prisma.eventPointRewardGrant.findUnique({
            where: { rewardId_userId: { rewardId: joinReward.id, userId: user.id } }
          });
          if (!alreadyGranted) {
            await prisma.$transaction(async (tx: typeof prisma) => {
              await tx.eventPointRewardGrant.create({
                data: {
                  rewardId: joinReward.id,
                  userId: user.id,
                  participantId: participant.id,
                  referenceId: `event:${eventId}:reward:JOIN:participant:${participant.id}`,
                }
              });
              // NOTE: 現状のポイント実装はユーザーに対する加算（口座差引は後続で拡張）
              const rewardCommunityId = (typedEvent as { organizerCommunityId?: string }).organizerCommunityId || (typedEvent as { communityId?: string }).communityId || factCommunityId;
              if (!rewardCommunityId) throw new Error("No communityId for point transaction");
              await createPointTransaction({
                userId: user.id,
                communityId: rewardCommunityId as string,
                amount: Number(joinReward.amount),
                type: "EARN",
                description: `イベント参加報酬: ${typedEvent.title}`,
              });
            });
            if (factCommunityId) {
              await recordLedgerEarned({
                communityId: factCommunityId,
                userId: user.id,
                amount: Number(joinReward.amount),
                description: `イベント参加報酬: ${typedEvent.title}`,
                eventId,
                rewardType: "JOIN",
              });
            }
          }
        }
      } catch (ptErr) {
        console.error("[Join] Failed to grant join reward:", ptErr);
      }

      // 参加チャットへの自動投稿（eventId で直接紐付け）
      try {
        await prisma.post.create({
          data: {
            content: "イベントに参加しました！",
            userId: user.id,
            eventId,
          },
        });
      } catch (msgError) {
        console.error("Failed to post auto-join message:", msgError);
      }

      // VC 発行用のクレーム作成
      let credential = null;
      try {
        const claims = {
          name: user.name || "Unknown",
          email: user.email,
          eventId: typedEvent.id,
          eventTitle: typedEvent.title,
          startAt: typedEvent.startAt.toISOString(),
          organizerName: typedEvent.owner?.name || "Unknown",
          participantId: participant.id,
          joinedAt: participant.createdAt.toISOString(),
        };

        // Determine how to issue VC
        let jobId = "";

        // 1. Try to use stored DID (Best for Prod)
        if (user.did) {
          const res = await issueEventVcToDid(user.did, claims);
          jobId = res.jobId;
        } else {
          // 2. No DID? Try to create one if Token is present (Lazy Creation)
          const authHeader = req.headers.get("authorization");
          if (authHeader?.startsWith("Bearer ")) {
            try {
              const token = authHeader.split(" ")[1];
              const newDid = await createAndPublishDid(token);
              // Update DB
              await prisma.user.update({ where: { id: user.id }, data: { did: newDid.did } });
              // Issue to new DID
              const res = await issueEventVcToDid(newDid.did, claims);
              jobId = res.jobId;
            } catch (didErr) {
              console.error("Failed to lazy-create DID during join:", didErr);
            }
          }
        }

        // 3. Fallback to legacy method (User Self-Issue via JWT or Test Mode)
        if (!jobId) {
          console.log("Fallback to legacy issueEventVcToUser (likely Test Mode)");
          const res = await issueEventVcToUser({ claims });
          jobId = res.jobId;
        }

        // EventCredential レコード作成
        credential = await prisma.eventCredential.create({
          data: {
            userId: user.id,
            eventId: eventId,
            vcJobId: jobId,
            vcRecordId: "", // ジョブ完了後に更新
            status: "ISSUING",
          },
        });
      } catch (vcError) {
        console.error("Error issuing event VC:", vcError);
      }
    }

    // --- イベントオーナーへの新規参加通知 ---
    if (isNewJoin && typedEvent.ownerId && typedEvent.ownerId !== user.id) {
      try {
        const { sendNotification } = await import("@/lib/notifications");
        const statusLabel = approvalRequired ? "（承認待ち）" : "";
        await sendNotification(
          typedEvent.ownerId,
          "event_message",
          "新しい参加申込",
          `${user.name || "ユーザー"}さんが「${typedEvent.title}」に参加申込しました${statusLabel}`,
          { eventId, actorUserId: user.id, link: `/events/${eventId}/manage/participants` }
        );
      } catch (e) {
        console.error("[Join] Failed to notify event owner:", e);
      }
    }

    // --- 共同主催者への新規参加通知 ---
    if (isNewJoin) {
      const coOrganizers = (typedEvent as { coOrganizers?: { id: string }[] }).coOrganizers ?? [];
      const coOrganizerIds = coOrganizers
        .map((co) => co.id)
        .filter((id) => id !== user.id && id !== typedEvent.ownerId); // 参加者自身とオーナー（既に通知済み）を除外
      if (coOrganizerIds.length > 0) {
        try {
          const { sendNotification } = await import("@/lib/notifications");
          const statusLabel = approvalRequired ? "（承認待ち）" : "";
          await Promise.allSettled(
            coOrganizerIds.map((coOrgId) =>
              sendNotification(
                coOrgId,
                "event_message",
                "新しい参加申込",
                `${user.name || "ユーザー"}さんが「${typedEvent.title}」に参加申込しました${statusLabel}`,
                { eventId, actorUserId: user.id, link: `/events/${eventId}/manage/participants` }
              )
            )
          );
        } catch (e) {
          console.error("[Join] Failed to notify co-organizers:", e);
        }
      }
    }

    // --- ファンランク自動評価 ---
    if (isNewJoin) {
      const rankCommunityId = (typedEvent as { organizerCommunityId?: string }).organizerCommunityId
        || (typedEvent as { communityId?: string }).communityId;
      if (rankCommunityId) {
        try {
          const { evaluateFanRank } = await import("@/lib/fan-rank");
          const rankResult = await evaluateFanRank(user.id, rankCommunityId);
          if (rankResult.granted.length > 0) {
            console.log(`[Join] Fan rank granted: ${rankResult.granted.join(", ")} for user ${user.id}`);
          }
        } catch (e) {
          console.error("[Join] Fan rank evaluation failed:", e);
        }
      }
    }

    return NextResponse.json({
      participant,
      credential: null,
      isAlreadyJoined: !isNewJoin
    });
  } catch (error) {
    console.error("Error joining event:", error);
    return NextResponse.json(
      { error: "Failed to join event" },
      { status: 500 }
    );
  }
}

/**
 * イベント参加キャンセルエンドポイント
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const participant = await prisma.participant.findFirst({
      where: {
        userId: user.id,
        eventId: params.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Not joined" },
        { status: 404 }
      );
    }

    await prisma.participant.delete({
      where: { id: participant.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling participation:", error);
    return NextResponse.json(
      { error: "Failed to cancel participation" },
      { status: 500 }
    );
  }
}
