// src/app/api/events/[id]/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueEventVcToUser, issueEventVcToDid } from "@/lib/kyosoVc";
import { createAndPublishDid } from "@/lib/kyosoDid";
import { addEventToUserGoogleCalendar } from "@/lib/add-to-calendar";
import { Prisma } from "@prisma/client";

// Define Body Interface
interface JoinRequestBody {
  ticketId?: string;
  answers?: { questionId: string; value: string }[];
  intentId?: string;
  paymentMethod?: string;
}

/**
 * イベント参加エンドポイント
 * ユーザーがイベントに参加し、VC を発行します
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Parse Body
    let body: JoinRequestBody = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { ticketId, answers = [], intentId, paymentMethod } = body;

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
        questions: true
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
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
    const participationStatus = approvalRequired ? "PENDING" : "joined";

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
    if (isNewJoin && participationStatus === "joined") {
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
      // 参加チャットへの自動投稿
      try {
        await prisma.post.create({
          data: {
            content: "イベントに参加しました！",
            userId: user.id,
            communityId: (typedEvent as { communityId?: string }).communityId || undefined,
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
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
