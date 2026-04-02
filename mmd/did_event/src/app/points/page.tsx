"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import PageLoading from "@/components/PageLoading";
import { Search, ShoppingBag, Store, Users, UserCircle, ClipboardList } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface MarketItem {
    type: "item" | "product";
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    stock: number;
    source?: string;
    seller?: {
        name: string;
        image: string | null;
    };
    community?: {
        name: string;
        imageUrl: string | null;
    };
}

interface Transaction {
    id: string;
    amount: number;
    description: string;
    createdAt: string;
    type?: string;
    createdByUser?: {
        name: string | null;
        image: string | null;
    } | null;
    community?: {
        name: string;
    } | null;
}

export default function PointsPage() {
    const { t } = useTranslation();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [points, setPoints] = useState(0);
    const [items, setItems] = useState<MarketItem[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [redeemingId, setRedeemingId] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    // Filters & Search
    const [filter, setFilter] = useState<"all" | "official" | "community" | "following">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchPointsData = useCallback(async (cursorParam?: string) => {
        try {
            const url = cursorParam ? `/api/points/data?cursor=${cursorParam}` : "/api/points/data";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (!cursorParam) {
                    setPoints(data.points);
                    setTransactions(data.transactions);
                } else {
                    setTransactions(prev => [...prev, ...data.transactions]);
                }
                setNextCursor(data.nextCursor || null);
            }
        } catch (error) {
            console.error("Error fetching points:", error);
        }
    }, []);

    const handleLoadMore = async () => {
        if (!nextCursor || loadingMore) return;
        setLoadingMore(true);
        await fetchPointsData(nextCursor);
        setLoadingMore(false);
    };

    const fetchMarketItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                filter,
                q: searchQuery
            });
            const res = await fetch(`/api/marketplace/items?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setItems(data.items);
            }
        } catch (error) {
            console.error("Error fetching items:", error);
        } finally {
            setLoading(false);
        }
    }, [filter, searchQuery]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (session?.user) {
            fetchPointsData();
            fetchMarketItems();
        }
    }, [fetchMarketItems, fetchPointsData, router, session, status]);

    // Re-fetch items when filter or search changes (debounced search handled by user pressing enter or explicit effect?)
    // For simplicity, let's fetch on filter change, and maybe effect for search with debounce?
    // Doing effect for both.
    useEffect(() => {
        if (session?.user) {
            fetchMarketItems();
        }
    }, [fetchMarketItems, filter, session]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchMarketItems();
    };

    const handleRedeem = async (item: MarketItem) => {
        if (points < item.price) {
            alert(t("points.marketplace.insufficientPointsError"));
            return;
        }

        if (!confirm(t("points.marketplace.confirmExchange", { name: item.name, price: item.price }))) {
            return;
        }

        setRedeemingId(item.id);
        try {
            const endpoint = item.type === 'product' ? "/api/marketplace/purchase" : "/api/points/redeem";
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId: item.id }),
            });

            if (res.ok) {
                const data = await res.json();
                alert(t("points.marketplace.exchangeSuccess"));
                setPoints(data.remainingPoints); // Update local points
                fetchMarketItems(); // Refresh stock
                fetchPointsData(); // Refresh history
            } else {
                const error = await res.json();
                alert(t("points.marketplace.error", { error: error.error }));
            }
        } catch (error) {
            console.error("Error redeeming:", error);
            alert(t("points.marketplace.errorGeneric"));
        } finally {
            setRedeemingId(null);
        }
    };

    if (status === "loading") return <PageLoading />;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{t("points.marketplace.title")}</h1>
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <Link
                            href="/points/gift"
                            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                            {t("points.marketplace.sendPoints")}
                        </Link>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                            <span className="text-gray-500 text-sm">{t("points.marketplace.heldPoints")}</span>
                            <span className="text-2xl font-bold text-blue-600">{points.toLocaleString()} pt</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
                    <div className="flex flex-col gap-4">
                        {/* Tabs */}
                        <div className="flex items-center space-x-1 overflow-x-auto pb-1">
                            {[
                                { id: "all", label: t("points.marketplace.tabAll"), icon: ShoppingBag },
                                { id: "official", label: t("points.marketplace.tabOfficial"), icon: Store },
                                { id: "community", label: t("points.marketplace.tabCommunity"), icon: Users },
                                { id: "following", label: t("points.marketplace.tabFollowing"), icon: UserCircle },
                                { id: "history", label: t("points.marketplace.history"), icon: ClipboardList },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        if (tab.id === "history") {
                                            document.getElementById("point-history")?.scrollIntoView({ behavior: "smooth" });
                                        } else {
                                            setFilter(tab.id as any);
                                        }
                                    }}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                                        ${filter === tab.id
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-600 hover:bg-gray-100"}
                                    `}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                            {(filter !== "all" || searchQuery) && (
                                <button
                                    type="button"
                                    onClick={() => { setFilter("all" as any); setSearchQuery(""); }}
                                    className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-full transition-colors whitespace-nowrap ml-1"
                                >
                                    {t("points.marketplace.clearFilter")}
                                </button>
                            )}
                        </div>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input
                                type="text"
                                placeholder={t("points.marketplace.searchPlaceholder")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </form>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* アイテム一覧 */}
                    <div className="lg:col-span-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                                <p className="text-gray-500 text-sm">{t("points.marketplace.loading")}</p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                {t("points.marketplace.noItems")}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {items.map((item) => (
                                    <div
                                        key={`${item.type}-${item.id}`}
                                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col border border-gray-100"
                                    >
                                        <div className="relative h-48 bg-gray-100">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    No Image
                                                </div>
                                            )}
                                            {/* Type/Source Badge */}
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                                                {item.type === "item" ? "Official" : item.source || "Market"}
                                            </div>
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="mb-2">
                                                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{item.name}</h3>
                                                {item.seller && (
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        <span className="text-gray-400">by</span>
                                                        {item.seller.image && (
                                                            <img src={item.seller.image} alt={item.seller.name} className="w-4 h-4 rounded-full" />
                                                        )}
                                                        <span>{item.seller.name}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                                                {item.description}
                                            </p>

                                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <span className="font-bold text-xl text-blue-600">
                                                    {item.price.toLocaleString()} pt
                                                </span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {t("points.marketplace.stock", { count: item.stock })}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleRedeem(item)}
                                                disabled={
                                                    redeemingId === item.id ||
                                                    points < item.price ||
                                                    item.stock <= 0
                                                }
                                                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                                            >
                                                {item.stock <= 0
                                                    ? t("points.marketplace.outOfStock")
                                                    : points < item.price
                                                        ? t("points.marketplace.insufficientPoints")
                                                        : redeemingId === item.id
                                                            ? t("points.marketplace.processing")
                                                            : t("points.marketplace.exchange")}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 履歴 */}
                    <div id="point-history" className="relative scroll-mt-4">
                        <div className="sticky top-8">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 mt-6 lg:mt-0">{t("points.marketplace.history")}</h2>
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <ul className="divide-y divide-gray-100">
                                    {transactions.map((tx) => {
                                        const typeIcon = tx.type === "SPEND" ? "\uD83D\uDED2" : tx.type === "DEPOSIT" ? "\uD83D\uDCB0" : tx.type === "CASHBACK" ? "\u21A9\uFE0F" : "\uD83C\uDF81";
                                        return (
                                            <li key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-base">{typeIcon}</span>
                                                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                                {tx.description}
                                                            </p>
                                                        </div>
                                                        {tx.createdByUser?.name && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {t("points.marketplace.fromUser", { name: tx.createdByUser.name })}
                                                            </p>
                                                        )}
                                                        {tx.community?.name && (
                                                            <p className="text-xs text-indigo-500 mt-0.5">
                                                                {tx.community.name}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(tx.createdAt).toLocaleString("ja-JP")}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`font-mono font-bold whitespace-nowrap ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}
                                                    >
                                                        {tx.amount > 0 ? "+" : ""}
                                                        {tx.amount}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                    {transactions.length === 0 && (
                                        <li className="p-8 text-center text-gray-500 text-sm">
                                            {t("points.marketplace.noHistory")}
                                        </li>
                                    )}
                                    {nextCursor && (
                                        <li className="p-3 text-center">
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:text-gray-400"
                                            >
                                                {loadingMore ? t("points.marketplace.loading") : t("points.marketplace.loadMore")}
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
