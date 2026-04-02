"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AdminApprovals from "@/components/admin/AdminApprovals";
import AdminTemplates from "@/components/admin/AdminTemplates";
import { useTranslation } from "@/lib/i18n/context";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("templates"); // Change default tab
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoints: Record<string, string> = {
        overview: "/api/admin/stats",
        users: "/api/admin/users",
        communities: "/api/admin/communities",
        events: "/api/admin/events",
        quests: "/api/admin/quests",
        moderation: "/api/admin/content",
      };
      const url = endpoints[activeTab];
      if (url) {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (activeTab === "overview") setStats(data);
          else if (activeTab === "users") setUsers(data);
          else if (activeTab === "communities") setCommunities(data);
          else setContent(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (activeTab !== "templates" && activeTab !== "approvals") {
        setLoading(false);
      } else {
        // These components manage their own loading
        setLoading(false);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteContent = async (type: string, id: string) => {
    if (!confirm(t("admin.page.confirmDelete"))) return;
    try {
      const res = await fetch(`/api/admin/content?type=${type}&id=${id}`, { method: "DELETE" });
      if (!res.ok) alert("削除に失敗しました");
    } catch { alert("エラーが発生しました"); }
    fetchData();
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(t("admin.page.confirmToggleAdmin", { status: String(!currentStatus) }))) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "toggleAdmin", value: !currentStatus })
      });
      if (res.ok) {
        alert(t("admin.page.updated"));
        fetchData();
      } else {
        alert(t("admin.page.updateFailed"));
      }
    } catch (e) {
      alert(t("admin.page.errorGeneric"));
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Admin</h1>
          <p className="text-gray-500">{t("admin.page.subtitle")}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { href: "/admin/stats", label: t("admin.page.stats") },
              { href: "/admin/points", label: t("admin.page.pointsAudit") },
              { href: "/admin/recurring-templates", label: t("admin.page.templates") },
              { href: "/admin/notifications", label: t("admin.page.notificationHistory") },
              { href: "/admin/credentials", label: t("admin.page.vcIssue") },
              { href: "/admin/api-keys", label: t("admin.page.apiKeys") },
              { href: "/admin/webhooks", label: "Webhook" },
              { href: "/admin/test-notification", label: t("admin.page.notificationTest") },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 overflow-x-auto">
          {["templates", "approvals", "dao-lite", "events", "quests", "overview", "users", "communities", "broadcast", "moderation"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab === "dao-lite" ? "DAO Lite" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
          {activeTab === "templates" && <AdminTemplates />}
          {activeTab === "approvals" && <AdminApprovals />}

          {activeTab === "dao-lite" && (
            <div className="space-y-6">
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">{t("admin.page.daoLiteTitle")}</h2>
                <p className="text-sm text-gray-600 mb-6">
                  {t("admin.page.daoLiteDesc")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/events/create"
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </span>
                    <div className="text-left">
                      <span className="font-semibold text-gray-900">{t("admin.page.createEvent")}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{t("admin.page.createEventDesc")}</p>
                    </div>
                    <span className="ml-auto text-gray-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
                  </Link>
                  <Link
                    href="/quests/create"
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    </span>
                    <div className="text-left">
                      <span className="font-semibold text-gray-900">{t("admin.page.createQuest")}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{t("admin.page.createQuestDesc")}</p>
                    </div>
                    <span className="ml-auto text-gray-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "overview" && stats && (
            <div className="">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <h3 className="text-gray-500 text-sm font-medium uppercase">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.userCount}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <h3 className="text-gray-500 text-sm font-medium uppercase">Communities</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.communityCount}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <h3 className="text-gray-500 text-sm font-medium uppercase">Events</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.eventCount}</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg text-center">
                  <h3 className="text-gray-500 text-sm font-medium uppercase">Points Issued</h3>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.totalPointsIssued.toLocaleString()} pt</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "broadcast" && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-bold mb-4">Send Global Notification</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!confirm(t("admin.page.confirmBroadcast"))) return;
                const formData = new FormData(e.currentTarget);
                const data = {
                  title: formData.get("title"),
                  message: formData.get("message"),
                  link: formData.get("link"),
                  type: "system"
                };
                const res = await fetch("/api/admin/broadcast", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data)
                });
                if (res.ok) {
                  alert(t("admin.page.broadcastSent"));
                  (e.target as any).reset();
                } else {
                  alert(t("admin.page.broadcastFailed"));
                }
              }}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                  <input name="title" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder={t("admin.page.broadcastPlaceholderTitle")} />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Message</label>
                  <textarea name="message" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32" placeholder={t("admin.page.broadcastPlaceholderMessage")}></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Link (Optional)</label>
                  <input name="link" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="/campaigns/123" />
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                  Broadcast to All Users
                </button>
              </form>
            </div>
          )}

          {activeTab === "moderation" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {content.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === 'event' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{item.content}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleDeleteContent(item.type, item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {content.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No content pending moderation</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t("admin.page.eventsCount", { count: content.length })}</span>
                <Link
                  href="/events/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {t("admin.page.newEvent")}
                </Link>
              </div>
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Official</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {content.length > 0 ? (
                    content.map((event: any) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(event.startAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">{event.title}</div>
                          <Link href={`/events/${event.id}`} target="_blank" className="text-xs text-blue-500 hover:underline">
                            View Page
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.owner?.name || event.organizerCommunity?.name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={async () => {
                              try {
                                const newVal = !event.isApproved;
                                const res = await fetch(`/api/admin/events/${event.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ isApproved: newVal })
                                });
                                if (res.ok) {
                                  // Update local state
                                  const updated = content.map((e: any) => e.id === event.id ? { ...e, isApproved: newVal } : e);
                                  setContent(updated);
                                } else {
                                  alert("Failed to update");
                                }
                              } catch (e) {
                                alert("Error updating event");
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${event.isApproved ? 'bg-blue-600' : 'bg-gray-200'}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${event.isApproved ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No events found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {activeTab === "quests" && (
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 text-center text-gray-500">{t("admin.page.loading")}</div>
              ) : (
                <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t("admin.page.questsCount", { count: content.length })}</span>
                <Link
                  href="/quests/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {t("admin.page.newQuest")}
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.page.colCreatedAt")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.page.colQuest")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.page.colCommunity")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.page.colStatus")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.page.colApplications")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.page.colActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {content.length > 0 ? (
                      content.map((quest: any) => (
                        <tr key={quest.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(quest.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-gray-900">{quest.title}</div>
                            <Link href={`/quests/${quest.id}`} target="_blank" className="text-xs text-blue-500 hover:underline">
                              {t("admin.page.openPage")}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {quest.community?.name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${quest.status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                              {quest.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {quest._count?.applications ?? 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link href={`/quests/${quest.id}`} className="text-blue-600 hover:text-blue-800">
                              {t("admin.page.detail")}
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          {t("admin.page.noQuests")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
                </>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.image && user.image !== "null" ? (
                            <Image className="h-10 w-10 rounded-full" src={user.image} alt="" width={40} height={40} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                              {user.name?.[0]}
                            </div>
                          )}
                          <div className="ml-4">
                            <Link href={`/admin/users/${user.id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">{user.name}</Link>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isAdmin ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "communities" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Community</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HP / Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {communities.map((comm: any) => (
                    <tr key={comm.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {comm.imageUrl && (
                            <Image
                              className="h-10 w-10 rounded-md object-cover mr-4"
                              src={comm.imageUrl}
                              alt=""
                              width={40}
                              height={40}
                            />
                          )}
                          <div>
                            <Link href={`/admin/c/${comm.id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">{comm.name}</Link>
                            <div className="text-xs text-gray-400">/{comm.slug || comm.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{comm.hpUrl || "-"}</div>
                        <div className="text-xs text-gray-400">/{comm.slug || comm.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/admin/c/${comm.id}`)}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
                        >
                          管理
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
