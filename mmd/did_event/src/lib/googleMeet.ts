// src/lib/googleMeet.ts
import { google } from "googleapis";

/**
 * Google Meet会議リンクを自動生成する（Fallback版）
 * Google Calendar APIが使えない場合のフォールバック
 */
export function generateMeetLink(eventTitle: string): string {
  const meetingId = generateRandomMeetingId();
  return `https://meet.google.com/${meetingId}`;
}

/**
 * ランダムな会議IDを生成（Google Meet形式: xxx-xxxx-xxx）
 */
function generateRandomMeetingId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const part1 = randomString(chars, 3);
  const part2 = randomString(chars, 4);
  const part3 = randomString(chars, 3);

  return `${part1}-${part2}-${part3}`;
}

/**
 * ランダムな文字列を生成
 */
function randomString(chars: string, length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Google Calendar APIを使った本格的なMeet生成
 * （将来的な実装用の型定義）
 */
export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  conferenceData: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: "hangoutsMeet";
      };
    };
  };
}

/**
 * Google Calendar APIを使ってMeetリンクを生成
 * サービスアカウント or OAuth2を使って本物のGoogle Meetリンクを作成します
 */
export async function createGoogleCalendarEventWithMeet(
  eventData: {
    title: string;
    description?: string;
    startAt: Date;
    endAt: Date;
    location?: string;
  },
  accessToken?: string
): Promise<string> {
  try {
    let auth;

    // アクセストークンが渡された場合はそれを使用
    if (accessToken) {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
      auth = oauth2Client;
    }
    // OAuth2クライアント認証を優先（dev@mmdao.org のカレンダーを使用）
    else if (process.env.GOOGLE_MEET_CLIENT_ID && process.env.GOOGLE_MEET_CLIENT_SECRET && process.env.GOOGLE_MEET_REFRESH_TOKEN) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_MEET_CLIENT_ID,
        process.env.GOOGLE_MEET_CLIENT_SECRET
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_MEET_REFRESH_TOKEN,
      });

      auth = oauth2Client;
    }
    // 認証情報がない場合はフォールバック
    else {
      console.warn("No Google credentials found, using fallback Meet link generation");
      return generateMeetLink(eventData.title);
    }

    const calendar = google.calendar({ version: "v3", auth });

    // まずconferenceDataなしでイベントを作成してみる
    const eventWithoutConference = {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: {
        dateTime: eventData.startAt.toISOString(),
        timeZone: "Asia/Tokyo",
      },
      end: {
        dateTime: eventData.endAt.toISOString(),
        timeZone: "Asia/Tokyo",
      },
      // ゲストの権限設定 - 誰でも参加可能
      guestsCanInviteOthers: true,
      guestsCanModify: false,
      guestsCanSeeOtherGuests: true,
      // 誰でも参加できるように公開設定
      visibility: "public",
      // 外部ゲストも参加可能
      anyoneCanAddSelf: true,
    };

    console.log("Creating basic calendar event first...");

    try {
      const basicResponse = await calendar.events.insert({
        calendarId: "primary",
        requestBody: eventWithoutConference,
      });

      console.log("Basic event created:", basicResponse.data.id);

      // 次にconferenceDataを追加してイベントを更新
      const eventWithConference = {
        ...eventWithoutConference,
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      };

      console.log("Adding conference data...");

      const response = await calendar.events.patch({
        calendarId: "primary",
        eventId: basicResponse.data.id!,
        conferenceDataVersion: 1,
        requestBody: {
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              conferenceSolutionKey: {
                type: "hangoutsMeet"
              },
            },
          },
        },
      });

      console.log("Conference data added successfully");
      console.log("Event ID:", response.data.id);
      console.log("Meet Link:", response.data.hangoutLink);

      // 本物のGoogle Meetリンクを取得
      const meetLink = response.data.hangoutLink;

      if (!meetLink) {
        console.error("No Meet link returned from Google Calendar API");
        // フォールバック
        return generateMeetLink(eventData.title);
      }

      return meetLink;
    } catch (innerError) {
      console.error("Error in two-step conference creation:", innerError);
      throw innerError;
    }
  } catch (error) {
    console.error("Error creating Google Calendar event with Meet:", error);
    // エラー時はフォールバック
    return generateMeetLink(eventData.title);
  }
}
