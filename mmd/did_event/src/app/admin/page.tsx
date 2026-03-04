"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AdminApprovals from "@/components/admin/AdminApprovals";
import AdminTemplates from "@/components/admin/AdminTemplates";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("templates"); // Change default tab
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (res.ok) setStats(data);
      } else if (activeTab === "users") {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (res.ok) setUsers(data);
      } else if (activeTab === "communities") {
        const res = await fetch("/api/admin/communities");
        const data = await res.json();
        if (res.ok) setCommunities(data);
      } else if (activeTab === "events") {
        const res = await fetch("/api/admin/events");
        const data = await res.json();
        if (res.ok) setContent(data);
      } else if (activeTab === "moderation") {
        const res = await fetch("/api/admin/content");
        const data = await res.json();
        if (res.ok) setContent(data);
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
    if (!confirm("本当に削除しますか？")) return;
    await fetch(`/api/admin/content?type=${type}&id=${id}`, { method: "DELETE" });
    fetchData(); // reload
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`ユーザーの管理者権限を ${!currentStatus} に変更しますか？`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "toggleAdmin", value: !currentStatus })
      });
      if (res.ok) {
        alert("更新しました");
        fetchData();
      } else {
        alert("更新に失敗しました");
      }
    } catch (e) {
      alert("エラーが発生しました");
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
          <p className="text-gray-500">プラットフォーム全体の管理を行います</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 overflow-x-auto">
          {["templates", "approvals", "events", "overview", "users", "communities", "broadcast", "moderation"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-4 font-medium transition-colors border-b-2 whitespace-nowrap capitalize ${activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
          {activeTab === "templates" && <AdminTemplates />}
          {activeTab === "approvals" && <AdminApprovals />}

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
                if (!confirm("全ユーザーに通知を送信しますか？")) return;
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
                  alert("送信しました");
                  (e.target as any).reset();
                } else {
                  alert("送信失敗");
                }
              }}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                  <input name="title" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="重要なお知らせ" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Message</label>
                  <textarea name="message" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32" placeholder="詳細を入力..."></textarea>
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
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
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
                            <div className="text-sm font-medium text-gray-900">{comm.name}</div>
                            <div className="text-xs text-gray-400">ID: {comm.id}</div>
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
                          Manage Maps
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
