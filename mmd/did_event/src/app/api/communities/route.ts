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
            shopMode: (c as any).shopMode || 'internal',
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
        const {
            name,
            description,
            selectedActivityIds,
            orderedActivities,
            permissionTemplateId,
            slug,
            scope,
            imageUrl,
            hpUrl,
            useAiGeneration,
            aiPrompt,
        } = body;

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
                    imageUrl: imageUrl || null,
                    hpUrl: hpUrl || null,
                    aiPrompt: typeof aiPrompt === "string" ? aiPrompt : null,
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

        if (useAiGeneration) {
            try {
                const { generateCommunityHp } = await import("@/lib/ai");
                const theme =
                    typeof aiPrompt === "string" && /cyberpunk|neon/i.test(aiPrompt)
                        ? "futuristic"
                        : "default";
                const customHtml = await generateCommunityHp(
                    newCommunity.name,
                    newCommunity.description || "",
                    typeof aiPrompt === "string" && aiPrompt.trim().length > 0
                        ? aiPrompt
                        : "Create a modern, stunning homepage.",
                    theme
                );
                const updated = await prisma.community.update({
                    where: { id: newCommunity.id },
                    data: {
                        customHtml,
                        aiPrompt: typeof aiPrompt === "string" ? aiPrompt : null,
                        aiTheme: theme,
                    },
                });
                return NextResponse.json(updated);
            } catch (e) {
                console.error("[POST /api/communities] AI homepage generation failed:", e);
            }
        }

        return NextResponse.json(newCommunity);

    } catch (error) {
        console.error("Error creating community:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
