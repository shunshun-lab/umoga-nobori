import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * ポイント交換処理
 */
export async function POST(req: NextRequest) {
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

        const body = await req.json();
        const { itemId } = body;

        if (!itemId) {
            return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
        }

        const item = await prisma.item.findUnique({
            where: { id: itemId },
        });

        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        if (item.stock <= 0) {
            return NextResponse.json({ error: "Out of stock" }, { status: 400 });
        }

        if (user.points < item.points) {
            return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
        }

        // トランザクションでポイント消費、在庫減少、履歴記録を実行
        const result = await prisma.$transaction(async (tx: typeof prisma) => {
            // 1. ポイント消費
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: { points: { decrement: item.points } },
            });

            // 2. 在庫減少
            const updatedItem = await tx.item.update({
                where: { id: item.id },
                data: { stock: { decrement: 1 } },
            });

            // 3. 履歴記録
            await tx.pointTransaction.create({
                data: {
                    userId: user.id,
                    amount: -item.points,
                    description: `アイテム交換: ${item.name}`,
                    communityId: user.personalCommunityId || "fallback-system",
                    createdByUserId: user.id,
                },
            });

            return { updatedUser, updatedItem };
        });

        return NextResponse.json({
            message: "Redemption successful",
            remainingPoints: result.updatedUser.points,
            item: result.updatedItem,
        });
    } catch (error) {
        console.error("Error redeeming points:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
