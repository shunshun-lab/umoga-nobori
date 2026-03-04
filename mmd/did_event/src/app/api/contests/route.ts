import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/contests
export async function GET(req: NextRequest) {
    try {
        // 簡易的に、公開されている（OPEN/CLOSED）コンテストを返す
        // DRAFTは返さない（Admin用APIが必要なら別途）

        const contests = await prisma.contest.findMany({
            where: {
                status: { in: ["OPEN", "CLOSED"] },
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: { entries: true },
                },
            },
        });

        return NextResponse.json(contests);
    } catch (error) {
        console.error("Error fetching contests:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/contests
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
        const { title, description, imageUrl, scope, startAt, endAt, eventId } = body;

        if (!title || !startAt || !endAt) {
            return NextResponse.json(
                { error: "Title, StartAt, and EndAt are required" },
                { status: 400 }
            );
        }

        const contest = await prisma.contest.create({
            data: {
                title,
                description,
                imageUrl,
                scope: scope || "ORGANIZER",
                isOfficial: user.isAdmin && scope === "OFFICIAL",
                ownerOrganizerId: user.id,
                eventId: eventId || null,
                startAt: new Date(startAt),
                endAt: new Date(endAt),
                status: "DRAFT", // Default to DRAFT
            },
        });

        return NextResponse.json(contest);
    } catch (error) {
        console.error("Error creating contest:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
