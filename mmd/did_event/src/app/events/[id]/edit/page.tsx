// src/app/events/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { TicketEditor } from "@/components/events/edit/TicketEditor";
import { LocationAutocomplete } from "@/components/events/LocationAutocomplete";

interface Ticket {
  id?: string;
  name: string;
  price: number;
  limit: number | null;
  description?: string | null;
}

// Helper to get current ISO string in JST (UTC+9)
// Used for default values in date inputs
const getNowJST = () => {
  const now = new Date();
  now.setHours(now.getHours() + 9);
  return now.toISOString().slice(0, 16);
};

// Helper to convert UTC date string/object to JST ISO string for input
// Takes a UTC date, adds 9 hours, and returns the ISO string slice (YYYY-MM-DDTHH:mm)
// This makes the input display the "JST time" as if it were local
const toJSTInputValue = (dateStr: string | Date | null | undefined) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  // Add 9 hours (JST offset)
  const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jstDate.toISOString().slice(0, 16);
};

// Helper to convert JST input value back to UTC ISO string for API
// Takes the input value (which represents JST time), subtracts 9 hours to get real UTC
const fromJSTInputValue = (value: string) => {
  if (!value) return null;
  const date = new Date(value + ":00Z"); // Treat input as UTC first to get "face value"
  if (isNaN(date.getTime())) return null;

  // Subtract 9 hours to convert "JST face value" to true UTC
  const utcDate = new Date(date.getTime() - 9 * 60 * 60 * 1000);
  return utcDate.toISOString();
};

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [generateMeet, setGenerateMeet] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifying, setNotifying] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState("");
  const [uploading, setUploading] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Payment settings state
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<string[]>([]);
  const [bankDetails, setBankDetails] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    startAt: "",
    endAt: "",
    location: "",
    googleMapsUrl: "", // Added googleMapsUrl
    format: "offline",
    onlineUrl: "",
    website: "",
    capacity: "",
    category: "",
    tags: [] as string[],
    status: "draft",
    requirePassphrase: false,
    passphrase: "",
    passphraseValidFrom: "",
    passphraseValidUntil: "",
    registrationDeadline: "",
    paymentDeadline: "",
    projectId: "",
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      // イベント情報を取得
      fetch(`/api/events/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          // 日時をフォーム用にフォーマット (UTC -> JST display)
          // We force display as JST by shifting +9h and taking the ISO string part
          const startAt = toJSTInputValue(data.startAt);
          const endAt = toJSTInputValue(data.endAt);

          if (data.tickets) {
            setTickets(data.tickets.map((t: any) => ({
              id: t.id,
              name: t.name,
              price: t.price,
              limit: t.limit,
              description: t.description
            })));
          }

          setFormData({
            title: data.title,
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            startAt,
            endAt,
            location: data.location || "",
            googleMapsUrl: data.googleMapsUrl || "", // Populate googleMapsUrl
            format: data.format,
            onlineUrl: data.onlineUrl || "",
            website: data.website || "",
            capacity: data.capacity?.toString() || "",
            category: data.category || "",
            tags: data.tags ? JSON.parse(data.tags) : [],
            status: data.status,
            requirePassphrase: data.requirePassphrase || false,
            passphrase: data.passphrase || "",
            passphraseValidFrom: toJSTInputValue(data.passphraseValidFrom),
            passphraseValidUntil: toJSTInputValue(data.passphraseValidUntil),
            registrationDeadline: toJSTInputValue(data.registrationDeadline),
            paymentDeadline: toJSTInputValue(data.paymentDeadline),
            projectId: data.projectId || "",
          });

          // Load payment settings
          try {
            const methods = data.acceptedPaymentMethods ? JSON.parse(data.acceptedPaymentMethods) : [];
            setAcceptedPaymentMethods(Array.isArray(methods) ? methods : []);
          } catch (e) {
            setAcceptedPaymentMethods([]);
          }
          setBankDetails(data.bankDetails || "");

          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching event:", error);
          setError("イベント情報の取得に失敗しました");
          setLoading(false);
        });
    }
  }, [status, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // タグを JSON 文字列に変換
      const submitData = {
        ...formData,
        tags: formData.tags.length > 0 ? JSON.stringify(formData.tags) : null,
        // Convert JST input values back to UTC for API
        startAt: new Date(fromJSTInputValue(formData.startAt) || "").toISOString(),
        endAt: formData.endAt ? new Date(fromJSTInputValue(formData.endAt) || "").toISOString() : null,
        passphraseValidFrom: fromJSTInputValue(formData.passphraseValidFrom),
        passphraseValidUntil: fromJSTInputValue(formData.passphraseValidUntil),
        registrationDeadline: fromJSTInputValue(formData.registrationDeadline),
        paymentDeadline: fromJSTInputValue(formData.paymentDeadline),
        tickets, // Include tickets in submission
        acceptedPaymentMethods: JSON.stringify(acceptedPaymentMethods),
        bankDetails,
        googleMapsUrl: formData.googleMapsUrl || null,
      };

      const res = await fetch(`/api/events/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...submitData, generateMeet }),
      });

      if (res.ok) {
        router.push(`/events/${params.id}`);
      } else {
        const data = await res.json();
        setError(data.error || "イベントの更新に失敗しました");
        setSubmitting(false);
      }
    } catch (err) {
      setError("イベントの更新に失敗しました");
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("本当にこのイベントを削除しますか？この操作は取り消せません。")) {
      return;
    }

    try {
      const res = await fetch(`/api/events/${params.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "イベントの削除に失敗しました");
      }
    } catch (err) {
      setError("イベントの削除に失敗しました");
    }
  };

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifying(true);
    setError("");
    setNotifySuccess("");

    try {
      const res = await fetch(`/api/events/${params.id}/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: notifyMessage }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotifySuccess(`${data.sentCount}人に通知を送信しました（全参加者: ${data.totalParticipants}人）`);
        setNotifyMessage("");
      } else {
        const data = await res.json();
        setError(data.error || "通知の送信に失敗しました");
      }
    } catch (err) {
      setError("通知の送信に失敗しました");
    } finally {
      setNotifying(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">イベント編集</h1>
          <p className="text-gray-600 mt-2">イベント情報を編集します</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                イベント名 *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            {/* Description Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明
              </label>
              <div className="min-h-[400px]">
                <RichTextEditor
                  content={formData.description}
                  onChange={(html) => setFormData({ ...formData, description: html })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                画像URL
              </label>
              <div className="flex gap-2">
                <input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="https://..."
                />
                <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
                  <span>{uploading ? "アップロード中..." : "アップロード"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setUploading(true);
                      try {
                        const formDataUpload = new FormData();
                        formDataUpload.append("file", file);

                        const res = await fetch("/api/upload", {
                          method: "POST",
                          body: formDataUpload,
                        });

                        if (!res.ok) {
                          const errorData = await res.json().catch(() => ({}));
                          throw new Error(errorData.error || "Upload failed");
                        }

                        const data = await res.json();
                        setFormData({ ...formData, imageUrl: data.url });
                      } catch (err) {
                        console.error("Upload error:", err);
                        alert("画像のアップロードに失敗しました");
                      } finally {
                        setUploading(false);
                      }
                    }}
                    disabled={uploading}
                  />
                </label>
              </div>
              {formData.imageUrl && (
                <div className="mt-4 relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startAt" className="block text-sm font-medium text-gray-700 mb-2">
                  開始日時 * <span className="text-xs text-gray-500 font-normal">(JST +9)</span>
                </label>
                <input
                  id="startAt"
                  type="datetime-local"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="endAt" className="block text-sm font-medium text-gray-700 mb-2">
                  終了日時 <span className="text-xs text-gray-500 font-normal">(JST +9)</span>
                </label>
                <input
                  id="endAt"
                  type="datetime-local"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Deadlines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="md:col-span-2 text-md font-medium text-yellow-900 border-b border-yellow-200 pb-2 mb-2">
                締め切り設定 (オプション)
              </h3>

              <div>
                <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                  参加登録締め切り <span className="text-xs text-gray-500 font-normal">(JST +9)</span>
                </label>
                <input
                  id="registrationDeadline"
                  type="datetime-local"
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                  className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="paymentDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                  支払い締め切り <span className="text-xs text-gray-500 font-normal">(JST +9)</span>
                </label>
                <input
                  id="paymentDeadline"
                  type="datetime-local"
                  value={formData.paymentDeadline}
                  onChange={(e) => setFormData({ ...formData, paymentDeadline: e.target.value })}
                  className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
                開催形式 *
              </label>
              <select
                id="format"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              >
                <option value="online">オンライン</option>
                <option value="offline">オフライン</option>
                <option value="hybrid">ハイブリッド</option>
              </select>
            </div>

            {(formData.format === "online" || formData.format === "hybrid") && (
              <div>
                <label htmlFor="onlineUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  オンライン会議URL
                </label>
                <input
                  id="onlineUrl"
                  type="url"
                  value={formData.onlineUrl}
                  onChange={(e) => setFormData({ ...formData, onlineUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Google MeetのURLなど"
                />

                {/* Google Meet Auto-Generate Checkbox */}
                <div className="mt-4 flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="generateMeet"
                    checked={generateMeet}
                    onChange={(e) => setGenerateMeet(e.target.checked)}
                    className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="generateMeet"
                      className="font-medium text-gray-900 cursor-pointer flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Google Meetを自動発行
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      dev@mmdao.orgのアカウントで本物のGoogle Meetリンクを自動生成します
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(formData.format === "offline" || formData.format === "hybrid") && (
              <>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    場所
                  </label>
                  <LocationAutocomplete
                    value={formData.location}
                    onChange={(v) => setFormData({ ...formData, location: v })}
                    placeholder="会場名・住所を入力（Googleで検索して自動入力）"
                    inputClassName="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="googleMapsUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Google Maps URL (オプション)
                  </label>
                  <input
                    id="googleMapsUrl"
                    type="url"
                    value={formData.googleMapsUrl}
                    onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                イベント関連ホームページURL（オプション）
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="https://example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                イベントの詳細情報や申し込みページのURLを入力できます
              </p>
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                定員
              </label>
              <input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="無制限の場合は空欄"
                min="1"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリー
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">未選択</option>
                <option value="テクノロジー">テクノロジー</option>
                <option value="ビジネス">ビジネス</option>
                <option value="教育">教育</option>
                <option value="デザイン">デザイン</option>
                <option value="マーケティング">マーケティング</option>
                <option value="エンターテイメント">エンターテイメント</option>
                <option value="スポーツ">スポーツ</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                タグ
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    id="tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                          setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
                          setTagInput("");
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="タグを入力してEnterで追加"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
                        setTagInput("");
                      }
                    }}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                  >
                    追加
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              tags: formData.tags.filter((_, i) => i !== index),
                            });
                          }}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Passphrase Section */}
            {(formData.format === "online" || formData.format === "hybrid") && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requirePassphrase}
                      onChange={(e) =>
                        setFormData({ ...formData, requirePassphrase: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      参加証明に合言葉を設定する（オプション）
                    </span>
                  </label>
                  <p className="text-xs text-gray-600 mt-1 ml-6">
                    イベント参加後、合言葉を入力した人のみがVCを取得できます
                  </p>
                </div>

                {formData.requirePassphrase && (
                  <div className="space-y-4 ml-6 p-4 bg-white rounded-lg border border-blue-100">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        合言葉 *
                      </label>
                      <input
                        type="text"
                        value={formData.passphrase}
                        onChange={(e) =>
                          setFormData({ ...formData, passphrase: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="例: event2024"
                        required={formData.requirePassphrase}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          有効開始時刻（オプション）
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.passphraseValidFrom}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              passphraseValidFrom: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          未設定の場合は即時有効
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          有効終了時刻（オプション）
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.passphraseValidUntil}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              passphraseValidUntil: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          未設定の場合は無期限
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              >
                <option value="draft">下書き</option>
                <option value="published">公開</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>

            {/* Payment Settings */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">支払い設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    利用可能な支払い方法
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={acceptedPaymentMethods.includes("stripe")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAcceptedPaymentMethods([...acceptedPaymentMethods, "stripe"]);
                          } else {
                            setAcceptedPaymentMethods(acceptedPaymentMethods.filter((m) => m !== "stripe"));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>クレジットカード (Stripe)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={acceptedPaymentMethods.includes("bank")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAcceptedPaymentMethods([...acceptedPaymentMethods, "bank"]);
                          } else {
                            setAcceptedPaymentMethods(acceptedPaymentMethods.filter((m) => m !== "bank"));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>銀行振込</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={acceptedPaymentMethods.includes("on_site")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAcceptedPaymentMethods([...acceptedPaymentMethods, "on_site"]);
                          } else {
                            setAcceptedPaymentMethods(acceptedPaymentMethods.filter((m) => m !== "on_site"));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>現地払い</span>
                    </label>
                  </div>
                </div>

                {acceptedPaymentMethods.includes("bank") && (
                  <div>
                    <label htmlFor="bankDetails" className="block text-sm font-medium text-gray-700 mb-2">
                      振込先情報
                    </label>
                    <textarea
                      id="bankDetails"
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      rows={4}
                      placeholder="銀行名、支店名、口座種別、口座番号、口座名義人などを入力してください"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <TicketEditor
                tickets={tickets}
                onChange={setTickets}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "更新中..." : "更新する"}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/events/${params.id}`)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                戻る
              </button>
            </div>
          </form>

          {/* LINE 通知セクション */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">参加者へLINE通知</h2>
            <p className="text-sm text-gray-600 mb-4">
              このイベントの参加者で、LINE連携しているユーザーに通知を送信できます。
            </p>

            {notifySuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                {notifySuccess}
              </div>
            )}

            <form onSubmit={handleNotify} className="space-y-4">
              <div>
                <label htmlFor="notifyMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  通知メッセージ *
                </label>
                <textarea
                  id="notifyMessage"
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  rows={4}
                  placeholder="参加者に送信するメッセージを入力してください"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={notifying || !notifyMessage.trim()}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {notifying ? "送信中..." : "参加者に通知を送信"}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              イベントを削除
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
