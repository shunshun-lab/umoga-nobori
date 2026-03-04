import { NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/canva";
import { getAppUrl } from "@/lib/app-url";
import { cookies } from "next/headers";

const editorUrl = () => `${getAppUrl()}/editor`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${editorUrl()}?canva_error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${editorUrl()}?canva_error=no_code`
      );
    }

    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get("canva_code_verifier")?.value;
    const storedState = cookieStore.get("canva_state")?.value;

    if (!codeVerifier) {
      return NextResponse.redirect(
        `${editorUrl()}?canva_error=no_verifier`
      );
    }

    if (state !== storedState) {
      return NextResponse.redirect(
        `${editorUrl()}?canva_error=state_mismatch`
      );
    }

    const tokens = await exchangeCodeForToken(code, codeVerifier);

    // Store tokens in httpOnly cookie (or use a session store in production)
    cookieStore.set("canva_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
    });
    cookieStore.set("canva_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Clear temporary cookies
    cookieStore.delete("canva_code_verifier");
    cookieStore.delete("canva_state");

    return NextResponse.redirect(
      `${editorUrl()}?canva_connected=1`
    );
  } catch (err) {
    console.error("[canva/callback]", err);
    return NextResponse.redirect(
      `${editorUrl()}?canva_error=${encodeURIComponent(err instanceof Error ? err.message : "callback_failed")}`
    );
  }
}
