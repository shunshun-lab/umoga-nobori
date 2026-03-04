
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueEventCredential } from "@/lib/kyosoVc";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { keyword } = body;

        if (!keyword) {
            return NextResponse.json({ error: "Keyword required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: session.user.id ? { id: session.user.id } : { email: session.user.email as string },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const event = await prisma.event.findUnique({
            where: { id: params.id },
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Validate Keyword
        if (event.keyword !== keyword) {
            return NextResponse.json({ error: "Invalid keyword" }, { status: 403 });
        }

        // Find Participant Record
        const participant = await prisma.participant.findFirst({
            where: {
                userId: user.id,
                eventId: params.id
            }
        });

        if (!participant) {
            return NextResponse.json({ error: "Not joined" }, { status: 400 });
        }

        if (participant.status === 'attended') {
            return NextResponse.json({ error: "Already checked in" }, { status: 400 });
        }

        // Update status
        await prisma.participant.update({
            where: { id: participant.id },
            data: { status: 'attended' }
        });

        // Issue VC
        let credential = null;
        try {
            // Check for existing credential first
            const existingCred = await prisma.eventCredential.findFirst({
                where: {
                    userId: user.id,
                    eventId: event.id
                }
            });

            if (existingCred) {
                credential = existingCred;
            } else {
                // Only issue if not exists
                const job = await issueEventCredential(user, event);

                credential = await prisma.eventCredential.create({
                    data: {
                        userId: user.id,
                        eventId: event.id,
                        vcJobId: job.jobId,
                        vcRecordId: "",
                        status: "ISSUING",
                    }
                });
            }

        } catch (e) {
            console.error("VC Issue failed", e);
        }

        return NextResponse.json({ success: true, credential });

    } catch (error) {
        console.error("Checkin error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
