import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/contests/[id]
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        console.log(`[API] Fetching contest with id: ${params.id}`);
        const contest = await prisma.contest.findUnique({
            where: { id: params.id },
            include: {
                owner: {
                    select: { name: true, image: true },
                },
                _count: {
                    select: { entries: true },
                },
            },
        });

        if (!contest) {
            return NextResponse.json({ error: "Contest not found" }, { status: 404 });
        }

        return NextResponse.json(contest);
    } catch (error) {
        console.error("Error fetching contest:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/contests/[id]
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
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

        // Check permission
        if (contest.ownerOrganizerId !== user.id && !user.isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, imageUrl, status, startAt, endAt } = body;

        const updated = await prisma.contest.update({
            where: { id: contest.id },
            data: {
                title,
                description,
                imageUrl,
                status,
                startAt: startAt ? new Date(startAt) : undefined,
                endAt: endAt ? new Date(endAt) : undefined,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating contest:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
