// src/app/api/ai/generate-thumbnail/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateThumbnail } from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";

const AI_THUMBNAIL_DAILY_LIMIT = 5;

/**
 * AIサムネイル生成エンドポイント
 */
export async function POST(req: NextRequest) {
  try {
    // セッション確認（認証ユーザーのみ使用可能）
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting check
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 401 });
    }

    const allowed = await checkRateLimit(userId, "ai_thumbnail", AI_THUMBNAIL_DAILY_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. You can generate ${AI_THUMBNAIL_DAILY_LIMIT} thumbnails per day.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { title, description, location } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // OpenAI APIキーが設定されているか確認
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 503 }
      );
    }

    // サムネイル生成
    const imageUrl = await generateThumbnail({
      title,
      description,
      location,
    });

    return NextResponse.json({
      imageUrl,
      success: true,
    });

  } catch (error) {
    console.error("Error in generate-thumbnail API:", error);

    // OpenAI APIエラーの詳細を返す
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to generate thumbnail",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
