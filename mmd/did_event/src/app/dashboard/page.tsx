import DashboardFeed from "@/components/homepage/DashboardFeed";
import Header from "@/components/Header";
import { isJxcRequest } from "@/lib/jxc-context";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const jxc = await isJxcRequest();

    if (jxc) {
        return (
            <div className="min-h-screen bg-gray-50">
                <main className="max-w-3xl mx-auto px-4 py-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Japan X College</h1>
                    <p className="text-gray-500 mb-8">JXCの活動を見てみよう</p>

                    <div className="grid gap-4">
                        <Link href="/events" className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">イベントを見る</h2>
                                    <p className="text-sm text-gray-500">開催予定のイベント一覧</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/quests" className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">クエストを見る</h2>
                                    <p className="text-sm text-gray-500">募集中のクエスト一覧</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/join" className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">関わり方を選ぶ</h2>
                                    <p className="text-sm text-gray-500">JXCへの参加方法</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Main app link */}
                    <div className="mt-12 text-center">
                        <a
                            href="https://did-event.vercel.app/dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            メインアプリで詳しく見る
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </main>

                <footer className="border-t border-gray-200 bg-white mt-12">
                    <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-gray-400">
                        <span>&copy; Japan X College</span>
                        <a href="/privacy" className="hover:text-gray-600 transition-colors">
                            プライバシーポリシー
                        </a>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <>
            <Header />
            <DashboardFeed />
        </>
    );
}
