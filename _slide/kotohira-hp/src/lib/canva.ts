import crypto from "crypto";
import { getAppUrl } from "./app-url";

const CANVA_CLIENT_ID = process.env.CANVA_CLIENT_ID;
const CANVA_CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET;
const CANVA_REDIRECT_URI =
  process.env.CANVA_REDIRECT_URI || `${getAppUrl()}/api/canva/callback`;

if (!CANVA_CLIENT_ID || !CANVA_CLIENT_SECRET) {
  console.warn("Canva credentials not configured. Canva export will be disabled.");
}

export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export function getCanvaAuthUrl(state: string, codeVerifier: string): string {
  if (!CANVA_CLIENT_ID) throw new Error("CANVA_CLIENT_ID not configured");
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CANVA_CLIENT_ID,
    redirect_uri: CANVA_REDIRECT_URI,
    scope: "design:content:write asset:upload:write",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://www.canva.com/api/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  if (!CANVA_CLIENT_ID || !CANVA_CLIENT_SECRET) {
    throw new Error("Canva credentials not configured");
  }

  const response = await fetch("https://api.canva.com/rest/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CANVA_CLIENT_ID,
      client_secret: CANVA_CLIENT_SECRET,
      code,
      redirect_uri: CANVA_REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Canva token exchange failed: ${response.status} ${error}`);
  }

  return response.json();
}

export async function uploadToCanva(
  accessToken: string,
  imageData: Blob,
  mimeType: "image/png" | "image/svg+xml",
  filename: string
): Promise<{ asset_id: string }> {
  // Canva Connect API uses asset-uploads endpoint with metadata header
  const nameBase64 = Buffer.from(filename).toString("base64");
  const arrayBuffer = await imageData.arrayBuffer();
  
  const response = await fetch("https://api.canva.com/rest/v1/asset-uploads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/octet-stream",
      "Asset-Upload-Metadata": JSON.stringify({
        name_base64: nameBase64,
      }),
    },
    body: arrayBuffer,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Canva asset upload failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  return { asset_id: data.asset_id || data.id };
}

export async function createCanvaDesign(
  accessToken: string,
  assetId: string,
  width: number = 2400,
  height: number = 1800
): Promise<{ design_url: string; design_id: string }> {
  const response = await fetch("https://api.canva.com/rest/v1/designs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      design_type: "STANDARD",
      width,
      height,
      elements: [
        {
          type: "IMAGE",
          asset_id: assetId,
          x: 0,
          y: 0,
          width,
          height,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Canva design creation failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  return {
    design_url: `https://www.canva.com/design/${data.id}/view`,
    design_id: data.id,
  };
}
