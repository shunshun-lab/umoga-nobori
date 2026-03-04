"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { EventChat } from "@/components/EventChat";
import { generateIcsContent } from "@/lib/ics";
import { TicketSelector } from "@/components/events/detail/TicketSelector";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe-client";
import StripePaymentForm from "@/components/payment/StripePaymentForm";
import parse from "html-react-parser";
import { StickyRegistrationFooter } from "@/components/events/StickyRegistrationFooter";
import ShareButton from "@/components/ShareButton";
import { buildRecruitmentText } from "@/lib/recruitmentText";
import ReviewSection from "@/components/events/ReviewSection";
import HostsSection from "@/components/events/HostsSection";
import BlastsSection from "@/components/events/BlastsSection";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import { useExternalLinkTracking } from "@/hooks/useExternalLinkTracking";
import { trackCTAClick, trackExternalLinkClick, trackCopyAction, trackPageEngagement, trackFormStart, trackFormSubmit } from "@/lib/analytics";

// interface Event ... (defined below)
interface Event {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startAt: string;
  endAt: string | null;
  location: string | null;
  format: string;
  onlineUrl: string | null;
  website: string | null;
  capacity: number | null;
  status: string;
  category: string | null;
  tags: string | null;
  requirePassphrase: boolean;
  passphrase: string | null;
  passphraseValidFrom: string | null;
  passphraseValidUntil: string | null;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
    website: string | null;
  } | null;
  participants?: Array<{
    id: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
      email?: string | null;
    };
  }>;
  _count?: {
    participants: number;
  };
  organizerCommunity?: {
    id: string;
    name: string;
    hpUrl: string | null;
    imageUrl: string | null;
  } | null;
  communityId?: string | null;
  tickets?: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    limit: number | null;
    _count?: { participants: number };
  }>;
  acceptedPaymentMethods?: string | null;
  bankDetails?: string | null;
  // New/Updated fields
  venueTitle?: string | null;
  venueLat?: number | null;
  venueLng?: number | null;
  venueAddress?: string | null;
  googleMapsUrl?: string | null;
  registrationDeadline?: string | null;
  paymentDeadline?: string | null;
  approvalRequired?: boolean;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [detailedParticipants, setDetailedParticipants] = useState<any[]>([]);
  const [addingToCalendar, setAddingToCalendar] = useState(false);
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
  const calendarMenuRef = useRef<HTMLDivElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isOrganizerAdmin, setIsOrganizerAdmin] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  // Track scroll depth and external links
  useScrollDepth();
  useExternalLinkTracking();

  // Notification Modal State
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    if (event) {
      if (event.owner?.id === (session?.user as any)?.id) {
        setIsOrganizerAdmin(true);
      }
    }
  }, [event, session]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarMenuRef.current && !calendarMenuRef.current.contains(e.target as Node)) {
        setCalendarMenuOpen(false);
      }
    };
    if (calendarMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [calendarMenuOpen]);

  const [myParticipant, setMyParticipant] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/events/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setEvent(data);
          // 参加済みかチェック
          if (session?.user?.email && data.participants) {
            const participant = data.participants.find(
              (p: any) => p.user.id === (session.user as any)?.id
            );
            if (participant) {
              setMyParticipant(participant);
              setJoined(true);
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching event:", error);
          setLoading(false);
        });
    }
  }, [params.id, session]);

  // 主催者の場合、詳細な参加者情報を取得
  useEffect(() => {
    if (event && session?.user?.email) {
      // 主催者かチェック
      const ownerCheck = event.owner?.id && session.user.email;
      fetch(`/api/events/${params.id}/participants`)
        .then((res) => {
          if (res.ok) {
            setIsOwner(true);
            return res.json();
          }
          return null;
        })
        .then((data) => {
          if (data) {
            setDetailedParticipants(data);
          }
        })
        .catch(() => {
          // 主催者でない場合はエラーになるので無視
          setIsOwner(false);
        });
    }
  }, [event, session, params.id]);

  useEffect(() => {
    if (paymentMethod === "stripe" && selectedTicketId && event?.id) {
      setLoading(true); // Re-use loading or create a specific one
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicketId, eventId: event.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to create payment intent", error);
          setLoading(false);
        });
    } else {
      setClientSecret(null);
    }
  }, [paymentMethod, selectedTicketId, event?.id]);

  // ... imports

  // ... (inside component)
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref"); // Referrer ID
  const src = searchParams.get("src"); // Source (profile_share, etc)
  const urlIntentId = searchParams.get("intentId"); // Returning from login

  // ... existing states ...
  const [intentId, setIntentId] = useState<string | null>(urlIntentId);

  // Auto-Join Effect
  useEffect(() => {
    if (status === "authenticated" && urlIntentId && !joined && !joining) {
      // Attempt auto-join only if we have enough info (e.g. no tickets or default)
      // Or just try and let it fail if ticket needed?
      // To be safe and provide good UX, we might want to wait for user interaction IF ticket selection is complex.
      // But the requirement says "Avoid pressing button again".
      // Let's try to join. If API says "Ticket required", we show global error or highlight ticket selector?
      // Be careful of infinite loop if it fails.
      // We can use a ref or flag to try only once.
    }
  }, [status, urlIntentId, joined, joining]);

  const hasAttemptedAutoJoin = useRef(false);

  useEffect(() => {
    // If we have urlIntentId and are authenticated, try to join immediately
    if (status === "authenticated" && urlIntentId && !joined && !joining && !hasAttemptedAutoJoin.current) {
      hasAttemptedAutoJoin.current = true;
      handleJoin(urlIntentId);
    }
  }, [status, urlIntentId, joined, joining]); // eslint-disable-line react-hooks/exhaustive-deps


  const handleJoin = async (overrideIntentId?: string) => {
    const finalIntentId = overrideIntentId || intentId;

    // Track form start if user is authenticated
    if (status === "authenticated") {
      trackFormStart('event_join', `/events/${params.id}`);
    }

    // 1. If unauthenticated, we need to create Intent (if ref exists) then redirect
    if (status !== "authenticated") {
      let nextIntentId = finalIntentId;

      // Create Intent if we have a referrer and no existing intent
      if (!nextIntentId && ref) {
        try {
          const res = await fetch("/api/intents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "EVENT",
              targetId: params.id,
              ref: ref,
              src: src || "share_link"
            })
          });
          if (res.ok) {
            const data = await res.json();
            nextIntentId = data.intentId;
          }
        } catch (e) {
          console.error("Failed to create intent", e);
        }
      }

      const callbackUrl = `/events/${params.id}${nextIntentId ? `?intentId=${nextIntentId}` : ''}`;
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}&message=join`);
      return;
    }

    setJoining(true);
    try {
      const res = await fetch(`/api/events/${params.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicketId,
          paymentMethod: paymentMethod,
          intentId: finalIntentId // Send Intent ID
        }),
      });

      if (res.ok) {
        const data = await res.json();
        trackFormSubmit('event_join', `/events/${params.id}`, true, { 
          event_id: params.id,
          ticket_id: selectedTicketId,
          payment_method: paymentMethod 
        });
        if (data.credential) {
          alert(
            `イベントに参加しました！\nVC発行ジョブID: ${data.credential.jobId}\n\nVC発行状況は後ほど確認できます。`
          );
        } else {
          alert(
            `イベントに参加しました！\n\n※ VC発行は現在利用できません。参加登録は完了しています。`
          );
        }
        setJoined(true); // Optimistic update
        if (urlIntentId) {
          // Clean URL if we auto-joined
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("intentId");
          window.history.replaceState({}, '', newUrl.toString());
        }
        window.location.reload();
      } else {
        const error = await res.json();
        trackFormSubmit('event_join', `/events/${params.id}`, false, { 
          event_id: params.id,
          error: error.error 
        });
        // Specifically check for "Ticket selection is required" to guide user
        if (error.error === "Ticket selection is required") {
          alert("チケットを選択してください");
          handleScrollToRegistration();
          // Preserve intentId for when they click join again (already in state 'intentId' from urlIntentId)
        } else {
          alert(`エラー: ${error.error}`);
        }
      }
    } catch (error) {
      console.error("Error joining event:", error);
      trackFormSubmit('event_join', `/events/${params.id}`, false, { 
        event_id: params.id,
        error: 'network_error' 
      });
      alert("エラーが発生しました");
    } finally {
      setJoining(false);
    }
  };

  const handleAddToCalendar = async () => {
    setAddingToCalendar(true);
    trackPageEngagement('calendar_add', `/events/${params.id}`, { event_id: params.id });

    try {
      // API側でDBからGoogle連携トークンを取得するため、bodyにはアクセストークンを含めなくてOK
      const res = await fetch(`/api/events/${params.id}/add-to-calendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Googleカレンダーに追加しました！\n\nカレンダーを開きますか？`);
        if (data.eventLink) {
          window.open(data.eventLink, "_blank");
        }
      } else {
        const error = await res.json();
        if (res.status === 401) {
          if (confirm("Googleカレンダー連携が必要です。\nプロフィール設定からGoogleアカウントを連携してください。\n\n設定ページに移動しますか？")) {
            router.push("/profile");
          }
        } else {
          alert(`エラー: ${error.error}`);
        }
      }
    } catch (error) {
      console.error("Error adding to calendar:", error);
      alert("エラーが発生しました");
    } finally {
      setAddingToCalendar(false);
    }
  };

  const handleCopyEvent = async () => {
    if (!confirm("このイベントをコピーして新規作成しますか？\n（日付等は元のまま作成されますので、作成後に編集してください）")) return;

    try {
      const res = await fetch(`/api/events/${params.id}/copy`, { method: "POST" });
      if (res.ok) {
        const newEvent = await res.json();
        alert("イベントをコピーしました。");
        router.push(`/events/${newEvent.id}`);
      } else {
        const err = await res.json();
        alert(`コピーに失敗しました: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました");
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    trackCopyAction('link', `/events/${params.id}`, { event_id: params.id });
    alert("リンクをコピーしました");
  };

  const handleCopyRecruitmentText = () => {
    if (!event) return;
    const userId = (session?.user as any)?.id;
    const shareUrl = `${window.location.origin}/events/${event.id}${userId ? `?ref=${userId}` : ""}`;
    const text = buildRecruitmentText({
      title: event.title,
      description: event.description,
      eventUrl: shareUrl,
      descriptionMaxLength: 50,
    });
    navigator.clipboard.writeText(text);
    trackCopyAction('recruitment_text', `/events/${params.id}`, { event_id: params.id });
    alert("募集用テキストをコピーしました！SNS等でシェアしてください。");
  };

  const handleApproveParticipant = async (userId: string, currentStatus: string) => {
    if (!confirm("この参加者の参加を承認しますか？")) return;

    try {
      const res = await fetch(`/api/events/${params.id}/participants/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: "completed" }),
      });

      if (res.ok) {
        alert("参加を承認しました");
        // Refresh list
        const updatedParticipants = detailedParticipants.map(p =>
          p.user.id === userId ? { ...p, status: "completed" } : p
        );
        setDetailedParticipants(updatedParticipants);
      } else {
        const error = await res.json();
        alert(`エラー: ${error.error}`);
      }
    } catch (error) {
      console.error("Error approving participant:", error);
      alert("エラーが発生しました");
    }
  };

  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      alert("メッセージを入力してください");
      return;
    }

    if (!confirm("参加者全員（LINE連携済みユーザー）に通知を送信しますか？\n※この操作は取り消せません。")) return;

    setSendingNotification(true);
    try {
      const res = await fetch(`/api/events/${params.id}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: notificationMessage }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`送信しました！\n送信数: ${data.sentCount}件`);
        setNotificationMessage("");
        setShowNotificationModal(false);
      } else {
        alert(`送信に失敗しました: ${data.error}`);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("エラーが発生しました");
    } finally {
      setSendingNotification(false);
    }
  };

  const getCTA = () => {
    if (!event) return null;

    if (joined && myParticipant) {
      if (myParticipant.status === "PENDING") {
        return (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-center font-bold mb-6">
            🕒 承認待ちです (Pending Approval)
          </div>
        );
      }
      if (myParticipant.status === "REJECTED") {
        return (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-center font-bold mb-6">
            ❌ 参加が承認されませんでした (Rejected)
          </div>
        );
      }
      if (myParticipant.status === "CANCELED") {
        return (
          <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded-lg text-center font-bold mb-6">
            🚫 キャンセル済み (Canceled)
          </div>
        );
      }
      return (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center font-bold mb-6">
          ✅ 参加登録済み (My Ticket)
        </div>
      );
    }
    return null;
  };

  const handleScrollToRegistration = () => {
    const section = document.getElementById("registration-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            イベントが見つかりません
          </h1>
          <Link href="/events" className="text-indigo-600 hover:underline">
            イベント一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // Standard view only for now


  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      <Header />


      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              ホーム
            </Link>
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <Link href="/events" className="hover:text-gray-700">
              イベント一覧
            </Link>
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {event.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
          )}

          <div className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1 min-w-0">
                {event.title}
              </h1>
              <div className="flex-shrink-0">
                <ShareButton
                  url={`/events/${event.id}`}
                  title={event.title}
                  description={event.description ? event.description.replace(/<[^>]*>?/gm, "").slice(0, 100) : undefined}
                  referrerId={(session?.user as any)?.id}
                  iconOnly
                />
              </div>
            </div>

            {/* カテゴリーとタグ */}
            {/* カテゴリーとタグ */}
            {(event.category || event.tags) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {event.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {event.category}
                  </span>
                )}
                {event.tags &&
                  JSON.parse(event.tags).map((tag: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      #{tag}
                    </span>
                  ))}
              </div>
            )}

            {/* Event Info Block (Moved to Top) */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
              <div className="space-y-4">
                {/* Date & Time */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 flex justify-center mt-0.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {new Date(event.startAt).toLocaleString("ja-JP", {
                        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                    {event.endAt && (
                      <div className="text-gray-500 font-medium">
                        〜 {new Date(event.endAt).toLocaleString("ja-JP", {
                          year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Online URL (Added) */}
                {(event.format === 'online' || event.format === 'hybrid') && event.onlineUrl && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 flex justify-center mt-0.5 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-medium text-gray-900 mb-1">オンライン会場</div>
                      {/* Only show link if joined or owner, OR if it's public? 
                          User request implies it wasn't created/visible. 
                          Usually online links are protected. But for now I'll just show it or a placeholder if not joined?
                          Let's show it if joined or owner. 
                       */}
                      {(joined || isOwner) ? (
                        <a 
                          href={event.onlineUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={() => trackExternalLinkClick(event.onlineUrl || '', 'オンライン会場URL', `/events/${params.id}`)}
                          className="text-indigo-600 hover:underline break-all block"
                        >
                          {event.onlineUrl}
                        </a>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          参加登録後にURLが表示されます
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location (Simplified) */}
                {(event.format === 'offline' || event.format === 'hybrid') && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 flex justify-center mt-0.5 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {event.venueTitle || event.location || "場所未定"}
                      </div>
                      {event.venueAddress && <div className="text-sm text-gray-500">{event.venueAddress}</div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Status / Going */}
              <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                <div className="flex items-center mb-2">
                  <div className="flex-shrink-0 w-8 flex justify-center text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-700">
                    <span className="font-bold text-gray-900 text-lg">{event._count?.participants ?? event.participants?.length ?? 0}</span>
                    <span className="text-gray-500 text-sm ml-1">名参加</span>
                  </div>
                </div>
                {/* Avatar Stack (Visual only for now) */}
                <div className="flex -space-x-2 overflow-hidden ml-8">
                  {(event.participants || []).slice(0, 5).map((p: any) => (
                    <img
                      key={p.id}
                      src={p.user.image || `https://ui-avatars.com/api/?name=${p.user.name}`}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                    />
                  ))}
                  {(event.participants?.length || 0) > 5 && (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-xs text-gray-500 font-medium">
                      +{event.participants!.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* State-based CTA */}
            {!joined && !isOwner && (
              <div className="mb-8">
                {event.approvalRequired ? (
                  <Link
                    href={`/events/${event.id}/register`}
                    onClick={() => trackCTAClick('参加を申し込む (審査制)', `/events/${params.id}`, { event_id: params.id, approval_required: true })}
                    className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-0.5"
                  >
                    参加を申し込む (審査制)
                  </Link>
                ) : (
                  // Existing CTA logic (simplified)
                  // Usually handled by Sticky Footer or inline Ticket Selector
                  // For simplicity, we can show a "Register" button that scrolls to Tickets
                  <button
                    onClick={() => {
                      trackCTAClick('参加登録へ進む', `/events/${params.id}`, { event_id: params.id });
                      handleScrollToRegistration();
                    }}
                    className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-0.5"
                  >
                    参加登録へ進む
                  </button>
                )}
                {/* Show Waitlist message if full */}
              </div>
            )}

            {getCTA()}

            {/* Blasts */}
            <BlastsSection eventId={event.id} />

            {/* About (Description) */}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-10 whitespace-pre-line">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">イベントについて</h3>
              {event.description ? parse(event.description) : null}
            </div>

            {/* Maps & Access (Already in logic) */}
            {/* ... existing map block ... */}


            {/* Main Description */}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-10 whitespace-pre-line">
              {event.description ? parse(event.description) : null}
            </div>

            {/* Legacy Info Block position was here - Removed/Integrated above */}


            {/* Online URL block removed - moved to header location section */}


            {/* Venue Map */}
            {(event.venueLat && event.venueLng) || event.venueAddress ? (
              <div className="mt-8 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">会場アクセス</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {event.venueTitle && (
                    <div className="font-bold mb-1">{event.venueTitle}</div>
                  )}
                  {event.venueAddress && (
                    <div className="text-sm text-gray-600 mb-3">{event.venueAddress}</div>
                  )}

                  {/* Google Map Embed */}
                  {(event.venueLat && event.venueLng) ? (
                    <div className="w-full h-64 bg-gray-200 rounded-md overflow-hidden mb-3">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${event.venueLat},${event.venueLng}&z=15&output=embed`}
                      ></iframe>
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    <a
                      href={event.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${event.venueLat},${event.venueLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackExternalLinkClick(event.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${event.venueLat},${event.venueLng}`, 'Google Mapsで開く', `/events/${params.id}`)}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 text-center py-2 rounded text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <span>📍 Google Mapsで開く</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : null}

            {/* アクションボタン（リンクコピー・カレンダー登録・シェア） */}
            <div className="border-t border-gray-200 pt-6 pb-6 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">このイベントをシェア</span>
                <ShareButton
                  url={`/events/${event.id}`}
                  title={event.title}
                  description={event.description ? event.description.replace(/<[^>]*>?/gm, "").slice(0, 100) : undefined}
                  referrerId={(session?.user as any)?.id}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* 募集文コピーボタン */}
                <button
                  onClick={handleCopyRecruitmentText}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  募集文コピー
                </button>

                {/* リンクコピーボタン */}
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      コピーしました
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      リンクをコピー
                    </>
                  )}
                </button>

                {/* カレンダー（ドロップダウン: ファイルDL / Google / デフォルト） */}
                <div className="relative" ref={calendarMenuRef}>
                  <button
                    type="button"
                    onClick={() => setCalendarMenuOpen((v) => !v)}
                    disabled={addingToCalendar}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-100 hover:bg-purple-200 disabled:bg-gray-300 text-purple-700 disabled:text-gray-500 rounded-lg font-medium transition-colors w-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    カレンダー
                    <svg className={`w-4 h-4 transition-transform ${calendarMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {calendarMenuOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                      <button
                        type="button"
                        onClick={() => {
                          if (!event) return;
                          setCalendarMenuOpen(false);
                          const content = generateIcsContent(event);
                          const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.setAttribute("download", `${event.title}.ics`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-100 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        ファイルとしてダウンロード
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCalendarMenuOpen(false);
                          handleAddToCalendar();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-100 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Googleカレンダーで開く
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!event) return;
                          setCalendarMenuOpen(false);
                          const content = generateIcsContent(event);
                          const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
                          const url = URL.createObjectURL(blob);
                          window.open(url, "_blank");
                          URL.revokeObjectURL(url);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-100 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        デフォルトのカレンダーで開く
                      </button>
                    </div>
                  )}
                </div>

                {/* Organizer Only: Send Notification Button */}
                {isOrganizerAdmin && (
                  <button
                    onClick={() => setShowNotificationModal(true)}
                    className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors mt-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    参加者へお知らせ配信 (LINE)
                  </button>
                )}
              </div>

              {/* 管理メニュー (主催者のみ) */}
              {(isOwner || isOrganizerAdmin) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">主催者メニュー</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => router.push(`/events/${event.id}/edit`)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      イベントを編集
                    </button>
                    <button
                      onClick={handleCopyEvent}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      コピーして作成
                    </button>
                    <Link
                      href={`/events/${event.id}/manage/participants`}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      参加者管理
                    </Link>
                    <Link
                      href={`/events/${event.id}/manage/questions`}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      フォーム設定
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 参加ボタン */}
            <div id="registration-section" className="border-t border-gray-200 pt-6">
              {joined ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 font-medium">
                      ✓ このイベントに参加済みです
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      以下の流れで当日までに準備を進めましょう
                    </p>
                  </div>

                  {/* 参加の流れ（迷いなく参加する動線） */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">参加の流れ</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">1</span>
                        <span className="flex-1">
                          <Link href={`/events/${event.id}/register`} className="text-indigo-600 hover:underline font-medium">アンケートに回答する</Link>
                          <span className="text-gray-500 ml-1">→ 主催者が設定した質問に回答</span>
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">2</span>
                        <span className="flex-1">
                          <Link href="/mypage?tab=profile" className="text-indigo-600 hover:underline font-medium">プロフィールを登録する</Link>
                          <span className="text-gray-500 ml-1">→ 当日のマッチングや名刺交換に利用</span>
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">3</span>
                        <span className="flex-1">
                          <span className="font-medium text-gray-900">Googleカレンダーに追加</span>
                          <span className="text-gray-500 ml-1">→ 上記の「カレンダー」ボタンから追加</span>
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">4</span>
                        <span className="flex-1">
                          <span className="font-medium text-gray-900">当日は会場でQRコードを提示</span>
                          <span className="text-gray-500 ml-1">→ マイページのQRを主催者に提示してチェックイン</span>
                        </span>
                      </li>
                      {event.communityId && (
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">5</span>
                          <span className="flex-1">
                            <Link href={`/hub?c=${event.communityId}`} className="text-indigo-600 hover:underline font-medium">掲示板でやりとり</Link>
                            <span className="text-gray-500 ml-1">→ コミュニティの掲示板で質問・交流</span>
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* 参加キャンセル (TODO: Implement API) */}
                  <button
                    onClick={() => {
                      if (confirm("本当に参加をキャンセルしますか？\n（発行されたVCは無効化されませんが、主催者に通知されます）")) {
                        alert("現在キャンセル機能は開発中です。主催者に直接ご連絡ください。");
                      }
                    }}
                    className="text-gray-500 text-sm hover:underline self-center"
                  >
                    参加をキャンセルする
                  </button>
                </div>
              ) : status === "authenticated" ? (
                <>
                  {/* Ticket Selector */}
                  {event.tickets && event.tickets.length > 0 && (
                    <TicketSelector
                      tickets={event.tickets}
                      selectedTicketId={selectedTicketId}
                      onSelect={setSelectedTicketId}
                      disabled={joining}
                    />
                  )}

                  {/* Payment Method Selector (Only for paid tickets) */}
                  {(() => {
                    const selectedTicket = event.tickets?.find(t => t.id === selectedTicketId);
                    if (selectedTicket && selectedTicket.price > 0 && event.acceptedPaymentMethods) {
                      let methods: string[] = [];
                      try {
                        methods = JSON.parse(event.acceptedPaymentMethods);
                      } catch (e) {
                        methods = [];
                      }

                      if (methods.length > 0) {
                        return (
                          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">支払い方法を選択</h4>
                            <div className="space-y-3">
                              {methods.includes("stripe") && (
                                <label className="flex items-center p-3 bg-white border rounded-md cursor-pointer hover:border-blue-400">
                                  <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="stripe"
                                    checked={paymentMethod === "stripe"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">クレジットカード (Stripe)</span>
                                </label>
                              )}
                              {paymentMethod === "stripe" && clientSecret && (
                                <div className="mt-4 p-4 border rounded-md bg-white">
                                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <StripePaymentForm
                                      onSuccess={() => {
                                        alert("支払いが完了しました！");
                                        window.location.reload();
                                      }}
                                      onError={(msg) => alert(`支払いエラー: ${msg}`)}
                                    />
                                  </Elements>
                                </div>
                              )}
                              {methods.includes("bank") && (
                                <label className="flex items-center p-3 bg-white border rounded-md cursor-pointer hover:border-blue-400">
                                  <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="bank"
                                    checked={paymentMethod === "bank"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">銀行振込</span>
                                </label>
                              )}
                              {paymentMethod === "bank" && event.bankDetails && (
                                <div className="ml-6 p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
                                  <p className="font-bold text-gray-900 mb-2">振込先情報:</p>
                                  <div className="whitespace-pre-wrap">{event.bankDetails}</div>
                                  <p className="text-xs text-gray-500 mt-2">
                                    ※ 振込手数料はご負担ください。
                                  </p>
                                </div>
                              )}
                              {methods.includes("on_site") && (
                                <label className="flex items-center p-3 bg-white border rounded-md cursor-pointer hover:border-blue-400">
                                  <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="on_site"
                                    checked={paymentMethod === "on_site"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">現地払い</span>
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}

                  {/* 参加証明VC取得ブロックは非表示（要望により削除） */}
                  <>
                    {/* Join Button (Hidden/Removed - Moved to Sticky Footer) */}
                    {paymentMethod !== "stripe" && (
                      <div className="hidden"></div>
                    )}
                  </>
                </>
              ) : (
                <button
                  onClick={() => {
                    trackCTAClick('ログインして参加する', `/events/${params.id}`, { event_id: params.id });
                    handleJoin();
                  }}
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
                >
                  ログインして参加する
                </button>
              )}

            </div>

            {/* レビューセクション */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <ReviewSection
                eventId={event.id}
                eventEndAt={event.endAt}
                isParticipant={joined}
              />
            </div>
          </div >

          {/* Participant List (Detailed for owner/admin) */}
          {
            (isOwner || isOrganizerAdmin) && detailedParticipants.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    参加者一覧 ({detailedParticipants.length}名)
                  </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  {detailedParticipants.map((participant) => (
                    <li key={participant.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {participant.user.image ? (
                            <img
                              src={participant.user.image}
                              alt={participant.user.name || "User"}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {(participant.user.name || "U")[0]}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {participant.user.name || "未設定"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {participant.user.email}
                            </div>
                            {participant.ticket && (
                              <div className="text-xs text-indigo-600 mt-1">
                                チケット: {participant.ticket.name} ({participant.ticket.price}円)
                              </div>
                            )}
                            {participant.paymentMethod && (
                              <div className="text-xs text-gray-500">
                                支払い: {participant.paymentMethod === 'stripe' ? 'カード' : participant.paymentMethod === 'bank' ? '振込' : '現地'}
                                {participant.paymentStatus === 'paid' ? ' (済)' : typeof participant.paymentStatus === 'string' ? ` (${participant.paymentStatus})` : ''}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {participant.status === "completed" ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              参加承認済み
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveParticipant(participant.user.id, participant.status)}
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              参加承認する
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          }

          {/* Simple Participant List (For public) */}
          {
            (!isOwner && !isOrganizerAdmin) && event.participants && event.participants.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    参加者 ({event.participants.length}名)
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-4">
                    {event.participants.map((p) => (
                      <div key={p.id} className="flex flex-col items-center">
                        {p.user.image ? (
                          <img
                            src={p.user.image}
                            alt={p.user.name || "User"}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {(p.user.name || "U")[0]}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500 mt-1 max-w-[60px] truncate block text-center">
                          {p.user.name || "未設定"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          }

          {/* イベントチャット */}
          <EventChat eventId={params.id as string} />
        </div >

        {/* Notification Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl animate-fadeIn">
              <h3 className="text-xl font-bold text-gray-900 mb-4">参加者にお知らせを配信</h3>
              <p className="text-sm text-gray-500 mb-4">
                イベントに参加登録し、LINE連携を行っているユーザー全員にメッセージを送信します。<br />
                <span className="text-red-500 font-bold">※緊急の連絡や、重要な変更事項のみ送信してください。</span>
              </p>
              <textarea
                className="w-full h-32 border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="メッセージを入力してください..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
              ></textarea>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                  disabled={sendingNotification}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSendNotification}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:bg-gray-400 flex items-center gap-2"
                  disabled={sendingNotification}
                >
                  {sendingNotification ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      送信中...
                    </>
                  ) : (
                    "送信する"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main >

      {event && (
        <StickyRegistrationFooter
          eventId={event.id}
          isJoined={joined}
          registrationDeadline={event.registrationDeadline || null}
          loading={joining}
          disabled={joining}
          isOwner={isOwner}
          eventTitle={event.title}
          referrerId={(session?.user as any)?.id}
          onRegister={() => {
            if (joined) {
              // 参加済みの場合は、詳細情報（例えばチケット情報やチャット）にスクロール
              // とりあえず登録セクションへ。
              const element = document.getElementById("registration-section");
              element?.scrollIntoView({ behavior: "smooth" });
            } else {
              // 未参加の場合
              if (event.tickets && event.tickets.length > 0 && !selectedTicketId) {
                // チケット選択が必要ならスクロール
                handleScrollToRegistration();
                alert("チケットを選択してください");
              } else {
                // 準備OKなら参加処理 (またはスクロール)
                // ユーザー体験的にはボタンクリックで即参加が良いが、
                // Stripeやフォーム入力がある場合はスクロールが安全。
                // ここでは、既にスクロールして選択済みなら参加、そうでなければスクロールにする？
                // あるいはシンプルに常に「参加エリアへ」スクロールさせるか。
                // 今回は「参加する」ボタンなので、アクションを起こしたい。

                // チケット選択済、またはチケットなしの場合
                if (paymentMethod === 'stripe') {
                  handleScrollToRegistration(); // Stripeフォームへ
                } else {
                  // インラインボタンを削除したため、フッターボタンが参加実行のトリガーとなる必要がある
                  if (status !== "authenticated" || confirm("イベントに参加しますか？")) {
                    handleJoin();
                  }
                }
              }
            }
          }}
        />
      )}
    </div >
  );
}
