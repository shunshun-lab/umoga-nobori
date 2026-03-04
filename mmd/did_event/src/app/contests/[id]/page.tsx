"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Contest {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    status: string;
    startAt: string;
    endAt: string;
}

interface Entry {
    id: string;
    title: string;
    content: string;
    imageUrl: string | null;
    user: {
        id: string;
        name: string;
        image: string;
    };
    _count: {
        votes: number;
    };
    isVoted: boolean;
}

export default function ContestDetailPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const [contest, setContest] = useState<Contest | null>(null);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEntryForm, setShowEntryForm] = useState(false);

    // Entry Form
    const [entryTitle, setEntryTitle] = useState("");
    const [entryContent, setEntryContent] = useState("");
    const [entryImage, setEntryImage] = useState("");

    const fetchContest = useCallback(async () => {
        try {
            const res = await fetch(`/api/contests/${id}`);
            if (res.ok) {
                const data = await res.json();
                setContest(data);
            }
        } catch (error) {
            console.error("Error fetching contest:", error);
        }
    }, [id]);

    const fetchEntries = useCallback(async () => {
        try {
            const res = await fetch(`/api/contests/${id}/entries`);
            if (res.ok) {
                const data = await res.json();
                setEntries(data);
            }
        } catch (error) {
            console.error("Error fetching entries:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchContest();
            fetchEntries();
        }
    }, [fetchContest, fetchEntries, id]);

    const handleEntrySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;

        try {
            const res = await fetch(`/api/contests/${id}/entries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: entryTitle,
                    content: entryContent,
                    imageUrl: entryImage,
                }),
            });

            if (res.ok) {
                alert("応募が完了しました！");
                setShowEntryForm(false);
                setEntryTitle("");
                setEntryContent("");
                setEntryImage("");
                fetchEntries();
            } else {
                const err = await res.json();
                alert(`エラー: ${err.error}`);
            }
        } catch (error) {
            console.error("Error submitting entry:", error);
        }
    };

    const handleVote = async (entryId: string) => {
        if (!session) {
            alert("投票するにはログインが必要です");
            return;
        }

        try {
            const res = await fetch(`/api/contests/${id}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entryId }),
            });

            if (res.ok) {
                alert("投票しました！");
                fetchEntries();
            } else {
                const err = await res.json();
                alert(`エラー: ${err.error}`);
            }
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    if (loading) return <div className="p-8 text-center">読み込み中...</div>;
    if (!contest) return <div className="p-8 text-center">コンテストが見つかりません</div>;

    const isOpen = contest.status === "OPEN";

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Contest Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {contest.imageUrl && (
                            <img src={contest.imageUrl} alt={contest.title} className="w-full md:w-1/3 rounded-xl object-cover shadow-md" />
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {isOpen ? "開催中" : "終了"}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {new Date(contest.startAt).toLocaleDateString()} 〜 {new Date(contest.endAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <h1 className="text-4xl font-bold text-gray-900 flex-1 min-w-0">{contest.title}</h1>
                                <ShareButton url={`/contests/${id}`} title={contest.title} description={contest.description} referrerId={(session?.user as any)?.id} iconOnly />
                            </div>
                            <p className="text-gray-600 text-lg mb-6">{contest.description}</p>

                            {isOpen && (
                                <button
                                    onClick={() => setShowEntryForm(!showEntryForm)}
                                    className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-700 transition-colors shadow-lg"
                                >
                                    作品を応募する
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Entry Form */}
                {showEntryForm && (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-12 border-2 border-pink-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">作品応募フォーム</h2>
                        <form onSubmit={handleEntrySubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                                <input
                                    type="text"
                                    value={entryTitle}
                                    onChange={(e) => setEntryTitle(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-3"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">説明・想い</label>
                                <textarea
                                    value={entryContent}
                                    onChange={(e) => setEntryContent(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-3 min-h-[120px]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">画像URL (任意)</label>
                                <input
                                    type="text"
                                    value={entryImage}
                                    onChange={(e) => setEntryImage(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-3"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEntryForm(false)}
                                    className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    className="bg-pink-600 text-white px-8 py-2 rounded-lg hover:bg-pink-700 font-bold"
                                >
                                    応募する
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Entries Grid */}
                <h2 className="text-2xl font-bold mb-8 text-gray-900">応募作品一覧</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {entries.map((entry) => (
                        <div key={entry.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
                            {entry.imageUrl ? (
                                <img src={entry.imageUrl} alt={entry.title} className="w-full h-48 object-cover" />
                            ) : (
                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{entry.title}</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-bold">
                                        {entry.user.name?.[0]}
                                    </div>
                                    <span className="text-sm text-gray-600">{entry.user.name}</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-6 line-clamp-3">{entry.content}</p>

                                <div className="flex items-center justify-between border-t pt-4">
                                    <div className="text-pink-600 font-bold flex items-center gap-1">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                        {entry._count.votes}
                                    </div>

                                    {isOpen && (
                                        <button
                                            onClick={() => handleVote(entry.id)}
                                            disabled={entry.isVoted}
                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${entry.isVoted
                                                    ? "bg-pink-100 text-pink-800 cursor-not-allowed"
                                                    : "bg-gray-900 text-white hover:bg-gray-800"
                                                }`}
                                        >
                                            {entry.isVoted ? "投票済み" : "投票する"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
