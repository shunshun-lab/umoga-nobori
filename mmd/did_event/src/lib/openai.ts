// src/lib/openai.ts
import OpenAI from "openai";

// 優先的に AI Gateway のキーを使用し、なければ従来の OpenAI API Key を使用
const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY;
// AI Gateway のベースURL（OpenAI互換API）
const baseURL = process.env.AI_GATEWAY_BASE_URL || "https://gateway.ai.vercel.com/v1";

if (!apiKey) {
  console.warn("AI_GATEWAY_API_KEY or OPENAI_API_KEY is not set. AI features might not work.");
}

export const openai = new OpenAI({
  apiKey: apiKey || "dummy-key",
  baseURL: process.env.AI_GATEWAY_API_KEY ? baseURL : undefined,
});

/**
 * イベント情報からサムネイル生成用のプロンプトを作成
 */
export function createThumbnailPrompt(eventInfo: {
  title: string;
  description?: string;
  location?: string;
}): string {
  const { title, description, location } = eventInfo;

  let prompt = `Create a professional event thumbnail image for "${title}".`;

  if (description) {
    prompt += ` The event is about: ${description.slice(0, 200)}.`;
  }

  if (location) {
    prompt += ` It will be held at ${location}.`;
  }

  prompt += ` Style: Modern, vibrant, professional event poster. Include abstract elements related to the event theme. No text or words in the image. 16:9 aspect ratio.`;

  return prompt;
}

/**
 * DALL-E 3を使用してサムネイル画像を生成
 */
export async function generateThumbnail(eventInfo: {
  title: string;
  description?: string;
  location?: string;
}): Promise<string> {
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  const prompt = createThumbnailPrompt(eventInfo);

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024", // 16:9に近い比率
      quality: "standard",
      style: "vivid",
    });

    const temporaryUrl = response.data?.[0]?.url;

    if (!temporaryUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    // Persist to Cloudinary so the image does not expire (OpenAI URLs are temporary).
    const { isCloudinaryConfigured, uploadFromUrl } = await import("@/lib/cloudinary");
    if (isCloudinaryConfigured()) {
      const permanentUrl = await uploadFromUrl(temporaryUrl, "did-event-uploads");
      if (permanentUrl) return permanentUrl;
    }
    return temporaryUrl;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw error;
  }
}
