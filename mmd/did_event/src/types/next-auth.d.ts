// src/types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      provider?: string;
      googleId?: string | null;
      email?: string | null;
      name?: string | null;
      displayName?: string | null;
      image?: string | null;
      isAdmin?: boolean;
      lineUserId?: string | null;
      whatsappUserId?: string | null;
      tutorialStatus?: string | null;
      personalCommunityId?: string | null;
      stripeCustomerId?: string | null;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    displayName?: string | null;
    image?: string | null;
    isAdmin?: boolean;
    lineUserId?: string | null;
    whatsappUserId?: string | null;
    tutorialStatus?: string | null;
    personalCommunityId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    isAdmin?: boolean;
    displayName?: string | null;
    lineUserId?: string | null;
    googleId?: string | null;
    tutorialStatus?: string | null;
    personalCommunityId?: string | null;
    stripeCustomerId?: string | null;
    isPhoneVerified?: boolean;
    provider?: string;
  }
}
