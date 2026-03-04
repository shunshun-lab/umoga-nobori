import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPointsByUserId } from "@/lib/sheets";

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

        // Real DB Mode (Prisma)
        const user = await prisma.user.findUnique({
            where: session.user.id ? { id: session.user.id } : { email: session.user.email as string },
            include: {
                pointTransactions: {
                    orderBy: { createdAt: "desc" },
                    take: 20,
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const items = await prisma.item.findMany({
            orderBy: { points: "asc" },
            where: { stock: { gt: 0 } },
        });

        return NextResponse.json({
            points: user.points,
            transactions: user.pointTransactions,
            items,
        });
    } catch (error) {
        console.error("Error fetching points data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
