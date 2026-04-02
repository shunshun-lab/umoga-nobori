// src/app/events/[id]/edit/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { TicketEditor } from "@/components/events/edit/TicketEditor";
import { LocationAutocomplete } from "@/components/events/LocationAutocomplete";
import { VisibilitySettings, type EventVisibility } from "@/components/events/create/VisibilitySettings";

interface Ticket {
  id?: string;
  name: string;
  price: number;
  limit: number | null;
  description?: string | null;
}

interface RegistrationQuestionItem {
  id?: string;
  type: string;
  label: string;
  options: string[];
  required: boolean;
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

export default function EditEventPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
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
  // 元データ保持 — 更新時に差分検出して通知確認に使う
  const [originalData, setOriginalData] = useState<Record<string, any> | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [registrationQuestions, setRegistrationQuestions] = useState<RegistrationQuestionItem[]>([]);

  // Payment settings state
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<string[]>([]);
  const [bankDetails, setBankDetails] = useState("");

  const [coOrganizerIds, setCoOrganizerIds] = useState<string[]>([]);
  const [coOrganizerCommunityIds, setCoOrganizerCommunityIds] = useState<string[]>([]);
  const [coOrganizerUsers, setCoOrganizerUsers] = useState<Array<{ id: string; name: string; image?: string | null }>>([]);
  const [coOrganizerCommunities, setCoOrganizerCommunities] = useState<Array<{ id: string; name: string; imageUrl?: string | null }>>([]);
  const [coUserQuery, setCoUserQuery] = useState("");
  const [coCommQuery, setCoCommQuery] = useState("");
  const [coUserResults, setCoUserResults] = useState<Array<{ id: string; name: string; image?: string | null; email?: string | null }>>([]);
  const [coCommResults, setCoCommResults] = useState<Array<{ id: string; name: string; imageUrl?: string | null }>>([]);
  const [coUserFocused, setCoUserFocused] = useState(false);
  const [coCommFocused, setCoCommFocused] = useState(false);

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
    offlineCapacity: "",
    onlineCapacity: "",
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
    prefecture: "",
    visibility: "public" as EventVisibility,
    allowedRoleIds: [] as string[],
    organizerCommunityId: "",
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
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

