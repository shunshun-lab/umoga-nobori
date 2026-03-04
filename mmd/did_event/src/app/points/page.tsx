"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Search, ShoppingBag, Store, Users, UserCircle } from "lucide-react"; // Accessing Lucide icons if available

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
}

export default function PointsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [points, setPoints] = useState(0);
    const [items, setItems] = useState<MarketItem[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [redeemingId, setRedeemingId] = useState<string | null>(null);

    // Filters & Search
    const [filter, setFilter] = useState<"all" | "official" | "community" | "following">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchPointsData = useCallback(async () => {
        try {
            // Get user points and transactions
            const res = await fetch("/api/points/data");
            if (res.ok) {
                const data = await res.json();
                setPoints(data.points);
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error("Error fetching points:", error);
        }
    }, []);

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
            router.push("/auth/signin");
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
            alert("ポイントが足りません");
            return;
        }

        if (!confirm(`${item.name}を交換しますか？\n消費ポイント: ${item.price}pt`)) {
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
                alert("交換しました！");
                setPoints(data.remainingPoints); // Update local points
                fetchMarketItems(); // Refresh stock
                fetchPointsData(); // Refresh history
            } else {
                const error = await res.json();
                alert(`エラー: ${error.error}`);
            }
        } catch (error) {
            console.error("Error redeeming:", error);
            alert("エラーが発生しました");
        } finally {
            setRedeemingId(null);
        }
    };

    if (status === "loading") return <div className="p-8 text-center">読み込み中...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">マーケットプレイス</h1>
                    <div className="mt-4 md:mt-0 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                        <span className="text-gray-500 text-sm">現在の保有ポイント</span>
                        <span className="text-2xl font-bold text-blue-600">{points.toLocaleString()} pt</span>
                    </div>
                </div>

                {/* Filter & Search */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        {/* Tabs */}
                        <div className="flex space-x-1 overflow-x-auto pb-2 md:pb-0">
                            {[
                                { id: "all", label: "すべて", icon: ShoppingBag },
                                { id: "official", label: "公式リワード", icon: Store },
                                { id: "community", label: "コミュニティ", icon: Users },
                                { id: "following", label: "フォロー中", icon: UserCircle },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id as any)}
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
                        </div>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="アイテムを検索..."
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
                            <div className="text-center py-12 text-gray-500">読み込み中...</div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                アイテムが見つかりませんでした
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
                                                    在庫: {item.stock}
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
                                                    ? "在庫切れ"
                                                    : points < item.price
                                                        ? "ポイント不足"
                                                        : redeemingId === item.id
                                                            ? "処理中..."
                                                            : "交換する"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 履歴 */}
                    <div className="hidden lg:block relative"> {/* Hidden on mobile, or move to bottom */}
                        <div className="sticky top-8">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">ポイント履歴</h2>
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <ul className="divide-y divide-gray-100">
                                    {transactions.map((tx) => (
                                        <li key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                        {tx.description}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(tx.createdAt).toLocaleString("ja-JP")}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`font-mono font-bold whitespace-nowrap ${tx.amount > 0 ? "text-green-600" : "text-red-500"
                                                        }`}
                                                >
                                                    {tx.amount > 0 ? "+" : ""}
                                                    {tx.amount}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                    {transactions.length === 0 && (
                                        <li className="p-8 text-center text-gray-500 text-sm">
                                            まだ履歴はありません
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
