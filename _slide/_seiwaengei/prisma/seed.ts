import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import { hashSync } from "bcryptjs"

// Decode the prisma+postgres URL to get the actual database URL
function getDirectDbUrl(): string {
  const dbUrl = process.env.DATABASE_URL || ""
  if (dbUrl.startsWith("prisma+postgres://")) {
    // Extract the API key and decode it to get the actual postgres URL
    const url = new URL(dbUrl)
    const apiKey = url.searchParams.get("api_key") || ""
    try {
      const decoded = JSON.parse(Buffer.from(apiKey, "base64").toString())
      return decoded.databaseUrl
    } catch {
      // fallback
    }
  }
  return dbUrl
}

const directUrl = getDirectDbUrl()
const adapter = new PrismaPg({ connectionString: directUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Admin User ──
  const adminEmail = process.env.ADMIN_EMAIL || "admin@seiwaengei.com"
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      hashedPassword: hashSync(adminPassword, 10),
      name: "管理者",
      role: "admin",
    },
  })
  console.log(`Admin user created: ${adminEmail}`)

  // ── Store Profile ──
  const existing = await prisma.storeProfile.findFirst()
  if (!existing) {
    await prisma.storeProfile.create({
      data: {
        storeName: "西和園芸",
        phoneNumber: "0745-73-2468",
        email: "japanxcollege@gmail.com",
        postalCode: "639-0254",
        prefecture: "奈良県",
        city: "香芝市",
        address: "奈良県香芝市関屋北2丁目13-12",
        businessHours: {
          weekdays: "9:00〜18:00",
          saturday: "9:00〜17:00",
          sunday: "定休日",
        },
        closedDays: ["日曜日", "祝日"],
        googleMapsUrl: "https://maps.app.goo.gl/rY9dV5JHTRYB9bJv8",
        googleMapsReviewUrl: "https://maps.app.goo.gl/rY9dV5JHTRYB9bJv8",
        instagramUrl: "",
        lineUrl: "",
        description:
          "奈良県香芝市の花屋「西和園芸」。季節の花束、アレンジメント、ウェディングフラワー、法人装花など、お花に関することならお気軽にご相談ください。",
      },
    })
    console.log("Store profile created")
  }

  // ── Items (商品) ──
  const items = [
    {
      slug: "seasonal-bouquet",
      title: "季節の花束",
      description: "旬のお花を使った花束。贈り物やご自宅用に。",
      content:
        "季節ごとに厳選した旬のお花で、美しい花束をお作りします。予算やお好みに合わせてお作りいたしますので、お気軽にお電話ください。",
      priceFrom: 3000,
      priceTo: 10000,
      priceNote: "ご予算に応じてお作りします",
      category: "花束",
      tags: ["花束", "ギフト", "季節"],
      isPublished: true,
      isFeatured: true,
      sortOrder: 1,
      availabilityStatus: "AVAILABLE" as const,
    },
    {
      slug: "arrangement",
      title: "アレンジメント",
      description: "そのまま飾れるフラワーアレンジメント。",
      content:
        "花瓶がなくてもそのまま飾れるアレンジメント。お見舞い、お祝い、お供えなど、用途に合わせてお作りします。",
      priceFrom: 3000,
      priceTo: 15000,
      priceNote: "用途・ご予算に合わせてお作りします",
      category: "アレンジメント",
      tags: ["アレンジメント", "ギフト"],
      isPublished: true,
      isFeatured: true,
      sortOrder: 2,
      availabilityStatus: "AVAILABLE" as const,
    },
    {
      slug: "funeral-flowers",
      title: "お供え・仏花",
      description: "心を込めたお供えのお花。",
      content:
        "故人を偲ぶ心を込めて、お供えのお花をお作りします。法事・お盆・お彼岸など、季節の仏花もご用意しております。",
      priceFrom: 2000,
      priceTo: 10000,
      category: "お供え",
      tags: ["お供え", "仏花"],
      isPublished: true,
      sortOrder: 3,
      availabilityStatus: "AVAILABLE" as const,
    },
    {
      slug: "potted-plants",
      title: "鉢物・観葉植物",
      description: "育てる楽しみのある鉢物や観葉植物。",
      content:
        "季節の鉢花や観葉植物を取り揃えております。ご自宅のインテリアや贈り物にどうぞ。育て方のアドバイスもいたします。",
      priceFrom: 1000,
      priceTo: 20000,
      category: "鉢物",
      tags: ["鉢物", "観葉植物", "ガーデニング"],
      isPublished: true,
      sortOrder: 4,
      availabilityStatus: "AVAILABLE" as const,
    },
    {
      slug: "garden-supplies",
      title: "ガーデニング用品",
      description: "土、肥料、園芸資材を各種取り揃え。",
      content:
        "培養土、肥料、鉢、プランターなど、ガーデニングに必要なものを幅広く取り揃えております。お庭づくりのご相談もお気軽にどうぞ。",
      priceFrom: 300,
      priceTo: 5000,
      category: "園芸用品",
      tags: ["園芸用品", "土", "肥料"],
      isPublished: true,
      sortOrder: 5,
      availabilityStatus: "AVAILABLE" as const,
    },
  ]

  for (const item of items) {
    await prisma.item.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    })
  }
  console.log(`${items.length} items created`)

  // ── Works (制作事例) ──
  const works = [
    {
      slug: "wedding-spring-2024",
      title: "春のウェディング装花",
      description: "桜と春の花を使った会場装花とブーケ。",
      content:
        "春らしいピンクと白を基調に、桜の枝物を使ったメインテーブル装花とブーケをお作りしました。",
      category: "WEDDING" as const,
      isPublished: true,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      slug: "corporate-opening",
      title: "店舗オープン祝い花",
      description: "新規オープンの店舗へのお祝いスタンド花。",
      content: "華やかなスタンド花で新しい門出をお祝いしました。",
      category: "CORPORATE" as const,
      isPublished: true,
      sortOrder: 2,
    },
    {
      slug: "exhibition-display",
      title: "展示会ディスプレイ",
      description: "地域の文化祭での花のディスプレイ制作。",
      content:
        "地域の文化祭に合わせて、大型のフラワーディスプレイを制作しました。",
      category: "EXHIBITION" as const,
      isPublished: true,
      sortOrder: 3,
    },
  ]

  for (const work of works) {
    await prisma.work.upsert({
      where: { slug: work.slug },
      update: {},
      create: work,
    })
  }
  console.log(`${works.length} works created`)

  // ── Events ──
  const events = [
    {
      slug: "spring-workshop-2026",
      title: "春のフラワーアレンジメント教室",
      description: "春の花を使ったアレンジメントを体験できるワークショップ。",
      content:
        "初心者の方でも楽しめるフラワーアレンジメント教室です。お花の選び方から基本的なアレンジ技法まで、丁寧にお教えします。",
      eventType: "WORKSHOP" as const,
      startDate: new Date("2026-04-15T10:00:00"),
      endDate: new Date("2026-04-15T12:00:00"),
      location: "西和園芸 店内",
      capacity: 8,
      priceInfo: "3,500円（花材費込み）",
      isPublished: true,
      isFeatured: true,
      sortOrder: 1,
      status: "UPCOMING" as const,
    },
    {
      slug: "mothers-day-2026",
      title: "母の日ギフト早期予約受付",
      description: "母の日のお花ギフト、早期ご予約で特典あり。",
      content:
        "母の日に贈る特別なお花をご用意いたします。早期ご予約いただいたお客様には、メッセージカードをサービス。",
      eventType: "OTHER" as const,
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-05-10"),
      location: "西和園芸",
      priceInfo: "3,000円〜",
      isPublished: true,
      isFeatured: true,
      sortOrder: 2,
      status: "UPCOMING" as const,
    },
  ]

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: event,
    })
  }
  console.log(`${events.length} events created`)

  // ── News ──
  const news = [
    {
      slug: "spring-opening-2026",
      title: "春の営業時間のお知らせ",
      content: "3月より春の営業時間に変更いたします。平日 9:00〜18:00、土曜 9:00〜17:00となります。",
      category: "ANNOUNCEMENT" as const,
      isPublished: true,
      publishedAt: new Date("2026-03-01"),
      sortOrder: 1,
    },
    {
      slug: "new-plants-arrived",
      title: "春の苗・鉢花入荷しました",
      content:
        "春の花壇にぴったりの苗と鉢花が入荷しました。パンジー、ビオラ、ペチュニアなど、色とりどりの花たちをご用意しております。",
      category: "NEWS" as const,
      isPublished: true,
      publishedAt: new Date("2026-02-20"),
      sortOrder: 2,
    },
  ]

  for (const post of news) {
    await prisma.newsPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    })
  }
  console.log(`${news.length} news posts created`)

  // ── Services ──
  const services = [
    {
      slug: "wedding-flowers",
      title: "ウェディングフラワー",
      description:
        "ブーケ、会場装花、ブートニアなど、結婚式のお花をトータルでコーディネート。",
      content:
        "お二人の大切な日を、お花で彩ります。ブーケ、ブートニア、会場装花、受付花など、ウェディングに関するお花のことならすべてお任せください。事前のお打ち合わせで、お好みやテーマに合わせた提案をいたします。",
      serviceType: "WEDDING" as const,
      isPublished: true,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      slug: "corporate-flowers",
      title: "法人・店舗装花",
      description: "オフィスや店舗の定期装花、イベント花、お祝い花。",
      content:
        "オフィスや店舗の空間を、お花で華やかに演出します。定期的な装花から、オープン祝い、パーティーの装花まで対応いたします。",
      serviceType: "CORPORATE" as const,
      isPublished: true,
      sortOrder: 2,
    },
    {
      slug: "gift-flowers",
      title: "ギフト・贈答花",
      description: "誕生日、記念日、お見舞い、お供えなど、各種贈答用のお花。",
      content:
        "大切な方への贈り物に、心を込めたお花をお届けします。用途やご予算に合わせて、最適なお花をお作りいたします。配達も承っております。",
      serviceType: "GIFT" as const,
      isPublished: true,
      isFeatured: true,
      sortOrder: 3,
    },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    })
  }
  console.log(`${services.length} services created`)

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
