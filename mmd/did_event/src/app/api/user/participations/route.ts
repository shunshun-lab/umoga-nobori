import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const participations = await prisma.participant.findMany({
            where: {
                userId: user.id,
                status: { notIn: ["REJECTED", "CANCELLED"] },
            },
            include: {
                event: true,
            },
            orderBy: {
                event: {
                    startAt: "asc",
                },
            },
        });

        const events = participations.map((p) => p.event);

        return NextResponse.json(events);
    } catch (error) {
        console.error("Error fetching participations:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
