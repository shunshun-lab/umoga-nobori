import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/communities/[id] (or slug)
// Note: Frontend might use slug, but let's support ID or handle slug in a separate route if needed.
// For simplicity, let's assume [id] can be ID or Slug, or just ID.
// Given the requirement "View more link to ... /communities/[slug]", we should probably support slug lookup.
// But Next.js dynamic routes usually map to params.id. Let's try to find by ID first, then Slug.

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const idOrSlug = params.id;
        console.log(`[API] Fetching community with idOrSlug: ${idOrSlug}`);

        // Manual fetch for robustness
        const community = await prisma.community.findFirst({
            where: {
                OR: [
                    { id: idOrSlug },
                    { slug: idOrSlug },
                ],
            },
            include: {
                _count: {
                    select: {
                        posts: true,
                        members: true,
                        organizedEvents: true
                    },
                },
                roles: true,
            },
        });

        if (!community) {
            return NextResponse.json({ error: "Community not found" }, { status: 404 });
        }

        // Manually fetch owner if exists (safe against orphaned ID)
        let owner = null;
        if (community.ownerOrganizerId) {
            owner = await prisma.user.findUnique({
                where: { id: community.ownerOrganizerId },
                select: { name: true, image: true }
            });
        }

        // 管理者かどうかで LINE 秘密情報の返却を制御
        let isAdmin = false;
        try {
            const session = await getServerSession(authOptions);
            if (session?.user?.id) {
                const member = await prisma.communityMember.findUnique({
                    where: { userId_communityId: { userId: (session.user as any).id, communityId: community.id } },
                    select: { role: true },
                });
                isAdmin = !!(member && ["ADMIN", "ORGANIZER", "OWNER"].includes(member.role.toUpperCase()))
                    || community.ownerOrganizerId === (session.user as any).id
                    || !!(session.user as any).isAdmin;
            }
        } catch { /* セッション取得失敗は無視（公開表示として返す） */ }

        if (isAdmin) {
            return NextResponse.json({ ...community, owner });
        }

        // 非管理者: LINE の秘密情報を除外
        const { lineChannelSecret, lineChannelToken, ...safeCommunity } = community as any;
        return NextResponse.json({
            ...safeCommunity,
            hasLineBot: !!(lineChannelToken && lineChannelSecret),
            owner
        });
    } catch (error) {
        console.error("Error fetching community:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}



// PATCH /api/communities/[id]
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
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

        const idOrSlug = params.id;
        const community = await prisma.community.findFirst({
            where: {
                OR: [
                    { id: idOrSlug },
                    { slug: idOrSlug },
                ],
            },
        });

        if (!community) {
            return NextResponse.json({ error: "Community not found" }, { status: 404 });
        }

        // Check permission (Owner or Admin or Community Admin/Organizer)
        let hasPermission = community.ownerOrganizerId === user.id || user.isAdmin;

        if (!hasPermission) {
            const member = await prisma.communityMember.findUnique({
                where: {
                    userId_communityId: {
                        userId: user.id,
                        communityId: community.id
                    }
                }
            });
            if (member && (member.role === "ADMIN" || member.role === "ORGANIZER")) {
                hasPermission = true;
            }
        }

        if (!hasPermission) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let body: any = {};
        try {
            const raw = await req.text();
            body = raw ? JSON.parse(raw) : {};
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        // Whitelist allowed fields to prevent arbitrary column updates or errors
        const allowedFields = [
            "name", "description", "slug", "imageUrl", "bannerUrl",
            "hpUrl", "twitterUrl", "instagramUrl", "discordUrl", "lineUrl", "lineOpenChatUrl",
            "lineChannelId", "lineChannelSecret", "lineChannelToken", "lineBotBasicId",
            "aiPrompt", "aiTheme", "constitution", "location",
            "isPublic", "pageConfig", "theme", "customHtml", "inviteRewardPoints"
        ];

        const updateData: any = {};
        for (const key of Object.keys(body)) {
            if (allowedFields.includes(key)) {
                let value = body[key];

                // Type conversion for specific fields
                if (key === "inviteRewardPoints") {
                    value = parseInt(value, 10) || 0;
                }
                if (key === "isPublic") {
                    value = value === true || value === "true";
                }

                updateData[key] = value;
            }
        }

        const updated = await prisma.community.update({
            where: { id: community.id },
            data: {
                ...updateData,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating community:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
