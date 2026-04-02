// src/lib/googleMeet.ts
import { google } from "googleapis";

/**
 * Google Calendar API 経由で本物の Meet リンクを生成する。
 *
 * 認証の優先順位:
 *   1. 引数で渡されたユーザーの access_token（getValidGoogleToken 経由で取得済み想定）
 *   2. GOOGLE_MEET_REFRESH_TOKEN（システムアカウントの refresh token）
 *
 * フェイクURL は一切返さない。生成できなければ null を返す。
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
): Promise<string | null> {
  let auth;
  let authMethod: string;

  // 1. ユーザーのアクセストークン
  if (accessToken) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    auth = oauth2Client;
    authMethod = "user-token";
  }
  // 2. システム用 OAuth2 Refresh Token
  else if (
    process.env.GOOGLE_MEET_CLIENT_ID &&
    process.env.GOOGLE_MEET_CLIENT_SECRET &&
    process.env.GOOGLE_MEET_REFRESH_TOKEN
  ) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_MEET_CLIENT_ID,
      process.env.GOOGLE_MEET_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_MEET_REFRESH_TOKEN,
    });
    auth = oauth2Client;
    authMethod = "system-refresh-token";
  } else {
    console.error("[GoogleMeet] No credentials available (no user token, no GOOGLE_MEET_* env vars)");
    return null;
  }

  const calendar = google.calendar({ version: "v3", auth });

  try {
    // 1ステップで conferenceData 付きイベントを作成
    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
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
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
        guestsCanInviteOthers: true,
        visibility: "public" as const,
        anyoneCanAddSelf: true,
      },
    });

    const meetLink = response.data.hangoutLink;

    if (meetLink) {
      console.log(`[GoogleMeet] Created via ${authMethod}: ${meetLink}`);
      return meetLink;
    }

    // conferenceData が pending の場合、entryPoints から取得を試みる
    const entryPoint = response.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === "video"
    );
    if (entryPoint?.uri) {
      console.log(`[GoogleMeet] Created via ${authMethod} (entryPoint): ${entryPoint.uri}`);
      return entryPoint.uri;
    }

    console.error(`[GoogleMeet] Event created (${response.data.id}) but no Meet link returned via ${authMethod}`);
    return null;
  } catch (error: any) {
    const status = error?.code || error?.response?.status;
    const message = error?.message || String(error);

    if (status === 401 || message.includes("invalid_grant")) {
      console.error(
        `[GoogleMeet] AUTH FAILED (${authMethod}): ${message}. ` +
        (authMethod === "system-refresh-token"
          ? "GOOGLE_MEET_REFRESH_TOKEN is invalid/expired. Re-run scripts/get-google-refresh-token.ts to obtain a new one."
          : "User's Google token is invalid. User needs to re-link Google account.")
      );
    } else if (status === 403) {
      console.error(
        `[GoogleMeet] PERMISSION DENIED (${authMethod}): ${message}. ` +
        "Check that Google Calendar API is enabled and the OAuth consent screen is in Production."
      );
    } else {
      console.error(`[GoogleMeet] Failed (${authMethod}):`, message);
    }

    return null;
  }
}