          if (data.questions && data.questions.length > 0) {
            setRegistrationQuestions(data.questions.map((q: any) => ({
              id: q.id,
              type: q.type.toLowerCase(),
              label: q.label,
              options: q.options || [],
              required: q.required || false,
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
            offlineCapacity: data.offlineCapacity?.toString() || "",
            onlineCapacity: data.onlineCapacity?.toString() || "",
            category: data.category || "",
            tags: data.tags ? JSON.parse(data.tags) : [],
            status: data.status,
            requirePassphrase: !!data.keyword,
            passphrase: data.keyword || "",
            passphraseValidFrom: toJSTInputValue(data.passphraseValidFrom),
            passphraseValidUntil: toJSTInputValue(data.passphraseValidUntil),
            registrationDeadline: toJSTInputValue(data.registrationDeadline),
            paymentDeadline: toJSTInputValue(data.paymentDeadline),
            projectId: data.projectId || "",
            prefecture: data.prefecture || "",
            visibility: data.visibility || (data.isPublic === false ? "private" : "public"),
            allowedRoleIds: data.allowedRoles?.map((r: any) => r.id) || [],
            organizerCommunityId: data.organizerCommunityId || "",
          });

          // Load payment settings
          try {
            const methods = data.acceptedPaymentMethods ? JSON.parse(data.acceptedPaymentMethods) : [];
            setAcceptedPaymentMethods(Array.isArray(methods) ? methods : []);
          } catch (e) {
            setAcceptedPaymentMethods([]);
          }
          setBankDetails(data.bankDetails || "");

          // 元データを保持（差分検出用）
          setOriginalData({
            onlineUrl: data.onlineUrl || "",
            startAt: data.startAt,
            endAt: data.endAt,
            location: data.location || "",
            format: data.format,
          });

          // Load co-organizers
          if (data.coOrganizers) {
            setCoOrganizerUsers(data.coOrganizers.map((u: any) => ({ id: u.id, name: u.name, image: u.image })));
            setCoOrganizerIds(data.coOrganizers.map((u: any) => u.id));
          }
          if (data.coOrganizerCommunities) {
            setCoOrganizerCommunities(data.coOrganizerCommunities.map((c: any) => ({ id: c.id, name: c.name, imageUrl: c.bannerUrl })));
            setCoOrganizerCommunityIds(data.coOrganizerCommunities.map((c: any) => c.id));
          }

          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching event:", error);
          setError("イベント情報の取得に失敗しました");
          setLoading(false);
        });
    }
  }, [status, params.id]);

  // Co-organizer search (フォーカス時にサジェスト + 1文字から検索)
  useEffect(() => {
    if (!coUserFocused) return;
    const t = setTimeout(async () => {
      try {
        const params = coUserQuery.length >= 1 ? `?q=${encodeURIComponent(coUserQuery)}&limit=10` : '?limit=10';
        const r = await fetch(`/api/users/search${params}`);
        const d = await r.json();
        if (d.users) setCoUserResults(d.users.filter((u: any) => !coOrganizerIds.includes(u.id)));
      } catch {}
    }, coUserQuery.length === 0 ? 0 : 300);
    return () => clearTimeout(t);
  }, [coUserQuery, coOrganizerIds, coUserFocused]);

  useEffect(() => {
    if (!coCommFocused) return;
    const t = setTimeout(async () => {
      try {
        const params = coCommQuery.length >= 1 ? `?q=${encodeURIComponent(coCommQuery)}` : '';
        const r = await fetch(`/api/communities/search${params}`);
        const d = await r.json();
        if (d.communities) setCoCommResults(d.communities.filter((c: any) => !coOrganizerCommunityIds.includes(c.id)));
      } catch {}
    }, coCommQuery.length === 0 ? 0 : 300);
    return () => clearTimeout(t);
  }, [coCommQuery, coOrganizerCommunityIds, coCommFocused]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // 重要フィールドの変更検出
      const importantChanges: string[] = [];
      if (originalData) {
        if (formData.onlineUrl !== originalData.onlineUrl) {
          importantChanges.push(formData.onlineUrl ? "オンラインURLが更新されました" : "オンラインURLが削除されました");
        }
        if (formData.location !== originalData.location) {
          importantChanges.push("開催場所が変更されました");
        }
        if (formData.format !== originalData.format) {
          importantChanges.push("開催形式が変更されました");
        }
      }

      // 変更がある場合、参加者への通知を確認
      let notifyParticipants = false;
      if (importantChanges.length > 0) {
        notifyParticipants = confirm(
          `以下の重要な変更があります:\n\n${importantChanges.map(c => `・${c}`).join("\n")}\n\n参加者にこの変更を通知しますか？`
        );
      }

      // タグを JSON 文字列に変換
      // 合言葉方式の場合は passphrase を keyword に変換、QR方式の場合は keyword を null に
      const keywordValue = formData.requirePassphrase && formData.passphrase ? formData.passphrase : null;
      const submitData = {
        ...formData,
        keyword: keywordValue,
        offlineCapacity: formData.offlineCapacity ? Number(formData.offlineCapacity) : null,
        onlineCapacity: formData.onlineCapacity ? Number(formData.onlineCapacity) : null,
        tags: formData.tags.length > 0 ? JSON.stringify(formData.tags) : null,
        startAt: new Date(fromJSTInputValue(formData.startAt) || "").toISOString(),
        endAt: formData.endAt ? new Date(fromJSTInputValue(formData.endAt) || "").toISOString() : null,
        passphraseValidFrom: fromJSTInputValue(formData.passphraseValidFrom),
        passphraseValidUntil: fromJSTInputValue(formData.passphraseValidUntil),
        registrationDeadline: fromJSTInputValue(formData.registrationDeadline),
        paymentDeadline: fromJSTInputValue(formData.paymentDeadline),
        tickets,
        questions: registrationQuestions.filter(q => q.label.trim()).map(q => ({
          id: q.id,
          type: q.type || "text",
          label: q.label.trim(),
          options: q.options || [],
          required: q.required || false,
        })),
        acceptedPaymentMethods: JSON.stringify(acceptedPaymentMethods),
        bankDetails,
        googleMapsUrl: formData.googleMapsUrl || null,
        prefecture: formData.prefecture || null,
        notifyParticipants,
        notifyMessage: notifyParticipants ? importantChanges.join("\n") : undefined,
      };

      const res = await fetch(`/api/events/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...submitData,
          generateMeet,
          coOrganizerIds,
          coOrganizerCommunityIds,
          visibility: formData.visibility,
          allowedRoleIds: formData.allowedRoleIds,
        }),
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

            {/* Co-organizers */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
              <h3 className="text-sm font-bold text-gray-700">共催者（任意）</h3>

              {/* User co-organizers */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">共催ユーザー</label>
                <div className="relative">
                  <input
                    type="text"
                    value={coUserQuery}
                    onChange={(e) => setCoUserQuery(e.target.value)}
                    onFocus={() => setCoUserFocused(true)}
                    onBlur={() => setTimeout(() => setCoUserFocused(false), 200)}
                    placeholder="ユーザー名で検索（入力で候補表示）"
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {coUserFocused && coUserResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white mt-1 border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {coUserResults.map((u) => (
                        <button key={u.id} type="button" onClick={() => {
                          setCoOrganizerIds((p) => [...p, u.id]);
                          setCoOrganizerUsers((p) => [...p, u]);
                          setCoUserQuery(""); setCoUserResults([]); setCoUserFocused(false);
                        }} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm">
                          {u.image ? <img src={u.image} alt="" className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">{u.name?.[0]}</div>}
                          <span>{u.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {coOrganizerUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {coOrganizerUsers.map((u) => (
                      <span key={u.id} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        {u.name}
                        <button type="button" onClick={() => {
                          setCoOrganizerIds((p) => p.filter((id) => id !== u.id));
                          setCoOrganizerUsers((p) => p.filter((x) => x.id !== u.id));
                        }} className="hover:text-blue-900 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Community co-organizers */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">共催コミュニティ</label>
                <div className="relative">
                  <input
                    type="text"
                    value={coCommQuery}
                    onChange={(e) => setCoCommQuery(e.target.value)}
                    onFocus={() => setCoCommFocused(true)}
                    onBlur={() => setTimeout(() => setCoCommFocused(false), 200)}
                    placeholder="コミュニティ名で検索（入力で候補表示）"
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {coCommFocused && coCommResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white mt-1 border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {coCommResults.map((c) => (
                        <button key={c.id} type="button" onClick={() => {
                          setCoOrganizerCommunityIds((p) => [...p, c.id]);
                          setCoOrganizerCommunities((p) => [...p, c]);
                          setCoCommQuery(""); setCoCommResults([]); setCoCommFocused(false);
                        }} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm">
                          {c.imageUrl ? <img src={c.imageUrl} alt="" className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">{c.name?.[0]}</div>}
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {coOrganizerCommunities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {coOrganizerCommunities.map((c) => (
                      <span key={c.id} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        {c.name}
                        <button type="button" onClick={() => {
                          setCoOrganizerCommunityIds((p) => p.filter((id) => id !== c.id));
                          setCoOrganizerCommunities((p) => p.filter((x) => x.id !== c.id));
                        }} className="hover:text-green-900 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                )}
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
                  オンライン会議URL <span className="font-normal text-gray-400">(任意)</span>
                </label>
                <input
                  id="onlineUrl"
                  type="url"
                  value={formData.onlineUrl}
                  onChange={(e) => setFormData({ ...formData, onlineUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Google MeetのURLなど（後から追加・更新できます）"
                />
                <p className="text-xs text-gray-500 mt-1">URLを追加・変更した場合、保存時に参加者への通知を確認します</p>

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    都道府県
                  </label>
                  <select
                    value={formData.prefecture}
                    onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="">都道府県を選択</option>
                    {["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
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

            {formData.format === "hybrid" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">会場定員</label>
                  <input
                    type="number"
                    value={formData.offlineCapacity}
                    onChange={(e) => setFormData({ ...formData, offlineCapacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="無制限"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">オンライン定員</label>
                  <input
                    type="number"
                    value={formData.onlineCapacity}
                    onChange={(e) => setFormData({ ...formData, onlineCapacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="無制限"
                    min="1"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">定員</label>
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
            )}

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

            {/* チェックイン方式 */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-bold text-gray-900 mb-3">チェックイン方式</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="radio"
                    name="checkinMethod"
                    checked={!formData.requirePassphrase}
                    onChange={() => setFormData({ ...formData, requirePassphrase: false, passphrase: "" })}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">QRコード方式</span>
                    <p className="text-xs text-gray-500 mt-0.5">参加者がQRコードを提示し、主催者がスキャンしてチェックイン</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="radio"
                    name="checkinMethod"
                    checked={formData.requirePassphrase}
                    onChange={() => setFormData({ ...formData, requirePassphrase: true })}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">合言葉方式</span>
                    <p className="text-xs text-gray-500 mt-0.5">主催者が合言葉を設定し、参加者が入力してセルフチェックイン</p>
                  </div>
                </label>
              </div>

              {formData.requirePassphrase && (
                <div className="mt-4 space-y-4 p-4 bg-white rounded-lg border border-blue-100">
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
                </div>
              )}
            </div>

            {/* ステータス設定（公開/下書き） */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">ステータス</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formData.status === "published"
                      ? "このイベントは公開中です。"
                      : "このイベントは下書きです。公開するまで誰にも見えません。"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    status: formData.status === "published" ? "draft" : "published"
                  })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    formData.status === "published" ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.status === "published" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 公開範囲設定 */}
            <VisibilitySettings
              visibility={formData.visibility}
              setVisibility={(val) => setFormData(p => ({ ...p, visibility: val }))}
              selectedRoleIds={formData.allowedRoleIds}
              setSelectedRoleIds={(ids) => setFormData(p => ({ ...p, allowedRoleIds: ids }))}
              communityId={formData.organizerCommunityId}
            />

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

            {/* アンケート設定 */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アンケート設定</h3>
              <p className="text-sm text-gray-500 mb-4">
                参加登録時に回答してもらう質問を設定できます。既に回答がある質問を削除すると、その回答も削除されます。
              </p>

              {registrationQuestions.map((q, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-600">質問 {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationQuestions(registrationQuestions.filter((_, i) => i !== index));
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      削除
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">質問文</label>
                      <input
                        type="text"
                        value={q.label}
                        onChange={(e) => {
                          const updated = [...registrationQuestions];
                          updated[index] = { ...updated[index], label: e.target.value };
                          setRegistrationQuestions(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="例: 食事制限はありますか？"
                      />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">回答形式</label>
                        <select
                          value={q.type}
                          onChange={(e) => {
                            const updated = [...registrationQuestions];
                            updated[index] = { ...updated[index], type: e.target.value };
                            setRegistrationQuestions(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        >
                          <option value="text">テキスト（自由記述）</option>
                          <option value="radio">ラジオボタン（単一選択）</option>
                          <option value="select">ドロップダウン（単一選択）</option>
                          <option value="checkbox">チェックボックス（複数選択）</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => {
                              const updated = [...registrationQuestions];
                              updated[index] = { ...updated[index], required: e.target.checked };
                              setRegistrationQuestions(updated);
                            }}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">必須</span>
                        </label>
                      </div>
                    </div>

                    {(q.type === "radio" || q.type === "select" || q.type === "checkbox") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          選択肢
                        </label>
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...registrationQuestions];
                                  const newOptions = [...updated[index].options];
                                  newOptions[optIdx] = e.target.value;
                                  updated[index] = { ...updated[index], options: newOptions };
                                  setRegistrationQuestions(updated);
                                }}
                                placeholder={`選択肢 ${optIdx + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...registrationQuestions];
                                  updated[index] = { ...updated[index], options: updated[index].options.filter((_, i) => i !== optIdx) };
                                  setRegistrationQuestions(updated);
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                aria-label="選択肢を削除"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...registrationQuestions];
                              updated[index] = { ...updated[index], options: [...updated[index].options, ""] };
                              setRegistrationQuestions(updated);
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            選択肢を追加
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setRegistrationQuestions([
                    ...registrationQuestions,
                    { type: "text", label: "", options: [], required: false },
                  ]);
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + 質問を追加
              </button>
            </div>

            {/* Spacer for sticky footer */}
            <div className="h-20" />
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

      {/* Sticky footer: 編集完了 + 戻る */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 z-50">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            type="button"
            onClick={(e) => {
              // Trigger form submit
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }}
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "保存中..." : "編集完了"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/events/${params.id}`)}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}
