
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueEventCredential } from "@/lib/kyosoVc";
import { createPointTransaction } from "@/lib/ledger";
import { recordCheckedIn, recordLedgerEarned, recordCredentialIssued } from "@/lib/member-facts";

// --- Rate limiter for checkin API ---
const checkinRateMap = new Map<string, { count: number; resetAt: number }>();
const CHECKIN_RATE_MAX = 10;       // 1分間に最大10回
const CHECKIN_RATE_WINDOW = 60_000;

function checkCheckinRate(userId: string, eventId: string): boolean {
    const key = `checkin:${userId}:${eventId}`;
    const now = Date.now();
    const entry = checkinRateMap.get(key);
    if (!entry || now > entry.resetAt) {
        checkinRateMap.set(key, { count: 1, resetAt: now + CHECKIN_RATE_WINDOW });
        return true;
    }
    if (entry.count >= CHECKIN_RATE_MAX) return false;
    entry.count++;
    return true;
}

/**
 * チェックインAPI — 3つの方式に対応
 *
 * 1. キーワード方式（ユーザー自身）: { keyword: "合言葉" }
 *    - 参加者がイベントのキーワードを入力してチェックイン
 *
 * 2. 管理者チェックイン方式: { participantId: "xxx" }
 *    - 管理者がQRスキャンまたはボタンで参加者をチェックイン
 *    - イベントオーナーまたはAdmin権限が必要
 *
 * 3. 署名付きトークン方式: { token: { uid, eid, ts, sig } }
 *    - HMAC署名 + 5分有効期限のワンタイム的QRコード
 *    - 管理者がスキャン → トークン検証 → チェックイン
 */
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { keyword, participantId, token } = body;

        if (!keyword && !participantId && !token) {
            return NextResponse.json({ error: "keyword, participantId, or token required" }, { status: 400 });
        }

        // Rate limit
        const callerId = session.user.id || session.user.email || "unknown";
        if (!checkCheckinRate(callerId, params.id)) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const callerUser = await prisma.user.findUnique({
            where: session.user.id ? { id: session.user.id } : { email: session.user.email as string },
        });

        if (!callerUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const event = await prisma.event.findUnique({
            where: { id: params.id },
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        let participant;
        let targetUserId: string;

        if (token) {
            // --- 署名付きトークン方式 ---
            // 管理者がスキャンした署名付きQRトークンを検証
            if (event.ownerId !== callerUser.id && !callerUser.isAdmin) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            const { verifyCheckinToken, parseQRData } = await import("@/lib/checkin-token");
            const parsed = typeof token === "string" ? parseQRData(token) : token;
            if (!parsed) {
                return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
            }

            const verification = verifyCheckinToken(parsed);
            if (!verification.valid) {
                return NextResponse.json({ error: verification.error }, { status: 403 });
            }

            // Verify token eventId matches URL eventId
            if (verification.eventId !== params.id) {
                return NextResponse.json({ error: "Token event mismatch" }, { status: 403 });
            }

            participant = await prisma.participant.findFirst({
                where: { userId: verification.userId, eventId: params.id },
            });

            if (!participant) {
                return NextResponse.json({ error: "Participant not found" }, { status: 404 });
            }

            targetUserId = verification.userId;
        } else if (participantId) {
            // --- 管理者チェックイン方式 ---
            // 権限チェック: イベントオーナーまたはAdmin
            if (event.ownerId !== callerUser.id && !callerUser.isAdmin) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            participant = await prisma.participant.findUnique({
                where: { id: participantId },
            });

            if (!participant || participant.eventId !== params.id) {
                return NextResponse.json({ error: "Participant not found" }, { status: 404 });
            }

            targetUserId = participant.userId;
        } else {
            // --- キーワード方式（ユーザー自身） ---
            if (event.keyword !== keyword) {
                return NextResponse.json({ error: "Invalid keyword" }, { status: 403 });
            }

            participant = await prisma.participant.findFirst({
                where: {
                    userId: callerUser.id,
                    eventId: params.id
                }
            });

            if (!participant) {
                return NextResponse.json({ error: "Not joined" }, { status: 400 });
            }

            targetUserId = callerUser.id;
        }

        if (participant.status === 'ATTENDED' || participant.status === 'COMPLETED') {
            return NextResponse.json({ error: "Already checked in" }, { status: 400 });
        }

        // Update status to attended
        await prisma.participant.update({
            where: { id: participant.id },
            data: { status: 'ATTENDED' }
        });

        // Record CHECKED_IN fact
        const checkinCommunityId = event.organizerCommunityId || event.communityId;
        if (checkinCommunityId) {
            await recordCheckedIn({
                communityId: checkinCommunityId,
                userId: targetUserId,
                eventId: params.id,
                participantId: participant.id,
            });
        }

        // --- ポイント自動付与（JOIN報酬がまだ付与されていなければ） ---
        let pointsAwarded = 0;
        try {
            const joinReward = await prisma.eventPointReward.findUnique({
                where: { eventId_type: { eventId: params.id, type: "JOIN" } }
            });
            if (joinReward?.isActive && Number(joinReward.amount) > 0) {
                const alreadyGranted = await prisma.eventPointRewardGrant.findUnique({
                    where: { rewardId_userId: { rewardId: joinReward.id, userId: targetUserId } }
                });
                if (!alreadyGranted) {
                    await prisma.$transaction(async (tx: typeof prisma) => {
                        await tx.eventPointRewardGrant.create({
                            data: {
                                rewardId: joinReward.id,
                                userId: targetUserId,
                                participantId: participant.id,
                                referenceId: `event:${params.id}:reward:JOIN:participant:${participant.id}`,
                            }
                        });
                        const communityId = event.organizerCommunityId || event.communityId;
                        if (communityId) {
                            await createPointTransaction({
                                userId: targetUserId,
                                communityId,
                                amount: Number(joinReward.amount),
                                type: "EARN",
                                description: `イベント参加報酬: ${event.title}`,
                            });
                        }
                    });
                    pointsAwarded = Number(joinReward.amount);
                    if (checkinCommunityId) {
                        await recordLedgerEarned({
                            communityId: checkinCommunityId,
                            userId: targetUserId,
                            amount: pointsAwarded,
                            description: `イベント参加報酬: ${event.title}`,
                            eventId: params.id,
                            rewardType: "JOIN",
                        });
                    }
                }
            }
        } catch (ptErr) {
            console.error("[Checkin] Failed to grant join reward:", ptErr);
        }

        // --- VC発行 ---
        let credential: any = null;
        try {
            const existingCred = await prisma.eventCredential.findFirst({
                where: {
                    userId: targetUserId,
                    eventId: event.id
                }
            });

            if (existingCred) {
                credential = existingCred;
            } else {
                const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
                if (targetUser) {
                    const job = await issueEventCredential(targetUser, event);
                    credential = await prisma.eventCredential.create({
                        data: {
                            userId: targetUserId,
                            eventId: event.id,
                            vcJobId: job.jobId,
                            vcRecordId: "",
                            status: "ISSUING",
                        }
                    });
                }
            }
            if (credential && checkinCommunityId && (credential as any).id) {
                await recordCredentialIssued({
                    communityId: checkinCommunityId,
                    userId: targetUserId,
                    eventId: event.id,
                    credentialId: (credential as any).id,
                });
            }
        } catch (e) {
            console.error("VC Issue failed", e);
        }

        // --- ファンランク自動評価 ---
        if (checkinCommunityId) {
            try {
                const { evaluateFanRank } = await import("@/lib/fan-rank");
                const rankResult = await evaluateFanRank(targetUserId, checkinCommunityId);
                if (rankResult.granted.length > 0) {
                    console.log(`[Checkin] Fan rank granted: ${rankResult.granted.join(", ")} for user ${targetUserId}`);
                }
            } catch (e) {
                console.error("[Checkin] Fan rank evaluation failed:", e);
            }
        }

        return NextResponse.json({ success: true, credential, pointsAwarded });

    } catch (error) {
        console.error("Checkin error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
