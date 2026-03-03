import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [profile, featuredItems, featuredEvents, latestNews, featuredServices] =
    await Promise.all([
      prisma.storeProfile.findFirst(),
      prisma.item.findMany({
        where: { isPublished: true, isFeatured: true },
        orderBy: { sortOrder: "asc" },
        take: 4,
      }),
      prisma.event.findMany({
        where: { isPublished: true, status: { in: ["UPCOMING", "ONGOING"] } },
        orderBy: { startDate: "asc" },
        take: 3,
      }),
      prisma.newsPost.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      prisma.service.findMany({
        where: { isPublished: true, isFeatured: true },
        orderBy: { sortOrder: "asc" },
        take: 3,
      }),
    ])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-50 to-green-100 py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {profile?.storeName || "西和園芸"}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {profile?.description ||
              "奈良県香芝市の花屋。季節の花束からウェディングまで、お花のことならお任せください。"}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {profile?.phoneNumber && (
              <a href={`tel:${profile.phoneNumber.replace(/-/g, "")}`}>
                <Button size="lg" className="text-lg px-8">
                  <Phone className="h-5 w-5 mr-2" />
                  {profile.phoneNumber}
                </Button>
              </a>
            )}
            <Link href="/items">
              <Button variant="outline" size="lg" className="text-lg px-8">
                お花を見る
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <section className="py-16 bg-background">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">買える花</h2>
              <Link
                href="/items"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                すべて見る <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <Link key={item.id} href={`/items/${item.slug}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-primary font-medium">
                        {item.priceFrom &&
                          `¥${item.priceFrom.toLocaleString()}`}
                        {item.priceTo &&
                          ` 〜 ¥${item.priceTo.toLocaleString()}`}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">イベント</h2>
              <Link
                href="/events"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                すべて見る <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-xs text-primary font-medium mb-2 uppercase">
                      {event.status === "UPCOMING" ? "開催予定" : "開催中"}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {event.description}
                    </p>
                    {event.startDate && (
                      <p className="text-sm">
                        {new Date(event.startDate).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                    {event.priceInfo && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.priceInfo}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {featuredServices.length > 0 && (
        <section className="py-16 bg-background">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">ご相談・サービス</h2>
              <Link
                href="/services"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                すべて見る <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News */}
      {latestNews.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">お知らせ</h2>
              <Link
                href="/news"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                すべて見る <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {latestNews.map((post) => (
                <Link key={post.id} href={`/news/${post.slug}`}>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg hover:shadow-sm transition-shadow">
                    <time className="text-sm text-muted-foreground whitespace-nowrap">
                      {post.publishedAt &&
                        new Date(post.publishedAt).toLocaleDateString("ja-JP")}
                    </time>
                    <h3 className="font-medium">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            お花のご注文・ご相談
          </h2>
          <p className="text-lg opacity-90 mb-6">
            お気軽にお電話ください
          </p>
          {profile?.phoneNumber && (
            <a href={`tel:${profile.phoneNumber.replace(/-/g, "")}`}>
              <Button
                variant="secondary"
                size="lg"
                className="text-xl px-10 py-6"
              >
                <Phone className="h-6 w-6 mr-2" />
                {profile.phoneNumber}
              </Button>
            </a>
          )}
        </div>
      </section>
    </div>
  )
}
