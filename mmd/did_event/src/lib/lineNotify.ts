// src/lib/lineNotify.ts
import { Client } from "@line/bot-sdk";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";

if (!channelAccessToken) {
  console.warn("LINE_CHANNEL_ACCESS_TOKEN is not set. LINE notifications will not work.");
}

const client = new Client({
  channelAccessToken: channelAccessToken || "dummy_token",
});

/**
 * LINE ユーザーに通知を送信
 * @param lineUserId LINE のユーザーID
 * @param message 送信するメッセージ
 */
export async function sendLineNotification(
  lineUserId: string,
  message: string
): Promise<void> {
  if (!channelAccessToken) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  }

  await client.pushMessage(lineUserId, {
    type: "text",
    text: message,
  });
}

/**
 * 複数のユーザーに通知を送信
 * @param lineUserIds LINE のユーザーID配列
 * @param message 送信するメッセージ
 */
export async function sendLineNotificationToMultiple(
  lineUserIds: string[],
  message: string
): Promise<void> {
  if (!channelAccessToken) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  }

  // LINE の制限により、一度に500人まで
  const chunks: string[][] = [];
  for (let i = 0; i < lineUserIds.length; i += 500) {
    chunks.push(lineUserIds.slice(i, i + 500));
  }

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map((lineUserId) =>
        client.pushMessage(lineUserId, {
          type: "text",
          text: message,
        })
      )
    );
  }
}

/**
 * イベント通知用のメッセージを生成
 */
export function formatEventNotificationMessage(
  eventTitle: string,
  customMessage: string
): string {
  return `【${eventTitle}】からのお知らせ\n\n${customMessage}`;
}
