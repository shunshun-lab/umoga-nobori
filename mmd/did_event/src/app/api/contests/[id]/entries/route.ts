import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/contests/[id]/entries
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        let userId: string | undefined;

        if (session?.user?.email) {
            const user = await prisma.user.findUnique({ where: session.user.id ? { id: session.user.id } : { email: session.user.email as string } });
            userId = user?.id;
        }

        const entries = await prisma.contestEntry.findMany({
            where: {
                contestId: params.id,
                status: "PUBLISHED",
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                _count: {
                    select: { votes: true },
                },
                // Check if current user voted
                votes: userId ? {
                    where: { userId: userId },
                    select: { id: true }
                } : false
            },
        });

        // Transform to include isVoted flag
        const entriesWithVoteStatus = entries.map((entry: { votes?: unknown[]; [k: string]: unknown }) => ({
            ...entry,
            isVoted: entry.votes && entry.votes.length > 0,
            votes: undefined // Remove raw votes array
        }));

        return NextResponse.json(entriesWithVoteStatus);
    } catch (error) {
        console.error("Error fetching entries:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/contests/[id]/entries
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const contest = await prisma.contest.findUnique({
            where: { id: params.id },
        });

        if (!contest) {
            return NextResponse.json({ error: "Contest not found" }, { status: 404 });
        }

        if (contest.status !== "OPEN") {
            return NextResponse.json({ error: "Contest is not open" }, { status: 400 });
        }

        const body = await req.json();
        const { title, content, imageUrl } = body;

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const entry = await prisma.contestEntry.create({
            data: {
                contestId: contest.id,
                userId: user.id,
                title,
                content,
                imageUrl,
                status: "PUBLISHED",
            },
        });

        return NextResponse.json(entry);
    } catch (error) {
        console.error("Error creating entry:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
