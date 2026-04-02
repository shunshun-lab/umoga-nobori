// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import LineProvider from "next-auth/providers/line";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { phoneAuthProvider } from "@/lib/auth/providers/credentials-phone";
import { testUserProvider } from "@/lib/auth/providers/credentials-test-user";
import { webauthnProvider } from "@/lib/auth/providers/credentials-webauthn";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.callback-url`
        : `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Host-next-auth.csrf-token`
        : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",
        },
      },
      // openid-client 5.6.5 にダウングレード済み (package.json overrides)
      // pkce + state でセキュリティ担保
    }),
    // Discord: 環境変数が設定されている場合のみ有効化
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? [DiscordProvider({
          clientId: process.env.DISCORD_CLIENT_ID,
          clientSecret: process.env.DISCORD_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        })]
      : []),
    LineProvider({
      clientId: process.env.LINE_CHANNEL_ID!,
      clientSecret: process.env.LINE_CHANNEL_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "profile openid email",
          bot_prompt: "aggressive",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          // LINEがメールを返さない場合は null にする
          // フォールバックメール(@line.user)は既存ユーザーとの衝突を起こすため使わない
          email: profile.email || null,
          image: profile.picture,
        };
      },
    }),
    phoneAuthProvider(),
    testUserProvider(),
    webauthnProvider(),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow redirects to JXC domain (multi-zone setup)
      const jxcDomain = process.env.JXC_DOMAIN || '';
      if (jxcDomain && url.startsWith(jxcDomain)) {
        return url;
      }
      // Default NextAuth behavior: allow relative URLs and same-origin
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      let authMode: string | undefined;
      let linkingUserId: string | undefined;
      let cookieStore: any;

      try {
        const { cookies } = await import("next/headers");
        cookieStore = await cookies();
        authMode = cookieStore.get("auth_mode")?.value;
        linkingUserId = cookieStore.get("linking_user_id")?.value;
      } catch (cookieErr) {
        console.warn("[Auth] Failed to read cookies in signIn callback:", cookieErr);
      }

      // Bootstrap / allowlist based admin (best practice: normal login + DB role).
      // Comma-separated list of emails.
      const allowlistRaw = process.env.ADMIN_EMAIL_ALLOWLIST || "";
      const allowlistedEmails = new Set(
        allowlistRaw
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
      );
      const signedInEmail = ((profile as any)?.email || user.email || "").trim().toLowerCase();
      if (signedInEmail && allowlistedEmails.has(signedInEmail)) {
        const targetUserId = authMode === "link" && linkingUserId ? linkingUserId : user.id;
        try {
          await prisma.user.update({
            where: { id: targetUserId },
            data: { isAdmin: true } as any,
          });
          console.log(`[Auth] Admin allowlist matched for ${signedInEmail}. Marked isAdmin=true (userId=${targetUserId}).`);
        } catch (e) {
          console.warn("[Auth] Failed to set isAdmin from allowlist:", e);
        }
      }

      // Google Account Linking
      if (account?.provider === "google") {
        try {
          const googleId = account.providerAccountId;
          const userName = profile?.name || user.name || "Google User";
          const userEmail = profile?.email || user.email;

          console.log(`[Auth][Google] User signing in: ${googleId} (${userName}), AuthMode: ${authMode}, LinkingUserId: ${linkingUserId}`);

          // Check if this is an account linking operation (user already logged in)
          if (authMode === "link" && linkingUserId) {
            console.log(`[Auth][Google] Account LINKING mode detected. Linking Google to existing user: ${linkingUserId}`);

            // Check if Google account is already linked to another user
            const existingGoogleAccount = await prisma.account.findFirst({
              where: { provider: "google", providerAccountId: googleId },
            });

            if (existingGoogleAccount && existingGoogleAccount.userId !== linkingUserId) {
              console.log(`[Auth][Google] Conflict: Google account ${googleId} belongs to user ${existingGoogleAccount.userId}. Redirecting to merge confirm.`);
              cookieStore?.delete("auth_mode");
              cookieStore?.delete("linking_user_id");
              return `/auth/merge-confirm?victimId=${existingGoogleAccount.userId}&provider=google`;
            }

            // Create or update Google account link
            if (!existingGoogleAccount) {
              await prisma.account.create({
                data: {
                  userId: linkingUserId,
                  type: "oauth",
                  provider: "google",
                  providerAccountId: googleId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
            } else {
              // 再連携: 既存レコードのトークンを更新（期限切れ解消）
              await prisma.account.update({
                where: { id: existingGoogleAccount.id },
                data: {
                  access_token: account.access_token,
                  refresh_token: account.refresh_token ?? existingGoogleAccount.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
            }

            // Update user with Google info
            await prisma.user.update({
              where: { id: linkingUserId },
              data: {
                googleId: googleId,
                googleEmail: userEmail,
              } as any,
            });

            // PrismaAdapter が先に重複ユーザーを作っている場合は削除
            if (user.id !== linkingUserId) {
              try {
                await prisma.account.deleteMany({ where: { userId: user.id } });
                await prisma.user.delete({ where: { id: user.id } });
                console.log(`[Auth][Google] Cleaned up adapter-created duplicate user: ${user.id}`);
              } catch (cleanupErr) {
                console.warn(`[Auth][Google] Failed to cleanup duplicate user ${user.id}:`, cleanupErr);
              }
            }

            console.log(`[Auth][Google] Successfully linked Google ${googleId} to user ${linkingUserId}`);
            cookieStore?.delete("auth_mode");
            cookieStore?.delete("linking_user_id");
            return true;
          }
        } catch (e) {
          console.error(`[Auth][Google] Failed to sync/initialize Google user (GoogleID: ${account?.providerAccountId}):`, e);
        }
      }

      if (account?.provider === "line") {
        try {
          const authMode = cookieStore.get("auth_mode")?.value;
          const linkingUserId = cookieStore.get("linking_user_id")?.value;

          const lineUserId = account.providerAccountId;
          const userName = profile?.name || user.name || "LINE User";
          const userImage = (profile as any)?.picture || user.image;
          const userEmail = user.email || null;

          console.log(`[Auth][LINE] User signing in: ${lineUserId} (${userName}), AuthMode: ${authMode}, LinkingUserId: ${linkingUserId}`);

          // Check if this is an account linking operation (user already logged in)
          if (authMode === "link" && linkingUserId) {
            console.log(`[Auth][LINE] Account LINKING mode detected. Linking LINE to existing user: ${linkingUserId}`);

            // Check if LINE account is already linked to another user
            const existingLineUser = await prisma.user.findUnique({
              where: { lineUserId },
            });

            if (existingLineUser && existingLineUser.id !== linkingUserId) {
              console.log(`[Auth][LINE] Conflict: LINE account ${lineUserId} belongs to user ${existingLineUser.id}. Redirecting to merge confirm.`);
              cookieStore.delete("auth_mode");
              cookieStore.delete("linking_user_id");
              return `/auth/merge-confirm?victimId=${existingLineUser.id}&provider=line`;
            }

            // Link LINE to existing user (箱にLINEを接続)
            await prisma.user.update({
              where: { id: linkingUserId },
              data: {
                lineUserId: lineUserId,
                name: undefined, // Don't overwrite existing name
                image: undefined, // Don't overwrite existing image
              },
            });

            // PrismaAdapter が先に重複ユーザーを作っている場合は削除
            if (user.id !== linkingUserId) {
              try {
                await prisma.account.deleteMany({ where: { userId: user.id } });
                await prisma.user.delete({ where: { id: user.id } });
                console.log(`[Auth][LINE] Cleaned up adapter-created duplicate user: ${user.id}`);
              } catch (cleanupErr) {
                console.warn(`[Auth][LINE] Failed to cleanup duplicate user ${user.id}:`, cleanupErr);
              }
            }

            console.log(`[Auth][LINE] Successfully linked LINE ${lineUserId} to user ${linkingUserId}`);
            cookieStore?.delete("auth_mode");
            cookieStore?.delete("linking_user_id");
            return true;
          }

          // Normal LINE login flow (not linking)
          // lineUserIdでユーザーを検索
          let existingUser = await prisma.user.findUnique({
            where: { lineUserId },
          });

          if (existingUser) {
            // 既存ユーザーを更新（emailがnullなら既存値を維持）
            await prisma.user.update({
              where: { lineUserId },
              data: {
                name: userName,
                image: userImage,
                ...(userEmail ? { email: userEmail } : {}),
                displayName: existingUser.displayName || userName,
              } as any,
            });
          } else {
            // New User (Created by Adapter immediately before this callback)
            // Adapter does not populate `lineUserId` automatically, so we must update it
            try {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  lineUserId: account.providerAccountId,
                  name: userName,
                  displayName: userName,
                  image: userImage,
                  email: user.email ? undefined : userEmail,
                },
              });
              console.log(`[Auth] User updated with Line ID: ${user.id} -> ${account.providerAccountId}`);

            } catch (err) {
              console.error("[Auth] Failed to initialize new user:", err);
            }
          }

        } catch (e) {
          console.error(`[Auth][LINE] Failed to sync/initialize LINE user (LineID: ${account?.providerAccountId}):`, e);
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // 初期サインイン時 (userが存在する)
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;

        // Fetch Phone Verification Status
        try {
          const verification = await prisma.userPhoneVerification.findUnique({
            where: { userId: user.id }
          });
          token.isPhoneVerified = !!verification;
        } catch (e) {
          console.error("Failed to check phone verification", e);
          token.isPhoneVerified = false;
        }

        // LINEログインの場合、user.idはLINEのID(U...)になっている可能性があるため、
        // DB(Sheet/SQLite)上の本当のID(UUID等)に置き換える必要がある。
        if (account?.provider === "line") {
          const lineUserId = account.providerAccountId;

          try {
            const dbUser = await prisma.user.findUnique({
              where: { lineUserId },
              include: { phoneVerification: true }
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.isAdmin = dbUser.isAdmin;
              token.displayName = (dbUser as any).displayName || dbUser.name;
              token.lineUserId = dbUser.lineUserId;
              token.googleId = (dbUser as any).googleId;
              token.whatsappUserId = dbUser.whatsappUserId;
              token.isPhoneVerified = !!dbUser.phoneVerification; // Update if we swapped user
              token.tutorialStatus = dbUser.tutorialStatus;
              console.log(`[Auth][LINE] JWT: Swapped Provider ID ${user.id} -> DB ID ${dbUser.id} for LineUserID: ${lineUserId}`);
            } else {
              console.warn(`[Auth][LINE] JWT: No user found in DB for LineUserID: ${lineUserId}. Trying adapter-created user ID: ${user.id}`);
              // The adapter may have created the user with a different ID than lineUserId.
              // Fall back to looking up by the adapter-assigned user.id.
              const fallbackUser = await prisma.user.findUnique({
                where: { id: user.id },
                include: { phoneVerification: true },
              });
              if (fallbackUser) {
                token.id = fallbackUser.id;
                token.isAdmin = fallbackUser.isAdmin;
                token.displayName = (fallbackUser as any).displayName || fallbackUser.name;
                token.lineUserId = fallbackUser.lineUserId;
                token.googleId = (fallbackUser as any).googleId;
                token.whatsappUserId = fallbackUser.whatsappUserId;
                token.isPhoneVerified = !!fallbackUser.phoneVerification;
                token.tutorialStatus = fallbackUser.tutorialStatus;
                console.log(`[Auth][LINE] JWT: Fallback resolved user ${fallbackUser.id} for LineUserID: ${lineUserId}`);
              } else {
                console.error(`[Auth][LINE] JWT: Fallback also failed. No user found for id=${user.id} or LineUserID=${lineUserId}`);
              }
            }
          } catch (e) {
            console.error(`[Auth][LINE] JWT: Failed to resolve LINE user ID (LineID: ${lineUserId}):`, e);
          }
        } else if (account?.provider === "google") {
          // Googleログイン時
          try {
            // Real DB logic remains
            const linkedAccount = await prisma.account.findFirst({
              where: { provider: "google", providerAccountId: account.providerAccountId },
              include: { user: { include: { phoneVerification: true } } }
            });
            if (linkedAccount?.user) {
              token.id = linkedAccount.user.id;
              token.isAdmin = linkedAccount.user.isAdmin;
              token.displayName = (linkedAccount.user as any).displayName || linkedAccount.user.name;
              token.lineUserId = (linkedAccount.user as any).lineUserId;
              token.googleId = account.providerAccountId;
              token.whatsappUserId = linkedAccount.user.whatsappUserId;
              token.tutorialStatus = (linkedAccount.user as any).tutorialStatus;
              token.isPhoneVerified = !!linkedAccount.user.phoneVerification;
            }
          } catch (e) {
            console.error("[Auth] JWT: Failed to resolve Google user ID:", e);
          }
        } else {
          // Other providers (Credentials etc.) - Initial load
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string || user?.id },
              include: {
                phoneVerification: true,
                accounts: { where: { provider: "google" } }
              },
            });

            if (dbUser) {
              token.isAdmin = dbUser.isAdmin;
              token.displayName = (dbUser as any).displayName || dbUser.name;
              token.lineUserId = (dbUser as any).lineUserId;
              token.googleId = (dbUser as any).googleId || dbUser.accounts?.[0]?.providerAccountId;
              token.whatsappUserId = dbUser.whatsappUserId;
              token.stripeCustomerId = (dbUser as any).stripeCustomerId;
              token.tutorialStatus = dbUser.tutorialStatus;
              token.personalCommunityId = dbUser.personalCommunityId;
              token.isPhoneVerified = !!dbUser.phoneVerification || (dbUser as any).provider === "phone";
            }
          } catch (e) {
            console.warn("[Auth] JWT: Failed to fetch user data:", e);
          }
        }
      }

      // Googleアクセストークンを保存
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }

      // --- Refresh / Update Logic ---
      // updateSession()が呼ばれた場合(trigger="update")や、トークンのリフレッシュ時に
      // DBから最新情報を取得してトークンを更新する。これがないとtutorialStatus等が反映されない。
      if (token.id && (!user || trigger === 'update')) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: { phoneVerification: true }
          });

          if (dbUser) {
            token.isAdmin = dbUser.isAdmin;
            token.displayName = (dbUser as any).displayName || dbUser.name;
            token.lineUserId = (dbUser as any).lineUserId;
            token.googleId = (dbUser as any).googleId;
            token.whatsappUserId = dbUser.whatsappUserId;
            token.stripeCustomerId = (dbUser as any).stripeCustomerId;
            token.tutorialStatus = dbUser.tutorialStatus;
            token.personalCommunityId = dbUser.personalCommunityId;
            token.isPhoneVerified = !!dbUser.phoneVerification || (dbUser as any).provider === "phone";
            // console.log(`[Auth] JWT Refreshed: ${token.id}, TutorialStatus: ${token.tutorialStatus}`);
          }
        } catch (e) {
          // console.warn("[Auth] JWT Refresh Failed:", e);
        }
      }

      return token;
    },
    async session({ session, token, user }) {
      // DEBUG LOG
      // console.log(`[Auth] Session Callback: TokenID=${token.id}, SessionUserID=${session.user?.id}`);

      if (session.user) {
        // Ensure ID is set from Token
        (session.user as any).id = token.id as string;

        session.user.isAdmin = (token as any).isAdmin || false;
        session.user.displayName = (token as any).displayName as string | undefined;
        (session.user as any).provider = (token as any).provider;
        (session.user as any).tutorialStatus = (token as any).tutorialStatus;
        (session.user as any).isPhoneVerified = (token as any).isPhoneVerified || false;
        (session.user as any).personalCommunityId = (token as any).personalCommunityId || null;
        session.user.lineUserId = (token as any).lineUserId || null;
        session.user.googleId = (token as any).googleId || null;
        session.user.whatsappUserId = (token as any).whatsappUserId || null;
        session.user.stripeCustomerId = (token as any).stripeCustomerId || null;

        session.accessToken = token.accessToken as string | undefined;
        session.refreshToken = token.refreshToken as string | undefined;

        // --- IDs are now synced in JWT callback ---
        // Profile properties are read directly from the token to avoid DB hits here.

      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const TARGET_COMMUNITY_ID = 'community-1766217011278';
      const targetRole = (user as any).isAdmin ? 'ADMIN' : 'ORGANIZER';
      console.log(`[Auth] New user created: ${user.id}. Automatically adding to DAO as ${targetRole}.`);
      try {
        await prisma.communityMember.create({
          data: {
            userId: user.id,
            communityId: TARGET_COMMUNITY_ID,
            role: targetRole,
          }
        });
      } catch (error) {
        console.error('[Auth] Failed to automatically add user to community:', error);
      }
    }
  },
  debug: process.env.NODE_ENV !== "production",
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt", // Credentials Providerを使うためjwtに変更
  },
};
