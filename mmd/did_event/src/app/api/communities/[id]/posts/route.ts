import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/communities/[id]/posts
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const idOrSlug = params.id;

        // Resolve Community ID
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

        const session = await getServerSession(authOptions);
        const currentUser = session?.user?.email
            ? await prisma.user.findUnique({ where: session.user.id ? { id: session.user.id } : { email: session.user.email as string } })
            : null;

        const posts = await prisma.post.findMany({
            where: {
                communityId: community.id,
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
                    select: {
                        comments: true,
                        favorites: true,
                    },
                },
                favorites: currentUser ? {
                    where: { userId: currentUser.id },
                    select: { id: true },
                } : false,
                comments: {
                    take: 3, // Preview latest 3 comments
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: {
                            select: { name: true, image: true },
                        },
                    },
                },
            },
        });

        // Map posts to include isLiked
        const postsWithLikeInfo = posts.map((post: { favorites?: unknown[]; _count: { favorites: number }; [k: string]: unknown }) => ({
            ...post,
            isLiked: (post.favorites?.length ?? 0) > 0,
            likeCount: post._count.favorites,
            favorites: undefined, // Remove favorites array to keep payload small
        }));

        return NextResponse.json(postsWithLikeInfo);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/communities/[id]/posts
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

        const body = await req.json();
        const { content, imageUrl } = body;

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                communityId: community.id,
                userId: user.id,
                content,
                imageUrl,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
