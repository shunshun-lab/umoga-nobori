import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRoleTemplate } from "@/lib/community-role-templates";

export async function GET() {
    try {
        const dbCommunities = await prisma.community.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });

        const communities = dbCommunities.map((c: { id: string; name: string; description: string | null; imageUrl: string | null; slug: string | null; scope: string; hpUrl: string | null; _count: { members: number }; createdAt: Date; twitterUrl: string | null; instagramUrl: string | null; discordUrl: string | null; lineUrl: string | null } & Record<string, unknown>) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            imageUrl: c.imageUrl,
            slug: c.slug,
            scope: c.scope,
            hpUrl: c.hpUrl,
            memberCount: c._count.members,
            createdAt: c.createdAt.toISOString(),
            // Map other fields if necessary to match getAllCommunities return type
            twitterUrl: c.twitterUrl,
            instagramUrl: c.instagramUrl,
            discordUrl: c.discordUrl,
            lineUrl: c.lineUrl,
            lineOpenChatUrl: (c as any).lineOpenChatUrl,
            bannerUrl: (c as any).bannerUrl,
        }));

        return NextResponse.json(communities);
    } catch (error) {
        console.error("Error fetching communities:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, selectedActivityIds, orderedActivities, permissionTemplateId, slug, scope } = body;

        if (!name) {
            return NextResponse.json({ error: "Community Name is required" }, { status: 400 });
        }



        const template = getRoleTemplate(permissionTemplateId);

        const newCommunity = await prisma.$transaction(async (tx: typeof prisma) => {
            const created = await tx.community.create({
                data: {
                    name,
                    description: description || "",
                    ownerOrganizerId: session.user.id, // Set the creator as owner
                    slug: slug || `comm-${Date.now()}`,
                    scope: scope || "PUBLIC",
                    members: {
                        create: {
                            userId: session.user.id,
                            role: "ORGANIZER" // Change from ADMIN to ORGANIZER (Highest role)
                        }
                    }
                }
            });

            await tx.communityRole.createMany({
                data: template.roles.map(role => ({
                    ...role,
                    communityId: created.id
                })),
                skipDuplicates: true
            });

            return created;
        });

        return NextResponse.json(newCommunity);

    } catch (error) {
        console.error("Error creating community:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
