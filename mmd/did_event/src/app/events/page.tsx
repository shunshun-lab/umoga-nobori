// src/app/events/page.tsx
"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import { useToast } from "@/context/ToastContext";

interface Event {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startAt: string;
  endAt: string | null;
  location: string | null;
  format: string | null;
  onlineUrl: string | null;
  capacity: number | null;
  category: string | null;
  tags: string | null;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    participants: number;
  };
  tickets?: {
    price: number;
  }[];
}

export type EventSection = "joined" | "favorites" | "browse";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [myEventIds, setMyEventIds] = useState<Set<string>>(new Set());
  /** 参加イベント / いいねしたイベント / イベントを探す */
  const [section, setSection] = useState<EventSection>("browse");
  const [participatingEvents, setParticipatingEvents] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [loadingJoined, setLoadingJoined] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/events').then(res => res.json()).then(data => {
        if (Array.isArray(data)) {
          setMyEventIds(new Set(data.map((e: any) => e.id)));
          setParticipatingEvents(data as Event[]);
        }
      }).catch(e => console.error("Failed to fetch my events", e));
    }
  }, [session]);

  // 参加イベントタブ表示時に参加一覧を取得
  useEffect(() => {
    if (section !== "joined" || !session?.user) return;
    setLoadingJoined(true);
    fetch('/api/user/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setParticipatingEvents(data as Event[]);
          setMyEventIds(new Set(data.map((e: any) => e.id)));
        }
      })
      .catch(e => console.error("Failed to fetch my events", e))
      .finally(() => setLoadingJoined(false));
  }, [section, session?.user]);

  // いいねしたイベントタブ表示時にいいね一覧を取得
  useEffect(() => {
    if (section !== "favorites" || !session?.user) return;
    setLoadingFavorites(true);
    fetch('/api/user/favorites?type=event')
      .then(res => res.json())
      .then((favorites: { event?: Event | null }[]) => {
        const list = favorites
          .map(f => f.event)
          .filter((e): e is Event => e != null && typeof e === "object" && "id" in e);
        setFavoriteEvents(list);
      })
      .catch(e => console.error("Failed to fetch favorite events", e))
      .finally(() => setLoadingFavorites(false));
  }, [section, session?.user]);

  // 検索・フィルター用の状態
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [durationFilter, setDurationFilter] = useState<string>("all");

  // ソート用の状態
  const [sortBy, setSortBy] = useState<"date_asc" | "date_desc" | "participants" | "newest">("date_asc");

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Helper: Sort
  const sortEvents = useCallback((items: Event[], sortMode: string) => {
    return items.sort((a, b) => {
      switch (sortMode) {
        case "date_asc":
          return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
        case "date_desc":
          return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
        case "participants":
          return (b._count?.participants || 0) - (a._count?.participants || 0);
        case "newest":
          return b.id.localeCompare(a.id);
        default:
          return 0;
      }
    });
  }, []);

  // Helper: Duration Filter
  const filterByDuration = useCallback((items: Event[], mode: string) => {
    if (mode === "all") return items;
    return items.filter(event => {
      const start = new Date(event.startAt).getTime();
      const end = event.endAt ? new Date(event.endAt).getTime() : start;
      const durationHours = (end - start) / (1000 * 60 * 60);

      switch (mode) {
        case "1day": return durationHours < 24;
        case "2-3days": return durationHours >= 24 && durationHours < 72;
        case "long": return durationHours >= 72;
        default: return true;
      }
    });
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Build Query String
      const params = new URLSearchParams();

      // Basic Filters
      if (debouncedSearchTerm) params.append("q", debouncedSearchTerm);
      if (formatFilter !== "all") params.append("format", formatFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (selectedTag) params.append("tag", selectedTag);

      // Date Filters (From/To)
      // Note: "Upcoming/Past" filter logic is a bit complex to map directly to strict API "from/to" if mixed with user date inputs.
      // Strategy: 
      // 1. If user set specific dates, respect them.
      // 2. If 'upcoming', default 'from' to now.
      // 3. If 'past', default 'to' to now.

      let from = startDateFilter;
      let to = endDateFilter;

      if (filter === "upcoming") {
        if (!from) from = new Date().toISOString();
      } else if (filter === "past") {
        if (!to) to = new Date().toISOString();
      }

      if (from) params.append("from", from);
      if (to) params.append("to", to);

      // Default to showing all statuses appropriately or let API decide default?
      // User requested "Show all events properly".
      // Let's set status=all to bypass "active" only filter.
      if (!params.has("status")) {
        params.append("status", "all");
      }

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        // Client-side Sort (as API currently only sorts by date asc or we rely on client for complex sorts)
        // Ideally API should handle User/Participant sorts, but for now we sort filtered results or just accept Date ASC.
        // Let's keep client sort for this step to minimize API complexity changes.
        const sorted = sortEvents(data, sortBy);

        // Duration filter is hard to do server-side without complex logic/schema changes? 
        // Or we can do it client-side since we are paginating? 
        // Wait, we assume NO pagination yet (fetchAll). So Client-side secondary filter is fine for Duration.
        const durationFiltered = filterByDuration(sorted, durationFilter);

        setEvents(durationFiltered);
      } else {
        console.error("API returned non-array:", data);
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [
    categoryFilter,
    debouncedSearchTerm,
    durationFilter,
    endDateFilter,
    filter,
    filterByDuration,
    formatFilter,
    selectedTag,
    sortBy,
    sortEvents,
    startDateFilter,
  ]);

  useEffect(() => {
    if (section === "browse") {
      fetchEvents();
    }
  }, [section, fetchEvents]);

  // Sort Effect (Local)
  useEffect(() => {
    setEvents(prev => sortEvents([...prev], sortBy));
  }, [sortBy, sortEvents]);

  // Hardcoded Categories/Tags for UI until we have an aggregation API
  const CATEGORIES = ["カンファレンス", "ワークショップ", "ミートアップ", "ハッカソン", "パーティー", "その他"];
  const TAGS = ["Web3", "AI", "デザイン", "マーケティング", "エンジニアリング", "スタートアップ"];
  // Note: Previously computed from 'events', but now we fetch filtered events.
  // Ideally we should fetch 'all tags' separately or keep using dynamic list if user wants tags from *visible* events?
  // Let's use dynamic list from *current* events or a Static set for better UX (otherwise options disappear).
  // Using Static set for UX stability.

  const sync = async () => {
    if (!confirm('Google Sheetsと同期しますか？')) return;
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast(`同期完了！ イベント: ${data.eventsCount}件 / クエスト: ${data.questsCount}件`, 'success');
        fetchEvents(); // Reload
      } else {
        toast('同期に失敗しました: ' + data.error, 'error');
      }
    } catch (e) {
      toast('エラーが発生しました', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner with Integrated Search */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">イベント一覧</h1>
            </div>
            <button
              onClick={sync}
              className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors hidden md:block"
            >
              Sheets同期
            </button>
          </div>

          {/* Prominent Search Bar */}
          <div className="relative max-w-2xl">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 イベント名、説明、場所で検索..."
              className="w-full pl-5 pr-4 py-4 border-0 rounded-xl text-gray-900 placeholder-gray-500 shadow-lg focus:ring-4 focus:ring-white/30 focus:outline-none text-base"
            />
          </div>
        </div>
      </div>

      {/* Section Tabs: 参加イベント / いいねしたイベント / イベントを探す */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-px">
        <div className="flex gap-1 border-b border-white/30">
          <button
            type="button"
            onClick={() => setSection("joined")}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${section === "joined" ? "bg-white text-indigo-600" : "text-white/90 hover:bg-white/10"}`}
          >
            参加イベント
          </button>
          <button
            type="button"
            onClick={() => setSection("favorites")}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${section === "favorites" ? "bg-white text-indigo-600" : "text-white/90 hover:bg-white/10"}`}
          >
            いいねしたイベント
          </button>
          <button
            type="button"
            onClick={() => setSection("browse")}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${section === "browse" ? "bg-white text-indigo-600" : "text-white/90 hover:bg-white/10"}`}
          >
            イベントを探す
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 参加イベント */}
        {section === "joined" && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">参加イベント</h2>
            {loadingJoined ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : !session?.user ? (
              <p className="text-gray-500 py-8">ログインすると参加したイベントが表示されます。</p>
            ) : participatingEvents.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-600">参加しているイベントはまだありません。</p>
                <button type="button" onClick={() => setSection("browse")} className="mt-4 text-indigo-600 hover:underline">イベントを探す</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {participatingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isJoined
                    isOwner={event.owner?.id === (session?.user as any)?.id}
                    referrerId={(session?.user as any)?.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* いいねしたイベント */}
        {section === "favorites" && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">いいねしたイベント</h2>
            {loadingFavorites ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : !session?.user ? (
              <p className="text-gray-500 py-8">ログインするといいねしたイベントが表示されます。</p>
            ) : favoriteEvents.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-600">いいねしたイベントはまだありません。</p>
                <button type="button" onClick={() => setSection("browse")} className="mt-4 text-indigo-600 hover:underline">イベントを探す</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isJoined={myEventIds.has(event.id)}
                    isOwner={event.owner?.id === (session?.user as any)?.id}
                    referrerId={(session?.user as any)?.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* イベントを探す（検索・フィルター＋一覧） */}
        {section === "browse" && (
          <>
        {/* 詳細検索・フィルター（折りたたみ可能） */}
        <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            aria-expanded={isFilterOpen}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              詳細検索・フィルター
              {(formatFilter !== "all" || categoryFilter !== "all" || selectedTag || startDateFilter || endDateFilter || durationFilter !== "all") && (
                <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">絞り込み中</span>
              )}
            </div>
            <svg className={`w-5 h-5 shrink-0 transform transition-transform ${isFilterOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isFilterOpen && (
          <div className="border-t border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-4">
              <div className="relative">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="イベント名、説明、場所で検索..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開催形式
              </label>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="online">オンライン</option>
                <option value="offline">オフライン</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリー
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="all">すべて</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                期間の長さ
              </label>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="1day">1日以内</option>
                <option value="2-3days">2〜3日</option>
                <option value="long">4日以上（合宿・長期）</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タグ
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="">すべて</option>
                {TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    #{tag}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開始日以降
              </label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                終了日まで
              </label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStartDateFilter("");
                  setEndDateFilter("");
                  setCategoryFilter("all");
                  setSelectedTag("");
                  setDurationFilter("all");
                  setFilter("all");
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                クリア
              </button>
            </div>
          </div>
          </div>
          )}
        </div>

        {/* Active Filters Chips */}
        {(formatFilter !== "all" || categoryFilter !== "all" || selectedTag || startDateFilter || endDateFilter || durationFilter !== "all") && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-gray-500">絞り込み中:</span>
            {formatFilter !== "all" && (
              <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                📍 {formatFilter === "online" ? "オンライン" : "オフライン"}
                <button onClick={() => setFormatFilter("all")} className="hover:text-indigo-900">×</button>
              </span>
            )}
            {categoryFilter !== "all" && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                📁 {categoryFilter}
                <button onClick={() => setCategoryFilter("all")} className="hover:text-green-900">×</button>
              </span>
            )}
            {selectedTag && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                🏷️ {selectedTag}
                <button onClick={() => setSelectedTag("")} className="hover:text-purple-900">×</button>
              </span>
            )}
            {(startDateFilter || endDateFilter) && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                📅 {startDateFilter || "..."} 〜 {endDateFilter || "..."}
                <button onClick={() => { setStartDateFilter(""); setEndDateFilter(""); }} className="hover:text-orange-900">×</button>
              </span>
            )}
            {durationFilter !== "all" && (
              <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
                ⏱️ {durationFilter === "1day" ? "1日以内" : durationFilter === "2-3days" ? "2〜3日" : "長期"}
                <button onClick={() => setDurationFilter("all")} className="hover:text-teal-900">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setFormatFilter("all");
                setCategoryFilter("all");
                setSelectedTag("");
                setStartDateFilter("");
                setEndDateFilter("");
                setDurationFilter("all");
              }}
              className="text-xs text-gray-500 hover:text-red-500 underline"
            >
              すべてクリア
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === "all"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === "upcoming"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            開催予定
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === "past"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            過去のイベント
          </button>

          {/* Sort Dropdown */}
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
              >
                <option value="date_asc">📅 開催日（近い順）</option>
                <option value="date_desc">📅 開催日（遠い順）</option>
                <option value="participants">👥 参加者数順</option>
                <option value="newest">🆕 新着順</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{events.length}件のイベント</span>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              イベントが見つかりません
            </h3>
            <p className="text-gray-600 mb-6">
              条件に合うイベントがありません
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
                setCategoryFilter("all");
                setFormatFilter("all");
                setStartDateFilter("");
                setEndDateFilter("");
                setSelectedTag("");
                setDurationFilter("all");
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              条件をクリア
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isJoined={myEventIds.has(event.id)}
                isOwner={event.owner?.id === (session?.user as any)?.id}
                referrerId={(session?.user as any)?.id}
              />
            ))}
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
}
