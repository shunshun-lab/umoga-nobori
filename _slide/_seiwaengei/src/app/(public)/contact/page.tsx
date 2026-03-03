import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, MapPin, Clock, Star } from "lucide-react"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "西和園芸へのお問い合わせ。お電話でのご注文・ご相談をお待ちしております。",
}

export default async function ContactPage() {
  const profile = await prisma.storeProfile.findFirst()
  const bh = (profile?.businessHours as Record<string, string>) || {}
  const closedDays = (profile?.closedDays as string[]) || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">お問い合わせ</h1>
      <p className="text-muted-foreground mb-8">
        お花のご注文・ご相談はお気軽にお問い合わせください。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="space-y-6">
          {/* Phone (primary CTA) */}
          {profile?.phoneNumber && (
            <Card className="border-primary">
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                <h2 className="font-bold text-lg mb-2">お電話でのお問い合わせ</h2>
                <a href={`tel:${profile.phoneNumber.replace(/-/g, "")}`}>
                  <Button size="lg" className="text-xl px-8">
                    {profile.phoneNumber}
                  </Button>
                </a>
                <p className="text-sm text-muted-foreground mt-3">
                  お花のご注文・ご相談をお待ちしております
                </p>
              </CardContent>
            </Card>
          )}

          {/* Google Review */}
          {profile?.googleMapsReviewUrl && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h3 className="font-medium">口コミ</h3>
                    <a
                      href={profile.googleMapsReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Googleマップで口コミを書く
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Store details */}
        <div className="space-y-6">
          {profile?.address && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">住所</h3>
                    <p>
                      {profile.postalCode && `〒${profile.postalCode}`}
                      <br />
                      {profile.address}
                    </p>
                    {profile.googleMapsUrl && (
                      <a
                        href={profile.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-2 inline-block"
                      >
                        Google Mapsで見る
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {Object.keys(bh).length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-2">営業時間</h3>
                    <dl className="space-y-1 text-sm">
                      {Object.entries(bh).map(([key, value]) => (
                        <div key={key} className="flex gap-4">
                          <dt className="text-muted-foreground w-12">
                            {key === "weekdays"
                              ? "平日"
                              : key === "saturday"
                                ? "土曜"
                                : "日曜"}
                          </dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                    {closedDays.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        定休日: {closedDays.join("、")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map */}
          {profile?.googleMapsUrl && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={`https://www.google.com/maps?q=西和園芸+奈良県香芝市関屋北&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
