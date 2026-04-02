import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/contests/[id]/vote
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
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

        const contest = await prisma.contest.findUnique({
            where: { id: params.id },
        });

        if (!contest) {
            return NextResponse.json({ error: "Contest not found" }, { status: 404 });
        }

        if (contest.status !== "OPEN") {
            return NextResponse.json({ error: "Contest is not open for voting" }, { status: 400 });
        }

        const body = await req.json();
        const { entryId } = body;

        if (!entryId) {
            return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
        }

        // Check if entry belongs to contest
        const entry = await prisma.contestEntry.findUnique({
            where: { id: entryId },
        });

        if (!entry || entry.contestId !== contest.id) {
            return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
        }

        // Check if already voted for this entry
        // Note: Schema has @@unique([entryId, userId]), so create will fail if duplicate.
        // But we might want to check if user already voted for ANY entry in this contest if the rule was "1 vote per contest".
        // Current rule: "1 vote per entry per user". So user can vote for multiple entries.

        try {
            const vote = await prisma.contestVote.create({
                data: {
                    entryId,
                    userId: user.id,
                },
            });
            return NextResponse.json(vote);
        } catch (e: any) {
            if (e.code === 'P2002') {
                return NextResponse.json({ error: "Already voted for this entry" }, { status: 400 });
            }
            throw e;
        }

    } catch (error) {
        console.error("Error voting:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
