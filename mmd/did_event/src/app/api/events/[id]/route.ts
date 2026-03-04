// src/app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasCommunityPermission } from "@/lib/community-auth";

/**
 * イベント詳細取得
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        organizerCommunity: {
          select: {
            id: true,
            name: true,
            hpUrl: true,
            imageUrl: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
        tickets: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

/**
 * イベント更新
 */
export async function PATCH(
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

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { organizerCommunity: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isPlatformAdmin = (session.user as any).isAdmin;
    const canEdit = isPlatformAdmin || (event.organizerCommunityId
      ? await hasCommunityPermission(user.id, event.organizerCommunityId, "MANAGE_EVENTS")
      : event.ownerId === user.id);

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Whitelist allowed fields to prevent "Unknown argument" errors from relations or extra props
    const {
      title, description, imageUrl, location, format, onlineUrl, website,
      capacity, isPublic, status, category, tags, keyword,
      projectId, theme, concept, target, needs,
      venueTitle, venueLat, venueLng, venueAddress, googleMapsUrl,
      acceptedPaymentMethods, bankDetails,
      tickets, // Add tickets to destructured body
      generateMeet // New field
    } = body;

    let finalOnlineUrl = onlineUrl;

    // Google Meet automatic generation
    if (generateMeet && (format === "online" || format === "hybrid")) {
      try {
        const { createGoogleMeetEvent, createGoogleMeetEventWithToken } = await import("@/lib/google-calendar");

        // Get user's Google account for token
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: "google"
          }
        });

        let meetResult: string | null = null;
        if (account?.access_token) {
          meetResult = await createGoogleMeetEventWithToken(
            account.access_token,
            title || event.title,
            description || event.description || "",
            body.startAt ? new Date(body.startAt) : event.startAt,
            body.endAt ? new Date(body.endAt) : event.endAt || new Date(new Date(body.startAt || event.startAt).getTime() + 60 * 60 * 1000)
          );
        }

        // Fallback to service account if token fails or doesn't exist
        if (!meetResult) {
          meetResult = await createGoogleMeetEvent(
            title || event.title,
            description || event.description || "",
            body.startAt ? new Date(body.startAt) : event.startAt,
            body.endAt ? new Date(body.endAt) : event.endAt || new Date(new Date(body.startAt || event.startAt).getTime() + 60 * 60 * 1000)
          );
        }

        if (meetResult) {
          finalOnlineUrl = meetResult;
        }
      } catch (meetErr) {
        console.error("Failed to generate Meet for update:", meetErr);
      }
    }

    const updateData: any = {
      title, description, imageUrl, location, format, onlineUrl: finalOnlineUrl, website,
      capacity: capacity ? Number(capacity) : null,
      isPublic, status, category, tags, keyword,
      projectId: projectId || null,
      theme, concept, target, needs: needs ? (typeof needs === 'string' ? needs : JSON.stringify(needs)) : undefined,
      venueTitle, venueLat, venueLng, venueAddress, googleMapsUrl,
      acceptedPaymentMethods, bankDetails
    };

    // Date handling
    if (body.startAt) updateData.startAt = new Date(body.startAt);
    if (body.endAt !== undefined) updateData.endAt = body.endAt ? new Date(body.endAt) : null;
    if (body.registrationDeadline !== undefined) updateData.registrationDeadline = body.registrationDeadline ? new Date(body.registrationDeadline) : null;
    if (body.paymentDeadline !== undefined) updateData.paymentDeadline = body.paymentDeadline ? new Date(body.paymentDeadline) : null;

    // Filter out undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Transaction for atomic update
    const updatedEvent = await prisma.$transaction(async (tx: typeof prisma) => {
      // 1. Update basic event data
      const event = await tx.event.update({
        where: { id: params.id },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // 2. Handle Tickets
      if (tickets && Array.isArray(tickets)) {
        // Get existing tickets
        const existingTickets = await tx.eventTicket.findMany({
          where: { eventId: params.id },
          select: { id: true, participants: { select: { id: true } } } // Check for participants
        });

        const existingIds = existingTickets.map(t => t.id);
        const incomingIds = tickets.map((t: any) => t.id).filter(id => id);

        // Identify tickets to delete
        const ticketsToDelete = existingTickets.filter(t => !incomingIds.includes(t.id));

        // Delete tickets (only if no participants)
        for (const ticket of ticketsToDelete) {
          if (ticket.participants.length > 0) {
            console.warn(`Skipping deletion of ticket ${ticket.id} because it has participants.`);
            continue;
          }
          await tx.eventTicket.delete({ where: { id: ticket.id } });
        }

        // Upsert tickets
        for (const ticket of tickets) {
          if (ticket.id) {
            // Update existing
            await tx.eventTicket.update({
              where: { id: ticket.id },
              data: {
                name: ticket.name,
                price: Number(ticket.price),
                limit: ticket.limit ? Number(ticket.limit) : null,
                description: ticket.description
              }
            });
          } else {
            // Create new
            await tx.eventTicket.create({
              data: {
                eventId: params.id,
                name: ticket.name,
                price: Number(ticket.price),
                limit: ticket.limit ? Number(ticket.limit) : null,
                description: ticket.description
              }
            });
          }
        }
      }

      return event;
    });

    // Sync to Google Sheets
    try {
      const { updateEvent } = await import("@/lib/sheets");
      await updateEvent(updatedEvent.id, {
        ...updatedEvent,
        startAt: updatedEvent.startAt.toISOString(),
        endAt: updatedEvent.endAt ? updatedEvent.endAt.toISOString() : null,
      });
    } catch (e) {
      console.error("Failed to sync updated event to sheets:", e);
    }

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: `Failed to update event: ${error.message || error}` },
      { status: 500 }
    );
  }
}

/**
 * イベント削除
 */
export async function DELETE(
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

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isPlatformAdmin = (session.user as any).isAdmin;
    const canDelete = isPlatformAdmin || (event.organizerCommunityId
      ? await hasCommunityPermission(user.id, event.organizerCommunityId, "MANAGE_EVENTS")
      : event.ownerId === user.id);

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
