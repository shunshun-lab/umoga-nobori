// prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create test users
  const user1 = await prisma.user.upsert({
    where: { email: "test1@example.com" },
    update: {
      isAdmin: true,
      tutorialStatus: "COMPLETED", // E2E テストでオンボーディングをスキップ
    },
    create: {
      email: "test1@example.com",
      name: "テストユーザー1（管理者）",
      provider: "test",
      isAdmin: true,
      tutorialStatus: "COMPLETED",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "test2@example.com" },
    update: {
      points: 100,
      tutorialStatus: "COMPLETED",
    },
    create: {
      email: "test2@example.com",
      name: "テストユーザー2",
      provider: "test",
      points: 100,
      tutorialStatus: "COMPLETED",
    },
  });

  // Create Personal Communities for seed users
  const user1Comm = await prisma.community.upsert({
    where: { slug: "test1-personal" },
    update: {},
    create: {
      name: "User1 Personal",
      slug: "test1-personal",
      type: "PERSONAL",
      ownerOrganizerId: user1.id,
      ownerUserId: user1.id,
      createdByUserId: user1.id,
    }
  });

  await prisma.user.update({ where: { id: user1.id }, data: { personalCommunityId: user1Comm.id } });

  const user2Comm = await prisma.community.upsert({
    where: { slug: "test2-personal" },
    update: {},
    create: {
      name: "User2 Personal",
      slug: "test2-personal",
      type: "PERSONAL",
      ownerOrganizerId: user2.id,
      ownerUserId: user2.id,
      createdByUserId: user2.id,
    }
  });

  await prisma.user.update({ where: { id: user2.id }, data: { personalCommunityId: user2Comm.id } });

  console.log("✓ Users created:", { user1, user2 });

  // Create sample events
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + 30);

  const event1 = await prisma.event.upsert({
    where: { id: "event-1" },
    update: {
      status: "published",
      format: "offline",
    },
    create: {
      id: "event-1",
      title: "Web3カンファレンス 2025",
      description:
        "最新のWeb3技術とブロックチェーンの動向について学べるカンファレンスです。",
      location: "東京国際フォーラム",
      format: "offline",
      startAt: futureDate,
      endAt: new Date(futureDate.getTime() + 8 * 60 * 60 * 1000),
      capacity: 500,
      imageUrl: "https://placehold.co/600x400/3b82f6/ffffff?text=Web3+Conference",
      ownerId: user1.id,
      organizerCommunityId: user1Comm.id,
      createdByUserId: user1.id,
      status: "published",
    },
  });

  const event2 = await prisma.event.upsert({
    where: { id: "event-2" },
    update: {
      status: "published",
      format: "hybrid",
      onlineUrl: "https://meet.google.com/abc-defg-hij",
    },
    create: {
      id: "event-2",
      title: "DIDハッカソン",
      description:
        "分散型アイデンティティ(DID)を活用したアプリケーション開発ハッカソン。",
      location: "渋谷ヒカリエ",
      format: "hybrid",
      onlineUrl: "https://meet.google.com/abc-defg-hij",
      startAt: new Date("2025-04-01T09:00:00Z"),
      endAt: new Date("2025-04-02T18:00:00Z"),
      capacity: 100,
      imageUrl: "https://placehold.co/600x400/8b5cf6/ffffff?text=DID+Hackathon",
      ownerId: user1.id,
      organizerCommunityId: user1Comm.id,
      createdByUserId: user1.id,
      status: "published",
    },
  });

  const event3 = await prisma.event.upsert({
    where: { id: "event-3" },
    update: {
      status: "published",
      format: "offline",
    },
    create: {
      id: "event-3",
      title: "NFTアート展示会",
      description: "デジタルアートとNFTの可能性を探る展示会イベント。",
      location: "六本木ヒルズ",
      format: "offline",
      startAt: new Date("2025-03-20T11:00:00Z"),
      endAt: new Date("2025-03-27T20:00:00Z"),
      capacity: 300,
      imageUrl: "https://placehold.co/600x400/ec4899/ffffff?text=NFT+Art+Exhibition",
      ownerId: user2.id,
      organizerCommunityId: user2Comm.id,
      createdByUserId: user2.id,
      status: "published",
    },
  });

  const event4 = await prisma.event.upsert({
    where: { id: "event-4" },
    update: {
      status: "published",
      format: "online",
      onlineUrl: "https://meet.google.com/xyz-abcd-efg",
    },
    create: {
      id: "event-4",
      title: "スマートコントラクト入門",
      description: "初心者向けのスマートコントラクト開発ワークショップ。",
      location: "オンライン",
      format: "online",
      onlineUrl: "https://meet.google.com/xyz-abcd-efg",
      startAt: futureDate,
      endAt: new Date(futureDate.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
      capacity: 50,
      imageUrl:
        "https://placehold.co/600x400/10b981/ffffff?text=Smart+Contract+Workshop",
      ownerId: user2.id,
      organizerCommunityId: user2Comm.id,
      createdByUserId: user2.id,
      status: "published",
    },
  });

  console.log("✓ Events created:", { event1, event2, event3, event4 });

  // Create some participants for user1
  const participant1 = await prisma.participant.upsert({
    where: {
      userId_eventId: {
        userId: user1.id,
        eventId: event1.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      eventId: event1.id,
      status: "JOINED",
    },
  });

  const participant2 = await prisma.participant.upsert({
    where: {
      userId_eventId: {
        userId: user1.id,
        eventId: event2.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      eventId: event2.id,
      status: "JOINED",
    },
  });

  console.log("✓ Participants created:", { participant1, participant2 });

  // Create items
  const item1 = await prisma.item.upsert({
    where: { id: "item-1" },
    update: {
      stock: 50,
    },
    create: {
      id: "item-1",
      name: "MMD Tシャツ",
      description: "MMDロゴ入りオリジナルTシャツ",
      imageUrl: "https://placehold.co/400x400/333/fff?text=T-Shirt",
      points: 500,
      stock: 50,
    },
  });

  const item2 = await prisma.item.upsert({
    where: { id: "item-2" },
    update: {
      stock: 100,
    },
    create: {
      id: "item-2",
      name: "ドリンクチケット",
      description: "提携カフェで使えるドリンクチケット",
      imageUrl: "https://placehold.co/400x400/orange/fff?text=Drink",
      points: 100,
      stock: 100,
    },
  });

  console.log("✓ Items created:", { item1, item2 });

  console.log("✓ Items created:", { item1, item2 });

  // Create Official Community
  const officialCommunity = await prisma.community.upsert({
    where: { slug: "mmd-official" },
    update: {},
    create: {
      id: "community-1766217011278", // Fixed ID for Admin Auth linkage
      name: "MMD Official Community",
      description: "MMD公式コミュニティです。お知らせや交流はこちらで！",
      slug: "mmd-official",
      scope: "OFFICIAL",
      isOfficial: true,
      imageUrl: "https://res.cloudinary.com/dv7r3a0gg/image/upload/v1774570331/community-icons/d6fhfk01qqekdkqr7loa.jpg",
      ownerOrganizerId: user1.id, // Admin user as owner
    },
  });

  // Create sample post
  await prisma.post.create({
    data: {
      communityId: officialCommunity.id,
      userId: user1.id,
      content: "MMDアプリへようこそ！ここではイベントの感想や質問を投稿できます。",
      comments: {
        create: [
          {
            userId: user2.id,
            content: "楽しみにしています！",
          },
        ],
      },
    },
  });

  console.log("✓ Official Community created");

  // Create Official Contest
  const officialContest = await prisma.contest.upsert({
    where: { id: "contest-1" },
    update: {
      status: "OPEN",
    },
    create: {
      id: "contest-1",
      title: "MMD Launch Contest",
      description: "MMDアプリのローンチを記念したフォトコンテストです。",
      scope: "OFFICIAL",
      isOfficial: true,
      status: "OPEN",
      startAt: now,
      endAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days later
      imageUrl: "https://placehold.co/600x300/db2777/ffffff?text=Launch+Contest",
      ownerOrganizerId: user1.id,
    },
  });

  // Create sample entry
  await prisma.contestEntry.create({
    data: {
      contestId: officialContest.id,
      userId: user2.id,
      title: "私のMMD体験",
      content: "初めてのイベント参加、とても楽しかったです！",
      imageUrl: "https://placehold.co/400x300/10b981/ffffff?text=My+Experience",
      status: "PUBLISHED",
    },
  });

  console.log("✓ Official Contest created");

  console.log("\n✅ Seed data created successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
