"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PageLoading from "@/components/PageLoading";
import Link from "next/link";
import { ROLE_TEMPLATES } from "@/lib/community-role-templates";
import { useTranslation } from "@/lib/i18n/context";

interface Community {
    id: string;
    name: string;
    imageUrl: string | null;
    bannerUrl: string | null;
    slug: string;
    scope: string;
    isOfficial: boolean;
    _count: {
        posts: number;
    };
}

export default function AdminCommunitiesPage() {
    const { t } = useTranslation();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [slug, setSlug] = useState("");
    const [scope, setScope] = useState("ORGANIZER");
    const [permissionTemplateId, setPermissionTemplateId] = useState("standard");

    const fetchCommunities = useCallback(async () => {
        try {
            const res = await fetch("/api/communities");
            if (res.ok) {
                const data = await res.json();
                setCommunities(data);
            }
        } catch (error) {
            console.error("Error fetching communities:", error);
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
            fetchCommunities();
        }
    }, [fetchCommunities, router, session, status]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/communities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    slug,
                    scope,
                    permissionTemplateId
                }),
            });

            if (res.ok) {
                alert(t("admin.communities.created"));
                setShowCreate(false);
                setName("");
                setDescription("");
                setSlug("");
                fetchCommunities();
            } else {
                const error = await res.json();
                alert(t("admin.communities.error", { error: error.error }));
            }
        } catch (error) {
            console.error("Error creating community:", error);
            alert(t("admin.communities.errorGeneric"));
        }
    };

    if (loading) return <PageLoading showHeader={false} />;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{t("admin.communities.title")}</h1>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {showCreate ? t("admin.communities.cancel") : t("admin.communities.create")}
                    </button>
                </div>

                {showCreate && (
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h2 className="text-lg font-bold mb-4">{t("admin.communities.newTitle")}</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t("admin.communities.nameLabel")}</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t("admin.communities.slugLabel")}</label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t("admin.communities.descLabel")}</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t("admin.communities.scopeLabel")}</label>
                                <select
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                >
                                    <option value="ORGANIZER">{t("admin.communities.scopeOrganizer")}</option>
                                    {session?.user?.isAdmin && <option value="OFFICIAL">{t("admin.communities.scopeOfficial")}</option>}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t("admin.communities.permLabel")}</label>
                                <select
                                    value={permissionTemplateId}
                                    onChange={(e) => setPermissionTemplateId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                >
                                    {ROLE_TEMPLATES.map((template) => (
                                        <option key={template.id} value={template.id}>
                                            {template.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    {ROLE_TEMPLATES.find((tk) => tk.id === permissionTemplateId)?.description}
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                {t("admin.communities.createButton")}
                            </button>
                        </form>
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.communities.colName")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.communities.colSlug")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.communities.colType")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.communities.colPosts")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.communities.colActions")}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {communities.map((community) => (
                                <tr key={community.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{community.name}</div>
                                        {community.isOfficial && (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {t("admin.communities.badgeOfficial")}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {community.slug}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {community.scope}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {community._count.posts}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link href={`/communities/${community.slug}`} className="text-blue-600 hover:text-blue-900 mr-4">
                                            {t("admin.communities.view")}
                                        </Link>
                                        {/* Edit link could go here */}
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
