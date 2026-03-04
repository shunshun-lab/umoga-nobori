"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";

interface Event {
    id: string;
    title: string;
    startAt: string;
    endAt: string | null;
    location: string | null;
    format: "online" | "offline" | "hybrid";
    onlineUrl: string | null;
    imageUrl: string | null;
    description: string;
    ownerId?: string; // To check if organizer
}

export default function MyEventsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated") {
            fetchMyEvents();
        }
    }, [status, router]);

    const fetchMyEvents = async () => {
        try {
            const res = await fetch("/api/user/participations");
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error("Error fetching my events:", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.startAt) > now);
    const pastEvents = events.filter(e => new Date(e.startAt) <= now).reverse(); // Most recent past first

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white pb-20">
            <Header />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">マイカレンダー</h1>
                    <p className="text-gray-500">参加予定のイベントと過去の履歴を一括管理</p>
                </div>

                {/* Upcoming Events Section (Custom Display Matching Public Profile) */}
                <section className="mb-16">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-2xl">🚀</span>
                        これからのイベント (参加予定)
                    </h2>

                    {upcomingEvents.length === 0 ? (
                        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-10 text-center border border-white/50 shadow-sm">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 text-2xl">
                                📅
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">予定されているイベントはありません</h3>
                            <p className="text-gray-500 mb-6 text-sm">気になるイベントを見つけて、参加登録しましょう！</p>
                            <Link href="/events" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                                イベントを探す
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="group bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                    {/* Decorative Gradient Blob */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />

                                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                        {/* Date Badge */}
                                        <div className="flex-shrink-0 flex md:flex-col items-center justify-center gap-2 md:gap-0 bg-blue-50/50 rounded-2xl p-4 md:w-24 text-center border border-blue-100">
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                                {new Date(event.startAt).toLocaleDateString("en-US", { month: "short" })}
                                            </span>
                                            <span className="text-3xl font-extrabold text-gray-900">
                                                {new Date(event.startAt).getDate()}
                                            </span>
                                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                                {new Date(event.startAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}~
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${event.format === "online" ? "bg-green-100 text-green-700" :
                                                        event.format === "offline" ? "bg-orange-100 text-orange-700" :
                                                            "bg-purple-100 text-purple-700"
                                                    }`}>
                                                    {event.format === "online" ? "ONLINE" : event.format === "offline" ? "OFFLINE" : "HYBRID"}
                                                </span>
                                                {event.ownerId === session?.user?.id && (
                                                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">主催</span>
                                                )}
                                            </div>

                                            <Link href={`/events/${event.id}`} className="block">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                                                    {event.title}
                                                </h3>
                                            </Link>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                                {event.description}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100/50">
                                                <Link href={`/events/${event.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                                    詳細を見る <span className="text-xs">→</span>
                                                </Link>
                                                {(event.format === "online" || event.format === "hybrid") && event.onlineUrl && (
                                                    <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-sm">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                        参加リンク (Meet)
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Past Events Section (Simple List) */}
                {pastEvents.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-gray-500 mb-6 uppercase tracking-wider pl-2 border-l-4 border-gray-300">
                            過去のイベント履歴
                        </h2>
                        <div className="space-y-4">
                            {pastEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}`}
                                    className="block bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-500 font-bold text-xs flex-col leading-tight">
                                        <span className="text-[10px]">{new Date(event.startAt).toLocaleDateString("en-US", { month: "short" })}</span>
                                        <span className="text-lg">{new Date(event.startAt).getDate()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-700 truncate">{event.title}</h3>
                                        <p className="text-xs text-gray-500 truncate">{event.location || event.format}</p>
                                    </div>
                                    <div className="bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-full font-bold">
                                        参加済
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
