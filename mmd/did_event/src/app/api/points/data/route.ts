import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPointsByUserId } from "@/lib/sheets";
import { getUserBalance } from "@/lib/point-system";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Handle Mock DB Mode (Sheets)
        if (process.env.MOCK_DB === "true") {
            const userId = session.user.id;
            const transactions = await getPointsByUserId(userId);

            // Calculate balance
            const points = transactions.reduce((acc: number, tx: any) => {
                if (tx.type === "DEPOSIT" || tx.type === "EARN") {
                    return acc + tx.amount;
                } else if (tx.type === "SPEND") {
                    return acc - tx.amount;
                }
                return acc;
            }, 0);

            // Fetch Items (Mock)
            // items also need to come from sheets if consistent, or just use prisma for now if items are static
            // For consistency let's use prisma for items or static list as `sheets.ts` has `getProducts`?
            // The original code used prisma.item, let's keep it or better, use sheets products?
            // sheets.ts has `getProductsByCommunityId` but no `getAllProducts`.
            // Let's assume Items are still in Prisma or we return empty/mock items.
            const items = await prisma.item.findMany({
                orderBy: { points: "asc" },
                where: { stock: { gt: 0 } },
            }).catch(() => []); // Fallback if prisma fails in mock mode

            return NextResponse.json({
                points,
                transactions: transactions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), // sort desc
                items
            });
        }

        // Real DB Mode (Prisma) — 並列化で高速化
        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get("cursor");
        const take = 50;
        const userId = session.user.id || "";
        const userWhere = session.user.id ? { id: session.user.id } : { email: session.user.email as string };

        // User+Transactions と Items を並列取得
        const [user, items] = await Promise.all([
            prisma.user.findUnique({
                where: userWhere,
                include: {
                    pointTransactions: {
                        orderBy: { createdAt: "desc" },
                        take: take + 1,
                        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
                        include: {
                            community: { select: { name: true } },
                        },
                    },
                },
            }),
            prisma.item.findMany({
                orderBy: { points: "asc" },
                where: { stock: { gt: 0 } },
            }),
        ]);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const balance = await getUserBalance(user.id);

        const hasMore = user.pointTransactions.length > take;
        const rawTransactions = hasMore ? user.pointTransactions.slice(0, take) : user.pointTransactions;
        const nextCursor = hasMore ? rawTransactions[rawTransactions.length - 1].id : null;

        // createdByUser を一括取得（N+1防止）
        const createdByUserIds = [...new Set(rawTransactions.map((tx) => tx.createdByUserId).filter((id): id is string => id != null))];
        const createdByUsers = createdByUserIds.length > 0
            ? await prisma.user.findMany({ where: { id: { in: createdByUserIds } }, select: { id: true, name: true, image: true } })
            : [];
        const createdByUserMap = new Map(createdByUsers.map((u) => [u.id, { name: u.name, image: u.image }]));

        const transactions = rawTransactions.map((tx) => ({
            ...tx,
            createdByUser: tx.createdByUserId ? (createdByUserMap.get(tx.createdByUserId) ?? null) : null,
        }));

        return NextResponse.json({
            points: balance,
            transactions,
            items,
            nextCursor,
        });
    } catch (error) {
        console.error("Error fetching points data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
