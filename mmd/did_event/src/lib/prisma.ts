// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { ensureDatabaseUrl } from "@/lib/db-env";
import * as sheets from "./sheets";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// In-memory mock data store (Fallback)
const mockStore = {
  users: [
    {
      id: "mock-user-id",
      email: "test@example.com",
      name: "Mock User",
      image: null,
      isAdmin: false,
    },
    {
      id: "admin-user-id",
      email: "admin@mmdao.org",
      name: "Admin User",
      image: null,
      isAdmin: true,
    }
  ],
  events: [
    {
      id: "mock-event-1",
      title: "【Mock】第1回 MMD定例会",
      description: "これはモックデータです。実際のDBには保存されていません。",
      imageUrl: "https://placehold.co/600x400/2563eb/ffffff?text=Mock+Event",
      startAt: new Date(Date.now() + 86400000).toISOString(), // 明日
      endAt: new Date(Date.now() + 90000000).toISOString(),
      location: "オンライン",
      format: "online",
      onlineUrl: "https://meet.google.com/mock-meet",
      capacity: 100,
      status: "published",
      isPublic: true,
      ownerId: "mock-user-id",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  participants: [],
  credentials: [] as any[]
};

ensureDatabaseUrl();

const prismaClientSingleton = () => {
  // Always use real PrismaClient - MOCK_DB is now deprecated
  // Data should come from PostgreSQL database, not Google Sheets
  const realPrisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // MOCK_DB is now DISABLED - always use real database
  // Legacy MOCK_DB mode has been removed to ensure data consistency
  // Use /api/sync?token=sync2024 to sync Google Sheets -> DB if needed
  if (false && process.env.MOCK_DB === "true") {
    console.log("⚠️  MOCK_DB is DISABLED. Always using real database.");

    return new Proxy(
      {},
      {
        get: (target, prop) => {
          // Connect/Disconnect -> delegate to realPrisma (it handles connection pool)
          if (prop === "$connect") return () => realPrisma.$connect();
          if (prop === "$disconnect") return () => realPrisma.$disconnect();

          // Delegate Transaction if needed (simplified)
          if (prop === "$transaction") return (args: any) => realPrisma.$transaction(args);

          // Return a proxy for model access (e.g. prisma.user)
          return new Proxy(
            {},
            {
              get: (modelTarget, modelProp) => {
                const modelName = String(prop); // user, event, participant, etc.
                const method = String(modelProp); // findUnique, findMany, create, etc.

                // --- Auth & Bulletin Board Models: Always use Real SQLite ---
                // "session", "verificationToken" -> Auth (Persistence required)
                // "channel", "message" -> Bulletin Board (User requested Prisma persistence even in Mock mode)
                // "account" -> Virtual/Hybrid (handled below)
                if (["session", "verificationToken", "channel", "message"].includes(modelName)) {
                  // @ts-ignore
                  if (realPrisma[modelName] && typeof realPrisma[modelName][method] === 'function') {
                    // @ts-ignore
                    return realPrisma[modelName][method].bind(realPrisma[modelName]);
                  } else {
                    console.warn(`[MockDB] WARN: Requested realPrisma.${modelName} but it was not found. Available keys:`, Object.keys(realPrisma));
                  }
                }

                return async (...args: any[]) => {
                  console.log(`[MockDB/Hybrid] ${modelName}.${method}`, JSON.stringify(args[0] || {}));

                  try {
                    // Try to use Google Sheets first
                    // --- User (Account) Model ---
                    if (modelName === "user") {
                      if (method === "create") {
                        const sheetUser = await sheets.createAccount(args[0]?.data);
                        // Also sync to Real DB to satisfy Foreign Key constraints for Account/Session
                        // SKIP in simple Mock Mode to avoid SQLite locking issues
                        /*
                        try {
                          const userData = { ...args[0].data };
                          // Prisma create expects specific types, ensure data is clean
                          if (userData.id) delete userData.id; // Let DB handle or keep? Adapter passes ID. NextAuth Adapter uses generated IDs. 
                          // Actually Adapter passes id usually.

                          // PrismaのUserテーブルに合わせてデータを調整
                          // communitiesなどはPrisma schemaにない場合があるので除外が必要だが、createはanyで受ける
                          await realPrisma.user.create({
                            data: {
                              id: sheetUser.id,
                              name: sheetUser.name,
                              email: sheetUser.email,
                              emailVerified: new Date(), // Mock Verified
                              image: sheetUser.image,
                              // communitiesなどはschemaにないので無視されるかエラーになる可能性があるため、必要なフィールドのみ
                            }
                          });
                        } catch (e) {
                          console.warn("[MockDB] Failed to sync User to Real DB (might exist):", e);
                          // If exists, try update?
                        }
                        */
                        return sheetUser;
                      }
                      if (method === "findMany") {
                        return await sheets.getAllAccounts();
                      }
                      if (method === "findUnique" || method === "findFirst") {
                        // Priority: Sheets
                        const users = await sheets.getAllAccounts();
                        const where = args[0]?.where || {};
                        let found: (typeof users)[0] | null = null;
                        if (where.email) found = users.find((u: any) => u.email === where.email) ?? null;
                        else if (where.id) found = users.find((u: any) => u.id === where.id) ?? null;
                        else if (where.lineUserId) found = users.find((u: any) => u.lineUserId === where.lineUserId) ?? null;

                        if (found) return found;

                        // Check Real DB as fallback for Auth flows?
                        // If NextAuth looks for user by email to link account, and it's not in Sheets but is in DB?
                        // For Mock Mode, Sheets is Source of Truth.
                        return null;
                      }
                      if (method === "update") {
                        // Update Sheets
                        const updated = await sheets.updateAccount(args[0]?.where?.id, args[0]?.data);
                        // Sync Real DB
                        try {
                          await realPrisma.user.update({
                            where: { id: args[0]?.where?.id },
                            data: {
                              name: args[0]?.data.name,
                              image: args[0]?.data.image,
                            }
                          });
                        } catch (e) { }
                        return updated;
                      }
                    }

                    // --- Event Model ---
                    if (modelName === "event") {
                      if (method === "findMany") {
                        const events = await sheets.getAllEvents();
                        const users = await sheets.getAllAccounts(); // For relations

                        const where = args[0]?.where || {};
                        let results = [...events];

                        if (where.ownerId) results = results.filter((e: any) => e.ownerId === where.ownerId);
                        if (where.status) results = results.filter((e: any) => e.status === where.status);

                        // Handle include
                        if (args[0]?.include) {
                          return results.map((e: any) => ({
                            ...e,
                            owner: users.find((u: any) => u.id === e.ownerId) || null,
                            _count: { participants: 5 }
                          }));
                        }
                        return results;
                      }
                      if (method === "findUnique") {
                        const events = await sheets.getAllEvents();
                        const users = await sheets.getAllAccounts();
                        const id = args[0]?.where?.id;
                        const event = events.find((e: any) => e.id === id);

                        if (event && args[0]?.include) {
                          return {
                            ...event,
                            owner: users.find((u: any) => u.id === event.ownerId) || null,
                            _count: { participants: 5 }
                          };
                        }
                        return event || null;
                      }
                      if (method === "create") {
                        return await sheets.createEvent(args[0]?.data);
                      }
                    }

                    // --- Participant Model ---
                    if (modelName === "participant") {
                      if (method === "findMany") {
                        const participants = await sheets.getAllParticipants();
                        const events = await sheets.getAllEvents();
                        const users = await sheets.getAllAccounts();

                        const where = args[0]?.where || {};
                        let results = [...participants];

                        if (where.userId) results = results.filter((p: any) => p.userId === where.userId);
                        if (where.status) results = results.filter((p: any) => p.status === where.status);

                        if (args[0]?.include?.event) {
                          return results.map((p: any) => {
                            const event = events.find((e: any) => e.id === p.eventId);
                            return {
                              ...p,
                              event: event ? {
                                ...event,
                                owner: users.find((u: any) => u.id === event.ownerId) || null,
                                _count: { participants: participants.filter((part: any) => part.eventId === event.id).length }
                              } : null
                            };
                          }).filter((p: any) => p.event);
                        }
                        return results;
                      }
                      if (method === "create") {
                        return await sheets.createParticipant(args[0]?.data);
                      }
                      if (method === "delete") {
                        const id = args[0]?.where?.id;
                        if (id) {
                          return await sheets.deleteParticipantById(id);
                        }
                        return null;
                      }
                    }

                    // --- Community Model ---
                    if (modelName === "community") {
                      if (method === "findMany") return await sheets.getAllCommunities();
                      if (method === "findUnique" || method === "findFirst") {
                        const communities = await sheets.getAllCommunities();
                        const args0 = args[0] || {};
                        const where = args0.where || {};

                        // Handle ID or Slug (findFirst with OR)
                        let community: any = null;
                        if (where.id) {
                          community = communities.find((c: any) => c.id === where.id);
                        } else if (where.slug) {
                          community = communities.find((c: any) => c.slug === where.slug);
                        } else if (where.OR) {
                          // Simple OR implementation for ID/Slug
                          for (const cond of where.OR) {
                            if (cond.id) community = communities.find((c: any) => c.id === cond.id);
                            if (cond.slug) community = communities.find((c: any) => c.slug === cond.slug);
                            if (community) break;
                          }
                        }

                        if (community && args0.include?.owner) {
                          const users = await sheets.getAllAccounts();
                          community.owner = users.find((u: any) => u.id === community.ownerOrganizerId) || null;
                        }

                        return community || null;
                      }
                      if (method === "create") return await sheets.createCommunity(args[0]?.data);
                    }

                    // --- CommunityMember Model ---
                    if (modelName === "communityMember") {
                      if (method === "findUnique" || method === "findFirst") {
                        const members = await sheets.getCommunityMembers(args[0]?.where?.userId_communityId?.communityId || "");
                        const where = args[0]?.where || {};

                        // Handle composite key lookup (userId_communityId)
                        if (where.userId_communityId) {
                          const { userId, communityId } = where.userId_communityId;
                          const allMembers = await sheets.getCommunityMembers(communityId);
                          return allMembers.find((m: any) => m.userId === userId && m.communityId === communityId) || null;
                        }

                        // Handle simple id lookup
                        if (where.id) {
                          // Need to search all communities or have a getAllCommunityMembersRaw function
                          // For now, return null as this is less common
                          return null;
                        }

                        return null;
                      }
                      if (method === "findMany") {
                        const where = args[0]?.where || {};
                        if (where.communityId) {
                          return await sheets.getCommunityMembers(where.communityId);
                        }
                        if (where.userId) {
                          const memberships = await sheets.getUserCommunityMemberships(where.userId);
                          return memberships.map((m: any) => ({
                            userId: where.userId,
                            communityId: m.communityId,
                            role: m.role
                          }));
                        }
                        return [];
                      }
                      if (method === "create") {
                        return await sheets.createCommunityMember(args[0]?.data);
                      }
                      if (method === "delete") {
                        // Need to implement delete logic
                        const where = args[0]?.where || {};
                        if (where.userId_communityId) {
                          return await sheets.deleteCommunityMember(
                            where.userId_communityId.communityId,
                            where.userId_communityId.userId
                          );
                        }
                        return null;
                      }
                    }

                    // --- Quest Model ---
                    if (modelName === "quest") {
                      if (method === "findMany") return await sheets.getAllQuests();
                      if (method === "create") return await sheets.createQuest(args[0]?.data);
                    }

                    /*
                    // --- Message Model ---
                    if (modelName === "message") {
                      // ... (removed to favor Real SQLite)
                    }
                    */


                    // --- Post (Message) Model ---
                    if (modelName === "post") {
                      if (method === "findMany") {
                        const messages = await sheets.getAllMessages();
                        const where = args[0]?.where || {};
                        let results = [...messages];
                        // Prisma schema: Post relates to Community. Community relates to Event.
                        // Chat Component calls finds posts where community.eventId = params.id
                        // We need to support this nested filter or assume flat structure in Sheets.
                        // Sheets "Messages" has "communityId" and "eventId".

                        if (where.community?.eventId) {
                          results = results.filter((m: any) => m.eventId === where.community.eventId);
                        } else if (where.eventId) { // Direct filter if used
                          results = results.filter((m: any) => m.eventId === where.eventId);
                        }

                        // Handle user include for author details
                        if (args[0]?.include?.user) {
                          const accounts = await sheets.getAllAccounts();
                          return results.map((m: any) => ({
                            ...m,
                            user: accounts.find((u: any) => u.id === m.authorId) || { id: m.authorId, name: m.userName || "Unknown", image: m.userImage }
                          }));
                        }

                        return results;
                      }
                      if (method === "create") {
                        // args[0].data has content, userId, communityId.
                        // We also need eventId if possible.
                        const data = args[0]?.data;
                        let eventId = data.eventId;

                        // Look up community to get eventId if missing
                        if (!eventId && data.communityId) {
                          const communities = await sheets.getAllCommunities();
                          const community = communities.find((c: any) => c.id === data.communityId);
                          if (community && community.eventId) {
                            eventId = community.eventId;
                          }
                        }

                        // Fetch author details for denormalization in Sheets
                        let authorName = "Unknown";
                        let authorImage = null;
                        if (data.userId) {
                          const accounts = await sheets.getAllAccounts();
                          const author = accounts.find((u: any) => u.id === data.userId);
                          if (author) {
                            authorName = author.name;
                            authorImage = author.image;
                          }
                        }

                        return await sheets.createMessage({
                          ...data,
                          eventId: eventId,
                          authorId: data.userId, // Map userId to authorId
                          userName: authorName,
                          userImage: authorImage
                        });
                      }
                    }

                    // --- Project (Ke) Model ---
                    if (modelName === "project") {
                      if (method === "findMany") return await sheets.getAllProjects();
                      if (method === "create") return await sheets.createProject(args[0]?.data);
                      if (method === "findUnique") {
                        const projects = await sheets.getAllProjects();
                        const id = args[0]?.where?.id;
                        return projects.find((p: any) => p.id === id) || null;
                      }
                    }

                    // --- EventCredential Model (In-Memory for now) ---
                    if (modelName === "eventCredential") {
                      if (method === "create") {
                        const newCred = {
                          id: `cred-${Date.now()}`,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          ...args[0].data
                        };
                        mockStore.credentials.push(newCred as any);
                        return newCred;
                      }
                      if (method === "findUnique") {
                        const id = args[0]?.where?.id;
                        return mockStore.credentials.find((c: any) => c.id === id) || null;
                      }
                      if (method === "findFirst" || method === "findMany") {
                        const where = args[0]?.where || {};
                        // Simple filter support
                        let results = mockStore.credentials;
                        if (where.userId) results = results.filter((c: any) => c.userId === where.userId);
                        if (where.eventId) results = results.filter((c: any) => c.eventId === where.eventId);
                        if (where.status) results = results.filter((c: any) => c.status === where.status);

                        if (method === "findFirst") return results[0] || null;
                        return results;
                      }
                      if (method === "update") {
                        const id = args[0]?.where?.id;
                        const idx = mockStore.credentials.findIndex((c: any) => c.id === id);
                        if (idx !== -1) {
                          mockStore.credentials[idx] = { ...mockStore.credentials[idx], ...args[0].data, updatedAt: new Date().toISOString() };
                          return mockStore.credentials[idx];
                        }
                        return null;
                      }
                    }

                    // --- Account Model (Virtual) ---
                    if (modelName === "account") {
                      // findFirst, findMany for tokens
                      if (method === "findFirst" || method === "findUnique") {
                        const users = await sheets.getAllAccounts();
                        const where = args[0]?.where || {};
                        // Look for user by userId (Standard Prisma Account query)
                        // or by providerAccountId
                        let user: (typeof users)[0] | null = null;
                        if (where.userId) {
                          user = users.find((u: any) => u.id === where.userId) ?? null;
                        } else if (where.provider && where.providerAccountId) {
                          user = users.find((u: any) => u.provider === where.provider && (u.googleId === where.providerAccountId || u.lineUserId === where.providerAccountId)) ?? null;
                        }

                        if (user) {
                          // Construct a Prisma-like Account object from Sheet data
                          return {
                            id: `acc-${user.id}`,
                            userId: user.id,
                            type: "oauth",
                            provider: user.provider || "google", // Default to google or current?
                            providerAccountId: user.googleId || user.lineUserId || "mock-id",
                            access_token: user.access_token,
                            refresh_token: user.refresh_token,
                            expires_at: null,
                            token_type: "Bearer",
                            scope: null,
                            id_token: null,
                            session_state: null
                          };
                        }
                        return null;
                      }
                    }

                  } catch (error) {
                    console.error("[MockDB] Google Sheets Error (falling back to in-memory):", error);
                    // Fallback logic (copy-paste of previous in-memory logic)
                    // For brevity, I'll implement a simplified fallback that just returns mockStore data

                    if (modelName === "user") {
                      if (method === "findUnique" || method === "findFirst") return mockStore.users[0];
                      if (method === "create") return mockStore.users[0];
                    }
                    if (modelName === "event") {
                      if (method === "findMany") return mockStore.events;
                      if (method === "findUnique") return mockStore.events[0];
                      if (method === "create") {
                        const newEvent = { id: `fallback-${Date.now()}`, ...args[0].data };
                        mockStore.events.push(newEvent);
                        return newEvent;
                      }
                    }
                  }

                  // Default fallback
                  if (method === 'count') return 0;
                  return [];
                };
              },
            }
          );
        },
      }
    ) as unknown as PrismaClient;
  }

  return realPrisma;
};

const _prisma = globalForPrisma.prisma || prismaClientSingleton();
export const prisma = _prisma as any; // Schema and code use models not in generated client (communityMember, campaign, etc.)

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _prisma;
