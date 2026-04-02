// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const TutorialStatus = { PENDING: "PENDING", COMPLETED: "COMPLETED" } as const;

/**
 * ユーザープロフィール取得
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // MOCK_DB Handling
    if (process.env.MOCK_DB === "true") {
      const { getAllAccounts } = await import("@/lib/sheets");
      const accounts = await getAllAccounts(true);

      // ID Resolution: Check internal ID, LINE ID, Google ID
      let user = accounts.find((a: any) =>
        a.id === session.user.id ||
        a.lineUserId === session.user.id ||
        a.googleId === session.user.id
      );

      // Fallback to email if user has one
      if (!user && session.user.email) {
        user = accounts.find((a: any) => a.email === session.user.email);
      }

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Mock DB: 'preferences' is already parsed
      return NextResponse.json({
        ...user,
        preferences: user.preferences || { showPoints: true, showEvents: false, showCommunities: false, showQuests: false }
      });
    }

    // Prisma Handling
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        website: true,
        image: true,
        phoneNumber: true,
        bio: true,
        twitterUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
        location: true,
        whatsappUserId: true,
        lineUserId: true,
        googleId: true,
        displayName: true,
        preferences: true,
        points: true,
        socialLinks: true,
        profileConfig: true,
        walletAddress: true,
        onboardingTags: true,
      } as any,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse preferences if it's a string (Prisma)
    const safeJsonParse = <T,>(value: unknown, fallback: T, label: string): T => {
      try {
        if (typeof value !== "string") return (value as T) ?? fallback;
        return (JSON.parse(value) as T) ?? fallback;
      } catch (e) {
        console.warn(`[UserProfile] Invalid JSON in ${label}`, {
          userId: user.id,
          error: e instanceof Error ? e.message : String(e),
        });
        return fallback;
      }
    };

    const preferences = safeJsonParse(
      user.preferences,
      { showPoints: true, showEvents: false, showCommunities: false, showQuests: false },
      "preferences",
    );

    return NextResponse.json({
      ...user,
      preferences,
      socialLinks: safeJsonParse(user.socialLinks, [], "socialLinks"),
      profileConfig: safeJsonParse(user.profileConfig, {}, "profileConfig"),
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * ユーザープロフィール更新
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name, displayName, website, profileUpdate,
      phoneNumber, realName, bio, twitterUrl, instagramUrl, linkedinUrl, location, exchangeScope, did, isVerified,
      preferences, socialLinks, profileConfig, walletAddress
    } = body;

    // Helper to ensure JSON string format
    const ensureString = (val: any) => {
      if (val === undefined || val === null) return undefined;
      return typeof val === 'string' ? val : JSON.stringify(val);
    };

    console.log("[API] Profile Update Request:", {
      id: session.user.id,
      socialLinksType: typeof socialLinks,
      socialLinksLen: Array.isArray(socialLinks) ? socialLinks.length : 'N/A',
      profileConfigType: typeof profileConfig
    });

    const formattedPreferences = ensureString(preferences);
    const formattedSocialLinks = ensureString(socialLinks);
    const formattedProfileConfig = ensureString(profileConfig);

    // MOCK_DB Handling
    if (process.env.MOCK_DB === "true") {
      const { updateAccount } = await import("@/lib/sheets");
      const updatedUser = await updateAccount(session.user.id, {
        name,
        displayName,
        // Basic Info
        bio,
        website,
        phoneNumber,
        location,
        // Social & Config (Pass strings to sheets to be safe, or let sheets handle it? Usually sheets expects strings for complex cols)
        socialLinks: formattedSocialLinks,
        profileConfig: formattedProfileConfig,
        preferences: formattedPreferences,
        // Others (less common in profile edit but supported)
        image: body.image,
        twitterUrl, instagramUrl, linkedinUrl
      });

      if (!updatedUser) {
        return NextResponse.json({ error: "Failed to update user in Sheets" }, { status: 500 });
      }

      return NextResponse.json({
        ...updatedUser,
        // Return objects to frontend
        preferences: preferences || { showPoints: true, showEvents: false, showCommunities: false, showQuests: false }
      });
    }

    // Prisma Handling
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        displayName: displayName || undefined,
        website: website || undefined,
        phoneNumber: phoneNumber || undefined,
        realName: realName || undefined,
        bio: bio || undefined,
        twitterUrl: twitterUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        location: location || undefined,
        exchangeScope: exchangeScope || undefined,
        did: did || undefined,
        isVerified: typeof isVerified === 'boolean' ? isVerified : undefined,

        // Use helper to ensure they are Strings for Prisma Text/String columns
        socialLinks: formattedSocialLinks,
        profileConfig: formattedProfileConfig,

        preferences: formattedPreferences,
        walletAddress: walletAddress || undefined,
        tutorialStatus: body.tutorialStatus === 'COMPLETED' ? "COMPLETED" : undefined,
      } as any,
      select: {
        id: true,
        name: true,
        email: true,
        socialLinks: true,
        profileConfig: true,
        personalCommunityId: true,
        displayName: true,
        preferences: true,
        onboardingTags: true,
      } as any,
    });

    return NextResponse.json({
      ...user,
      // Parse back to objects for response consistency (so frontend doesn't break if it expects object)
      // Note: Prisma returns the stored string.
      preferences: user.preferences ? JSON.parse(user.preferences as any) : { showPoints: true, showEvents: false, showCommunities: false, showQuests: false },
      socialLinks: user.socialLinks ? JSON.parse(user.socialLinks as any) : [],
      profileConfig: user.profileConfig ? JSON.parse(user.profileConfig as any) : {},
      onboardingTags: (user as any).onboardingTags ?? null,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
