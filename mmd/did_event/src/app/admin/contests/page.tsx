"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PageLoading from "@/components/PageLoading";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";

interface Contest {
    id: string;
    title: string;
    status: string;
    scope: string;
    isOfficial: boolean;
    startAt: string;
    endAt: string;
    _count: {
        entries: number;
    };
}

export default function AdminContestsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useTranslation();
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [scope, setScope] = useState("ORGANIZER");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");

    const fetchContests = useCallback(async () => {
        try {
            const res = await fetch("/api/contests");
            if (res.ok) {
                const data = await res.json();
                setContests(data);
            }
        } catch (error) {
            console.error("Error fetching contests:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        if (session?.user) {
            fetchContests();
        }
    }, [fetchContests, router, session, status]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/contests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    scope,
                    startAt,
                    endAt,
                }),
            });

            if (res.ok) {
                alert(t("admin.contests.created"));
                setShowCreate(false);
                setTitle("");
                setDescription("");
                setStartAt("");
                setEndAt("");
                fetchContests();
            } else {
                const error = await res.json();
                alert(t("admin.contests.error", { error: error.error }));
            }
        } catch (error) {
            console.error("Error creating contest:", error);
            alert(t("admin.contests.errorGeneric"));
        }
    };

    if (loading) return <PageLoading showHeader={false} />;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{t("admin.contests.title")}</h1>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {showCreate ? t("admin.contests.cancel") : t("admin.contests.create")}
                    </button>
                </div>

                {showCreate && (
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h2 className="text-lg font-bold mb-4">{t("admin.contests.newTitle")}</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t("admin.contests.titleLabel")}</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t("admin.contests.descLabel")}</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t("admin.contests.startAt")}</label>
                                    <input
                                        type="datetime-local"
                                        value={startAt}
                                        onChange={(e) => setStartAt(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t("admin.contests.endAt")}</label>
                                    <input
                                        type="datetime-local"
                                        value={endAt}
                                        onChange={(e) => setEndAt(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t("admin.contests.scopeLabel")}</label>
                                <select
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                >
                                    <option value="ORGANIZER">{t("admin.communities.scopeOrganizer")}</option>
                                    {session?.user?.isAdmin && <option value="OFFICIAL">{t("admin.communities.scopeOfficial")}</option>}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                {t("admin.contests.createButton")}
                            </button>
                        </form>
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.contests.colTitle")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.contests.colStatus")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.contests.colPeriod")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.contests.colEntries")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.contests.colActions")}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {contests.map((contest) => (
                                <tr key={contest.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{contest.title}</div>
                                        {contest.isOfficial && (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {t("admin.contests.official")}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contest.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                                contest.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {contest.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(contest.startAt).toLocaleDateString()} - {new Date(contest.endAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {contest._count.entries}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link href={`/contests/${contest.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                                            {t("admin.contests.view")}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
