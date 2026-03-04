// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import LineProvider from "next-auth/providers/line";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { createAccount } from "./sheets";
import { firebaseAdmin, initFirebaseAdmin } from "@/config/firebase-admin";
import { hashPhoneNumber } from "./hash";

// Robust hash helper for auth
function safeHashPhoneNumber(num: string) {
  try {
    return hashPhoneNumber(num);
  } catch (e) {
    console.warn("[Auth] WARN: PHONE_HASH_PEPPER is missing. Using fallback hash. Please set it in ENV.");
    // Fallback simple hash for development/missing config
    return `fallback_${num.substring(num.length - 4)}`;
  }
}

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
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/youtube.force-ssl",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    LineProvider({
      clientId: process.env.LINE_CHANNEL_ID!,
      clientSecret: process.env.LINE_CHANNEL_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email || `${profile.sub}@line.user`, // LINEはemailを返さないことがあるのでフォールバック
          image: profile.picture,
        };
      },
    }),
    // Phone Auth Provider
    CredentialsProvider({
      id: "phone",
      name: "Phone",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          console.log("[Auth] --- Phone Auth Step 1: Verifying ID Token ---");
          if (!credentials?.idToken) {
            console.error("[Auth] No ID Token provided in credentials");
            throw new Error("ERR_NO_TOKEN_IN_CREDENTIALS");
          }
          console.log(`[Auth] ID Token Length: ${credentials.idToken.length}`);

          // Ensure initialized
          initFirebaseAdmin();

          if (!firebaseAdmin || !firebaseAdmin.apps.length) {
            console.error("[Auth] !!! Firebase Admin is NULL or not initialized !!!");
            throw new Error("ERR_FIREBASE_ADMIN_NOT_INIT");
          }

          let decodedToken;
          try {
            decodedToken = await firebaseAdmin.auth().verifyIdToken(credentials.idToken);
          } catch (verifyErr: any) {
            console.error("[Auth] !!! verifyIdToken FAILED !!!", verifyErr.message);
            throw new Error(`ERR_VERIFY_TOKEN_FAILED: ${verifyErr.message}`);
          }

          const { uid, phone_number, firebase } = decodedToken;
          console.log(`[Auth] Step 2: Token verified. UID: ${uid}`);
          console.log("[Auth] Provider:", firebase.sign_in_provider);

          if (firebase.sign_in_provider !== "phone") {
            console.error(`[Auth] Invalid Provider: ${firebase.sign_in_provider}`);
            throw new Error(`ERR_INVALID_PROVIDER: ${firebase.sign_in_provider}`);
          }

          if (!uid) {
            console.error("[Auth] No UID in token");
            throw new Error("ERR_NO_UID_IN_TOKEN");
          }

          console.log("[Auth] Step 3: Looking up user in DB...");
          let user;
          try {
            user = await prisma.user.findUnique({
              where: { firebaseUid: uid },
            });
          } catch (dbErr: any) {
            console.error("[Auth] Step 3 DB Lookup FAILED:", dbErr.message);
            throw new Error(`ERR_DB_LOOKUP_FAILED: ${dbErr.message}`);
          }


          if (!user) {
            console.log("[Auth] Step 4: User not found. Creating NEW user...");

            // Dynamic Community Lookup (Prioritize Official)
            let targetCommunityId: string | undefined;
            try {
              const defaultCommunity = await prisma.community.findFirst({
                where: { isOfficial: true }
              }) || await prisma.community.findFirst();
              targetCommunityId = defaultCommunity?.id;
            } catch (e) {
              console.warn("[Auth] Failed to lookup default community:", e);
            }

            try {
              user = await prisma.user.create({
                data: {
                  firebaseUid: uid,
                  phoneNumber: phone_number || undefined,
                  phoneNumberHash: phone_number ? safeHashPhoneNumber(phone_number) : undefined,
                  tutorialStatus: "PENDING",
                  provider: "phone",
                  isVerified: true,
                } as any
              });
              console.log(`[Auth] Step 5: User record created. ID: ${user.id}`);

              if (targetCommunityId) {
                try {
                  await prisma.communityMember.create({
                    data: {
                      userId: user.id,
                      communityId: targetCommunityId,
                      role: 'ORGANIZER'
                    }
                  });
                  console.log(`[Auth] Step 5b: Joined default community (${targetCommunityId}) successfully`);
                } catch (commErr: any) {
                  console.warn("[Auth] Step 5b Warning: Failed to join default community:", commErr.message);
                }
              } else {
                console.warn("[Auth] Step 5b Skipped: No default community found.");
              }
            } catch (createErr: any) {
              console.error("[Auth] Step 5 User Creation FAILED:", createErr.message);
              throw new Error(`ERR_USER_CREATION_FAILED: ${createErr.message}`);
            }
          } else {
            console.log(`[Auth] Step 4: Existing user found. ID: ${user.id}`);
          }

          console.log("[Auth] Step 6: Authorization successful");
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };

        } catch (error: any) {
          console.error("[Auth] !!! Phone Authorization CRITICAL Error !!!");
          console.error("Signature:", error.message);
          // Throw error to propagate to client (via redirect URL or signIn error)
          throw new Error(error.message || "AuthFailed");
        }
      },
    }),
    // Admin用ログイン
    CredentialsProvider({
      id: "admin",
      name: "Admin",
      credentials: {
        username: { label: "ユーザー名", type: "text", placeholder: "admin" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Admin用の固定認証（username: admin, password: admin）
        if (credentials.username === "admin" && credentials.password === "admin") {
          const TARGET_COMMUNITY_ID = 'community-1766217011278';
          let adminUser = await prisma.user.findFirst({
            where: {
              email: "admin@mmdao.org",
              isAdmin: true,
            },
          });

          if (!adminUser) {
            const hashedPassword = await bcrypt.hash("admin", 10);
            adminUser = await prisma.user.create({
              data: {
                email: "admin@mmdao.org",
                name: "100万人DAO Admin",
                password: hashedPassword,
                isAdmin: true,
                provider: "credentials",
              } as any,
            });
          }

          try {
            await prisma.community.upsert({
              where: { id: TARGET_COMMUNITY_ID },
              create: {
                id: TARGET_COMMUNITY_ID,
                name: "100万人DAO",
                slug: "100-man-dao-e2e",
              },
              update: {},
            });
            await prisma.communityMember.upsert({
              where: {
                userId_communityId: { userId: adminUser!.id, communityId: TARGET_COMMUNITY_ID },
              },
              create: {
                userId: adminUser!.id,
                communityId: TARGET_COMMUNITY_ID,
                role: 'ADMIN',
              },
              update: { role: 'ADMIN' },
            });
          } catch (joinErr) {
            console.warn(`[Auth] Admin failed to join community ${TARGET_COMMUNITY_ID}:`, joinErr);
          }

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            image: adminUser.image,
          };
        }

        return null;
      },
    }),
    // テストユーザー用
    CredentialsProvider({
      id: "test-user",
      name: "テストユーザー",
      credentials: {
        username: { label: "ユーザー名", type: "text", placeholder: "test" },
      },
      async authorize(credentials) {
        // テスト用の固定ユーザー
        const testUsers = [
          {
            id: "test-user-1",
            email: "test1@example.com",
            name: "テストユーザー1",
            image: null,
          },
          {
            id: "test-user-2",
            email: "test2@example.com",
            name: "テストユーザー2",
            image: null,
          },
        ];

        // ユーザー名でテストユーザーを検索（デフォルトは1番目）
        const username = credentials?.username || "test1";

        let user: any;
        if (username.startsWith("test-dynamic-")) {
          user = {
            id: username,
            email: `${username}@example.com`,
            name: username,
            image: null,
          };
        } else {
          user = testUsers.find((u) => u.email.startsWith(username));
          if (!user) {
            user = testUsers[0];
          }
        }

        // DBにユーザーが存在するか確認
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (dbUser) {
            return {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              image: dbUser.image,
            };
          }

          const TARGET_COMMUNITY_ID = 'community-1766217011278';

          // First create user WITHOUT community relation to avoid FK error if community missing
          dbUser = await prisma.user.create({
            data: {
              id: user.id, // Mock IDを使う
              email: user.email,
              name: user.name,
              image: user.image,
              provider: "test",
            } as any
          });

          // Then try to join community
          try {
            await prisma.communityMember.create({
              data: {
                userId: dbUser.id,
                communityId: TARGET_COMMUNITY_ID,
                role: user.email === "test1@example.com" ? 'ADMIN' : 'ORGANIZER'
              }
            });
          } catch (joinErr) {
            console.warn(`[Auth] TestUser ${dbUser.email} created but failed to join community ${TARGET_COMMUNITY_ID}. This is expected if community doesn't exist.`);
          }

          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image,
          };

        } catch (e) {
          console.error("[Auth] Authorize Error:", e);
          return null;
        }
      },
    }),
    // WebAuthn Provider
    CredentialsProvider({
      id: "webauthn",
      name: "WebAuthn",
      credentials: {
        token: { label: "Login Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;

        const record = await prisma.verificationToken.findFirst({
          where: { identifier: `webauthn-login-${credentials.token}` }
        });

        if (!record) return null;

        // Valid token found
        const user = await prisma.user.findUnique({
          where: { id: record.token } // token field holds userId
        });

        if (user) {
          // Cleanup
          await prisma.verificationToken.delete({ where: { identifier_token: { identifier: record.identifier, token: record.token } } });
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }
        return null;
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const { cookies } = await import("next/headers");
      const cookieStore = cookies();

      const authMode = cookieStore.get("auth_mode")?.value;
      const linkingUserId = cookieStore.get("linking_user_id")?.value;

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
              console.error(`[Auth][Google] Google account ${googleId} is already linked to a different user: ${existingGoogleAccount.userId}`);
              return false;
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

            console.log(`[Auth][Google] Successfully linked Google ${googleId} to user ${linkingUserId}`);
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
          const userEmail = user.email || `${lineUserId}@line.user`;

          console.log(`[Auth][LINE] User signing in: ${lineUserId} (${userName}), AuthMode: ${authMode}, LinkingUserId: ${linkingUserId}`);

          // Check if this is an account linking operation (user already logged in)
          if (authMode === "link" && linkingUserId) {
            console.log(`[Auth][LINE] Account LINKING mode detected. Linking LINE to existing user: ${linkingUserId}`);

            // Check if LINE account is already linked to another user
            const existingLineUser = await prisma.user.findUnique({
              where: { lineUserId },
            });

            if (existingLineUser && existingLineUser.id !== linkingUserId) {
              console.error(`[Auth][LINE] LINE account ${lineUserId} is already linked to a different user: ${existingLineUser.id}`);
              // Reject linking - LINE account belongs to someone else
              return false;
            }

            // Link LINE to existing user
            await prisma.user.update({
              where: { id: linkingUserId },
              data: {
                lineUserId: lineUserId,
                // Optionally update profile if not already set
                name: undefined, // Don't overwrite existing name
                image: undefined, // Don't overwrite existing image
              },
            });

            console.log(`[Auth][LINE] Successfully linked LINE ${lineUserId} to user ${linkingUserId}`);

            // The login flow will continue and create a duplicate session.
            // To prevent this, we should ideally reject the sign-in here and redirect.
            // But NextAuth doesn't support this well. Instead, we'll handle it in JWT callback.
            // For now, return true to allow flow, but JWT will pick the right user.
            return true;
          }

          // Normal LINE login flow (not linking)
          // lineUserIdでユーザーを検索
          let existingUser = await prisma.user.findUnique({
            where: { lineUserId },
          });

          if (existingUser) {
            // 既存ユーザーを更新
            await prisma.user.update({
              where: { lineUserId },
              data: {
                name: userName,
                image: userImage,
                email: userEmail,
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
              console.warn(`[Auth][LINE] JWT: No user found in DB for LineUserID: ${lineUserId}`);
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
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt", // Credentials Providerを使うためjwtに変更
  },
};
