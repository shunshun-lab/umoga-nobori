import { streamText, UIMessage, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getChapterContext, getGeneralContext } from "@/lib/chat-context";
import { searchChunks } from "@/lib/rag";

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    chapter,
  }: { messages: UIMessage[]; chapter: number | null } = await req.json();

  // Extract the latest user message for RAG query
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const query =
    lastUserMsg?.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(" ") ?? "";

  // Chapter selected → full chapter context; otherwise → RAG search
  let context: string;
  if (chapter) {
    context = getChapterContext(chapter);
  } else if (query) {
    const hits = searchChunks(query, 5);
    if (hits.length > 0) {
      context = hits
        .map((c) => `[${c.source} / ${c.section}]\n${c.text}`)
        .join("\n\n---\n\n");
    } else {
      context = getGeneralContext();
    }
  } else {
    context = getGeneralContext();
  }

  const systemPrompt = `あなたは "Computational Science and Engineering"（Gilbert Strang）の学習コーチです。
以下の参考資料に基づいて質問に回答してください。

## ルール
- 必ず日本語で答える
- 結論→理由→具体例の順（PREP形式）
- 数式は LaTeX で書くこと（インライン: $...$、ディスプレイ: $$...$$）
- 参考資料にない内容は推測せず、「この章のノートには記載がありません」と伝える
- 回答は簡潔に、しかし数学的に正確に
- 最後に「逆輸入の問い」を1つ追加する（学習を深めるための問いかけ）

## 関連ノート
${context}`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
