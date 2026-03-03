import { prisma } from "@/lib/prisma"
import { Phone, MapPin, Clock } from "lucide-react"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "お店について",
  description: "西和園芸について。奈良県香芝市の花屋です。",
}

export default async function AboutPage() {
  const profile = await prisma.storeProfile.findFirst()
  const bh = (profile?.businessHours as Record<string, string>) || {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">お店について</h1>

      <div className="space-y-8">
        {profile?.description && (
          <div>
            <p className="text-lg leading-relaxed">{profile.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-lg mb-3">店舗情報</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-muted-foreground">店名</dt>
                  <dd className="font-medium">
                    {profile?.storeName || "西和園芸"}
                  </dd>
                </div>
                {profile?.address && (
                  <div>
                    <dt className="text-sm text-muted-foreground">住所</dt>
                    <dd className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                      <span>
                        {profile.postalCode && `〒${profile.postalCode} `}
                        {profile.address}
                      </span>
                    </dd>
                  </div>
                )}
                {profile?.phoneNumber && (
                  <div>
                    <dt className="text-sm text-muted-foreground">電話番号</dt>
                    <dd>
                      <a
                        href={`tel:${profile.phoneNumber.replace(/-/g, "")}`}
                        className="flex items-center gap-2 text-primary font-medium"
                      >
                        <Phone className="h-4 w-4" />
                        {profile.phoneNumber}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {Object.keys(bh).length > 0 && (
              <div>
                <h2 className="font-bold text-lg mb-3">営業時間</h2>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                  <dl className="space-y-1">
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
                </div>
              </div>
            )}
          </div>

          {/* Map embed */}
          {profile?.googleMapsUrl && (
            <div>
              <h2 className="font-bold text-lg mb-3">アクセス</h2>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
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
              <a
                href={profile.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                Google Mapsで開く
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
